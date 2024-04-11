const express = require("express");
const { model } = require("mongoose");

const router = express.Router();
const produto = [];

router.get("/", (req, res) => {
  res.send(produto);
});

router.post("/", (req, res) => {
  const { name, price } = req.body;
  produto.push({ name, price });
  res.send(produto);
});

module.exports = router;
