const { ShoppingCart, CartItem } = require("../models/carrinho");
const Carrinho = require("../models/carrinho");
const { decodeToken } = require("../utils/TokenUtil");
const User = require("../models/user");
const { AddToCart, createCarrinho } = require("../service/cartConfig");
const Product = require("../models/produto");

const getCart = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    const carrinho = user.carrinho;
    const cart = await ShoppingCart.findById(carrinho);
    const Cart = {
      items: cart.items,
      total: cart.total,
    };
    res.status(200).json(Cart);
  } catch (error) {
    console.error("Erro ao buscar os carrinhos:", error);
  }
};

const AddCarrinho = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productID } = req.params;
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    const carrinho = user.carrinho;
    const CarrinhoUser = await ShoppingCart.findById(carrinho);
    const productExist = await Product.findById(productID);
    if (!productExist) {
      return res.status(404).send("Produto não encontrado");
    }

    const newCart = new CartItem({
      product: productExist._id,
      quantity: quantity,
      totalPrice: productExist.price * quantity,
    });

    await newCart.save();
    CarrinhoUser.items.push(newCart);
    const Total = CarrinhoUser.items.reduce((total, cartItem) => {
      return total + cartItem.totalPrice;
    }, 0);

    CarrinhoUser.total = Total;

    await CarrinhoUser.save();
    res.status(201).json(CarrinhoUser);
  } catch (error) {
    console.error("Erro ao adicionar o carrinho:", error);
    res.status(500).send("Erro ao adicionar o carrinho");
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const productId = req.params.id;
    console.log("Produto ID:", productId);
    const cart = await Carrinho.findOneAndDelete({ product: productId });
    if (!cart) {
      throw new Error("Carrinho não encontrado");
    }
    res.status(204).send("Carrinho deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar o carrinho:", error);
    res.status(500).send("Erro ao deletar o carrinho");
  }
};

module.exports = {
  getCart,
  deleteCart,
  AddCarrinho,
};
