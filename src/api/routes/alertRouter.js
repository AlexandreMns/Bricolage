const express = require("express");
const scopes = require("../../models/scopes");
const { deleteAlert, getAllAlerts } = require("../../controllers/alertController");
const authorize = require("../../middlewares/authorize");
const verifyToken = require("../../middlewares/verifyToken");

const router = express.Router();

// ==========================ADMIN ROUTES==========================

// Manage Alert
router.delete(
  "/admin/:id",
  verifyToken,
  authorize([scopes["Administrador"]]),
  deleteAlert
);

// Get All Alerts

router.get("/admin/", verifyToken, authorize([scopes["Administrador"]]), getAllAlerts);

module.exports = router;


