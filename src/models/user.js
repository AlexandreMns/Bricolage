const mongoose = require("mongoose");
const roleSchema = require("./role");
const { reset } = require("nodemon");

//Roles

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  imagem: {
    type: String,
    required: false,
  },
  telefone: {
    type: Number,
  },
  data: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: roleSchema,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  carrinho: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Carrinho",
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
