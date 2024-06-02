const express = require("express");
const scopes = require("../../models/scopes");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../../controllers/categoryController");
const authorize = require("../../middlewares/authorize");
const verifyToken = require("../../middlewares/verifyToken");

const router = express.Router();

// ==========================PUBLIC ROUTES==========================

// List All Categories
router.get("/categorias", getAllCategories);

// ==========================ADMIN ROUTES==========================

// Create Category
router.post(
  "/admin/categorias",
  verifyToken,
  authorize([scopes["Administrador"]]),
  createCategory
);

// Update Category
router.put(
  "/admin/categorias/:categoryId",
  verifyToken,
  authorize([scopes["Administrador"]]),
  updateCategory
);

// Delete Category
router.delete(
  "/admin/categorias/:categoryId",
    verifyToken,
  authorize([scopes["Administrador"]]),
  deleteCategory
);

module.exports = router;