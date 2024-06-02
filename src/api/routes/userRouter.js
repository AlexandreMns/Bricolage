const express = require("express");
const UserController = require("../../controllers/userController");
const UserModel = require("../../models/user");
const authorize = require("../../middlewares/authorize");
const verifyToken = require("../../middlewares/verifyToken");
const scopes = require("../../models/scopes");
const upload = require("../../middlewares/upload");
const multer = require("multer");
const userController = UserController(UserModel);

const router = express.Router();

//Register
router.post("/register", upload.single("imagem"), userController.create);

//Login
router.post("/login", userController.Login);

//Conseguir user informações
router.get(
  "/profile",
  verifyToken,
  authorize([scopes["Cliente"], scopes["Administrador"]]),
  userController.UserInfo
);

//Todos os clientes
router.get(
  "/AllUsers",
  verifyToken,
  authorize([scopes["Administrador"]]),
  userController.findAll
);

//Alterar utilizador
router.put("/profile/", verifyToken, userController.Update);

//Mudar de password
router.put(
  "/resetpassword",
  verifyToken,
  //Validator("resetPassword"),
  userController.resetPassword
);

//Esqueceu a senha - enviar email
router.post(
  "/forgot-password",
  verifyToken,
  authorize([scopes["Cliente"], scopes["Administrador"]]),
  userController.forgotPassword
);

module.exports = router;
