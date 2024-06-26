const { config } = require("../config");
const bcrypt = require("bcrypt");
const Wishlist = require("../models/wishlist");
const mongoose = require("mongoose");
const {
  decodeToken,
  comparePassword,
  createToken,
} = require("../utils/TokenUtil");
const { sendMail } = require("../service/emailConfig");
const UserModel = require("../models/user");
const { EmailType } = require("../utils/emailType");
const User = require("../models/user");
const path = require("path");
const { ShoppingCart, CartItem } = require("../models/carrinho");
const { StatusCodes } = require("http-status-codes");

function UserController() {
  const create = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const imagem = req.file;
      console.log("Body " + JSON.stringify(req.body));

      const userExists = await User.findOne({ email: email });
      if (userExists) {
        return next("User already exists");
      }
      const hashPassword = await bcrypt.hash(password, config.saltRounds);
      const newCart = new ShoppingCart({
        items: [],
        total: 0,
      });

      const user = new UserModel({
        name,
        email,
        password: hashPassword,
        imagem: imagem ? imagem.filename : '',
        carrinho: newCart,
      });

      user.role = { name: "Cliente", scopes: ["Cliente"] };

      await newCart.save();
      await save(user);
      await Wishlist.create({ cliente: user._id, produtos: [] });
      const token = createToken(user, config.expiresIn);
      const userToken = {
        token: token.token,
        user: {
          role: user.role.name,
        },
      };

      res.status(201).json({ userToken });

      sendMail(EmailType.Welcome, user.email, res, token.token);
    } catch (err) {
      next(err);
    }
  };

  function createPassword(user) {
    return bcrypt.hash(user.password, config.saltRounds);
  }

  function save(model) {
    return new Promise(function (resolve, reject) {
      model
        .save()
        .then(() => resolve("User created"))
        .catch((err) => reject(`There is a problem with register ${err}`));
    });
  }

  const UserInfo = async (req, res, next) => {
    try {
      let token = req.headers["x-access-token"];

      if (!token) {
        return res
          .status(401)
          .send({ auth: false, message: "No token provided." });
      }

      const decoded = await decodeToken(token);
      const Data = await UserModel.findOne({ _id: decoded.id });
      const User = {
        id: Data._id,
        name: Data.name,
        email: Data.email,
        telefone: Data.telefone,
        role: Data.role.name,
        imagem: Data.imagem,
        carrinho: Data.carrinho,
      };
      res.status(202).send(User);
    } catch (err) {
      next(err);
    }
  };

  const Login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await findUser({ email, password });
      const token = createToken(user);
      const userToken = {
        token: token.token,
        user: {
          role: user.role.name,
        },
      };
      res.status(200).json(userToken);
    } catch (err) {
      next(err);
    }
  };

  const Update = async (req, res, next) => {
    try {
      const token = req.headers["x-access-token"];
      const decoded = await decodeToken(token);
      const userId = decoded.id;
      const imagem = req.file;
      const NewUser = req.body;
      
      const user = await User.findOne({ _id: userId });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Atualiza somente os campos fornecidos
      const updateFields = {};
      if (NewUser.name) updateFields.name = NewUser.name;
      if (NewUser.email) updateFields.email = NewUser.email;
      if (NewUser.telefone) updateFields.telefone = NewUser.telefone;
      if (imagem) updateFields.imagem = imagem.filename;
  
      const UpdatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: updateFields },
        { new: true }
      );
  
      const Updated = {
        id: UpdatedUser._id,
        name: UpdatedUser.name,
        email: UpdatedUser.email,
        telefone: UpdatedUser.telefone,
        imagem: UpdatedUser.imagem,
      };
      
      res.status(200).json(Updated);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  function findUser({ email, password }) {
    return new Promise(function (resolve, reject) {
      UserModel.findOne({ email: email })
        .then((user) => {
          if (!user) return reject("Utilizador não encontrado");
          return comparePassword(password, user.password).then((match) => {
            if (!match) return reject("Palavra passe errada");
            return resolve(user);
          });
        })
        .catch((err) => {
          console.log(err);
          return reject(err);
        });
    });
  }

  const findAll = async (req, res, next) => {
    try {
      const data = await UserModel.find();
      const users = data.map((data) => {
        return {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role.name,
        };
      });
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };

  const forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        return next("User not found");
      }
      const token = createToken(user, config.expiresIn);
      user.resetPasswordToken = token.token;
      user.resetPasswordExpires = Date.now() + 3600000;

      await user.save();
      sendMail(EmailType.ResetPassword, user.email, res, token);

      res.status(200).json({ message: "Email sent" });

    } catch (err) {
      next(err);
      res.status(500).json({ message: "Error sending email" });
    }
  };

  const UserWithFilters = async (req, res, next) => {
    const { page = 1, limit = 10, sort = "name", role, search } = req.query;
    try {
      const query = {};

      if (role) {
        query["role.name"] = role;
      }

      if (search) {
        const regex = new RegExp(search, "i");
        if (mongoose.Types.ObjectId.isValid(search)) {
          query._id = search;
        } else {
          query.$or = [{ name: regex }, { email: regex }];
        }
      }
      if (sort) {
        const users = await User.find(query)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
          users,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        });
      } else {
        const users = await User.find(query)
          .skip((page - 1) * limit)
          .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
          users,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        });
      }
    } catch (err) {
      next(err);
    }
  };

  const resetPassword = async (req, res, next) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      const token = req.headers["x-access-token"];
      const decoded = await decodeToken(token);
      const user = await User.findOne({ _id: decoded.id });

      if (newPassword !== confirmPassword) {
        return next("Passwords don't match");
      }

      const oldPassword = await bcrypt.compare(newPassword, user.password);
      if (oldPassword) {
        return next("New password must be different from the old password");
      }

      try {
        user.password = await bcrypt.hash(newPassword, config.saltRounds);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Password updated" });
      } catch (err) {
        console.log(err);
        next(err);
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
  return {
    create,
    Login,
    User,
    resetPassword,
    findUser,
    UserInfo,
    createPassword,
    findAll,
    forgotPassword,
    Update,
    UserWithFilters,
  };
}

module.exports = UserController;
