const express = require("express");
const scopes = require("../../models/scopes");
const {
  getCart,
  AddCarrinho,
  deleteCart,
  updateCart,
} = require("../../controllers/cartController");
const authorize = require("../../middlewares/authorize");
const verifyToken = require("../../middlewares/verifyToken");

const router = express.Router();

// ==========================PUBLIC ROUTES==========================

// List All Cart
router.get("/items", verifyToken, getCart);

//Add to Cart
router.post("/add/:productID", verifyToken, AddCarrinho);

//Delete Cart
router.delete("/delete/:productID", verifyToken, deleteCart);

//Update Cart
router.put("/update/:productID", verifyToken, updateCart);

module.exports = router;
