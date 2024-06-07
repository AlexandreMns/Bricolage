const mongoose = require("mongoose");
const { shoppingCartSchema } = require("./carrinho");

const VendaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  carrinho: [shoppingCartSchema],
  data: {
    type: Date,
    default: Date.now,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

const Venda = mongoose.model("Venda", VendaSchema);
module.exports = Venda;
