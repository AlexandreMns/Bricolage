const express = require("express");
const Product = require("../../models/produto");
const UserModel = require("../../controllers/userController");
const Produto = require("../../controllers/produtoControler");
const verifyToken = require("../../middlewares/verifyToken");
const upload = require("../../middlewares/upload");
const authorize = require("../../middlewares/authorize");
const scopes = require("../../models/scopes");

const ProdutoControler = Produto(Product);

const router = express.Router();

//Conseguir Produtos
router.get("/all", verifyToken, ProdutoControler.findAll);

//Criar Produto
router.post(
  "/criar",
  verifyToken,
  authorize([scopes["Administrador"]]),
  upload.single("imagem"),
  ProdutoControler.create
);
//Conseguir produto por id
router.get("/:id", ProdutoControler.findOne);

//Update produto
router.put(
  "/edit/:id",
  verifyToken,
  authorize([scopes["Administrador"]]),
  (req, res, next) => {
    const body = req.body;
    console.log("Produto:", body);
    ProdutoControler.update(req.params.id, body)
      .then((produto) => {
        res.status(200);
        res.send(produto);
        next();
      })
      .catch((err) => {
        res.status(404);
        next();
      });
  }
);

//Delete produto
router.delete(
  "/delete/:id",
  verifyToken,
  authorize([scopes["Administrador"]]),
  ProdutoControler.productDelete
);

module.exports = router;
