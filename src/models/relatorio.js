const mongoose = require("mongoose");

const RelatorioSchema = new mongoose.Schema({
  venda: { type: mongoose.Schema.Types.ObjectId, ref: "Venda" },
  relatorio: String,
  data: { type: Date, default: Date.now },
});

const Relatorio = mongoose.model("Relatorio", RelatorioSchema);
module.exports = Relatorio;
