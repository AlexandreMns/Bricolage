const mongoose = require("mongoose");

const VendaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produto",
    required: true,
  },
  quantidade: {
    type: Number,
    required: true,
  },
  data: {
    type: Date,
    default: Date.now,
  },
  totalPreço: {
    type: String,
  },
});

const Venda = mongoose.model("Venda", VendaSchema);
module.exports = Venda;
