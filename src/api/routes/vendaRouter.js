const express = require("express");
const Product = require("../../models/produto");
const UserModel = require("../../controllers/userController");
const VendaModel = require("../../models/venda");
const Produto = require("../../controllers/produtoControler");
const verifyToken = require("../../middlewares/verifyToken");
const authorize = require("../../middlewares/authorize");
const UserController = require("../../controllers/userController");
const scopes = require("../../models/scopes");
const newVenda = require("../../models/venda");
const ProdutoControler = Produto(Product);
const userController = UserController(UserModel);
const VendaController = require("../../controllers/vendaController");
const Relatorio = require("../../models/relatorio");
const vendaController = VendaController(VendaModel);

const router = express.Router();

router.get(
  "/relatorio/:id",
  verifyToken,
  authorize([scopes["Administrador"], scopes["Cliente"]]),
  (req, res) => {
    vendaController.findById(req.params.id).then((relatorio) => {
      res.status(200).send(relatorio);
    });
  }
);

router.get(
  "",
  verifyToken,
  authorize([scopes["Administrador"], scopes["Cliente"]]),
  vendaController.findAll
);

router.post(
  "",
  verifyToken,
  authorize([scopes["Administrador"], scopes["Cliente"]]),
  vendaController.CriarVenda
);

module.exports = router;
