const { ShoppingCart, CartItem } = require("../models/carrinho");
const { decodeToken } = require("../utils/TokenUtil");
const Product = require("../models/produto");
const User = require("../models/user");
/*
const calculateCartTotal = (items) => {
  if (!Array.isArray(items)) {
    throw new TypeError("items should be an array");
  }
  return items.reduce((total, cartItem) => {
    console.log(cartItem);
    const price = parseFloat(cartItem.totalPrice);
    if (isNaN(price)) {
      throw new TypeError(`Invalid totalPrice for cartItem: ${cartItem}`);
    }
    return total + price;
  }, 0);
};

async function AddToCart(cart, product, quantity, token) {
  if (!Array.isArray(cart)) {
    throw new TypeError("cart is not iterable");
  }

  cart.push(product);
  const total = calculateCartTotal(cart);

  const user = await decodeToken(token);
  const userCart = await ShoppingCart.findOne({ user: user._id });
  if (!userCart) {
    const newCart = new ShoppingCart({
      items: cart,
      total: total,
      user: user._id,
    });
    await newCart.save();
    return { cart, total };
  }
  userCart.items = cart;
  userCart.total = total;
  await userCart.save();
  console.log(userCart);
  return { cart, total };
}

module.exports = {
  AddToCart,
  calculateCartTotal,
};*/
