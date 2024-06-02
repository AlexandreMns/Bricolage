const express = require("express");
const scopes = require("../../models/scopes");
const {
  addStockEntry,
  getStockEntriesForProduct,
} = require("../../controllers/stockController");
const authorize = require("../../middlewares/authorize");
const verifyToken = require("../../middlewares/verifyToken");

const router = express.Router();

// ==========================ADMIN ROUTES==========================

// Add Stock Entry
router.post(
  "/admin/products/:productId/stock",
    verifyToken,
  authorize([scopes["Administrador"]]),
  addStockEntry
);

// Get Stock Entries for Product
router.get(
  "/admin/products/:productId/stock",
  verifyToken,
  authorize([scopes["Administrador"]]),
  getStockEntriesForProduct
);

module.exports = router;