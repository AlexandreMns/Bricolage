const mongoose = require("mongoose");

const ProdutoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantidadeMinima: {
    type: Number,
    required: true,
  },
  imagem: {
    type: String,
  },
});

const Produto = mongoose.model("Produto", ProdutoSchema);
module.exports = Produto;
