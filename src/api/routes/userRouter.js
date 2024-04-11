const express = require("express");
const { model } = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello, World!");
});

router.post("/", (req, res) => {
  res.send(req.body);
});

module.exports = router;
