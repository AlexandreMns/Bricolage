const mongoose = require("mongoose");

const CategoriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
});

const Categoria = mongoose.model("Categoria", CategoriaSchema);

module.exports = Categoria;
