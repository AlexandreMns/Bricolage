const { config } = require("../config");
const bcrypt = require("bcrypt");
const {
  decodeToken,
  comparePassword,
  createToken,
} = require("../utils/TokenUtil");
const { createCarrinho } = require("../service/cartConfig");
const { sendMail } = require("../service/emailConfig");
const UserModel = require("../models/user");
const { EmailType } = require("../utils/emailType");
const User = require("../models/user");
const { ShoppingCart, CartItem } = require("../models/carrinho");

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
        imagem: imagem.path,
        carrinho: newCart,
      });

      user.role = { name: "Cliente", scopes: ["Cliente"] };

      await newCart.save();
      await save(user);
      const token = createToken(user, config.expiresIn);

      res.status(201).json({ token: token.token });

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
      res.status(200).json(token);
    } catch (err) {
      next(err);
    }
  };

  const Update = async (req, res, next) => {
    try {
      //Não funciona se for so a mudar um parametro
      // IDEIA - poderia tirar os ifs fazendo assim com que o user pode mudar um so parametro sendo que o resto fica igual
      const token = req.headers["x-access-token"];
      const decoded = await decodeToken(token);
      const { id } = decoded.id;
      const imagem = req.file;
      const NewUser = req.body;

      const user = await User.findOne({ id: id });

      if (NewUser.name === user.name) {
        return res.status(409).json({ message: "Name is the same" });
      }
      if (NewUser.telefone === user.telefone) {
        return res.status(409).json({ message: "Telefone is the same" });
      }

      if (imagem.path === user.imagem) {
        return res.status(409).json({ message: "Imagem is the same" });
      }

      const UpdatedUser = await User.findOneAndUpdate({ id: id }, NewUser, {
        new: true,
      });
      const Updated = {
        id: UpdatedUser._id,
        name: UpdatedUser.name,
        email: UpdatedUser.email,
        telefone: UpdatedUser.telefone,
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
            if (!match) return reject("User não é válido");
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

      res
        .status(200)
        .json({ message: "Email sent, token: " + user.resetPasswordToken });
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
      if (token != user.resetPasswordToken) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

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
  };
}

module.exports = UserController;
