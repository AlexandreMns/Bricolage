const { ShoppingCart, CartItem } = require("../models/carrinho");
const Carrinho = require("../models/carrinho");
const { decodeToken } = require("../utils/TokenUtil");
const User = require("../models/user");
const Stock = require("../models/stock");
const Product = require("../models/produto");

const getCart = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(400).json({ error: "Token is missing" });
    }

    const decoded = await decodeToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let cart = await ShoppingCart.findById(user.carrinho);
    if (!cart) {
      // If the cart does not exist, create a new one
      cart = new ShoppingCart({
        items: [],
        total: 0,
        user: user._id,
      });
      await cart.save();
      user.carrinho = cart._id;
      await user.save();
      return res.status(200).json(cart);
    }

    // Check each cart item
    for (let i = cart.items.length - 1; i >= 0; i--) {
      const item = cart.items[i];
      const product = await Product.findById(item.product);
      if (!product) {
        // If the product no longer exists, remove the item from the cart
        const cartItem = await CartItem.findOneAndDelete({
          user: user._id,
          product: item.product,
        });
        if (cartItem) {
          cart.items.splice(i, 1);
        }
      }
    }

    // Recalculate the total
    cart.total = cart.items.reduce((total, item) => {
      return total + item.totalPrice;
    }, 0);

    await cart.save();
    return res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
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
    console.log(productID);
    const productExist = await Product.findOne({ _id: productID });
    const stock = await Stock.findOne({ product: productID });
    if (!productExist) {
      return res.status(404).send("Produto não encontrado");
    }

    if (CarrinhoUser === null) {
      const newCart = new ShoppingCart({
        items: [],
        total: 0,
        user: user._id,
      });
      await newCart.save();
      const newCartItem = new CartItem({
        user: user._id,
        product: productExist._id,
        quantity: quantity,
        totalPrice: productExist.price * quantity,
      });
      await newCartItem.save();
      newCart.items.push(newCartItem);
      const Total = newCart.items.reduce((total, Items) => {
        return total + Items.totalPrice;
      }, 0);
      newCart.total = Total;
      await newCart.save();
      user.carrinho = newCart._id;
      await user.save();
      res.status(201).send(newCart);
    } else {
      const cartItem = await CartItem.findOne({
        user: user._id,
        product: productID,
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        cartItem.totalPrice = productExist.price * cartItem.quantity;
        await cartItem.save();
        const itemIndex = CarrinhoUser.items.findIndex((item) =>
          item._id.equals(cartItem._id)
        );
        if (itemIndex > -1) {
          CarrinhoUser.items[itemIndex] = cartItem;
        } else {
          CarrinhoUser.items.push(cartItem);
        }

        const Total = CarrinhoUser.items.reduce((total, Items) => {
          return total + Items.totalPrice;
        }, 0);
        CarrinhoUser.total = Total;
        await CarrinhoUser.save();
        res.status(201).send(CarrinhoUser);
      } else {
        const newCart = new CartItem({
          user: user._id,
          product: productExist._id,
          quantity: quantity,
          totalPrice: productExist.price * quantity,
        });
        await newCart.save();
        CarrinhoUser.items.push(newCart);
        console.log("Carrinho:", CarrinhoUser);
        const Total = CarrinhoUser.items.reduce((total, cartItem) => {
          return total + cartItem.totalPrice;
        }, 0);
        CarrinhoUser.total = Total;
        await CarrinhoUser.save();
        res.status(201).send(CarrinhoUser);
      }
    }
  } catch (error) {
    console.error("Erro ao adicionar o carrinho:", error);
    res.status(500).send("Erro ao adicionar o carrinho");
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const { productID } = req.params;
    console.log("Produto ID:", productID);
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    const carrinho = user.carrinho;
    const CarrinhoUser = await ShoppingCart.findById(carrinho);
    const cartItem = await CartItem.findOne({
      user: user._id,
      product: productID,
    });
    if (!cartItem) {
      throw new Error("Carrinho não encontrado");
    }
    await cartItem.deleteOne();
    const itemIndex = CarrinhoUser.items.findIndex((item) =>
      item._id.equals(cartItem._id)
    );
    if (itemIndex > -1) {
      CarrinhoUser.items.splice(itemIndex, 1);
    }
    const Total = CarrinhoUser.items.reduce((total, Items) => {
      return total + Items.totalPrice;
    }, 0);
    CarrinhoUser.total = Total;
    await CarrinhoUser.save();
    res.status(204).send("Produto deletado com sucesso");
  } catch (error) {
    console.error("Erro ao deletar o carrinho:", error);
    res.status(500).send("Erro ao deletar o carrinho");
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { productID } = req.params;
    const { quantity } = req.body;
    const token = req.headers["x-access-token"];
    const Decoded = await decodeToken(token);
    const user = await User.findOne({ _id: Decoded.id });
    const carrinho = user.carrinho;
    const product = await Product.findById(productID);
    const CarrinhoUser = await ShoppingCart.findById(carrinho);
    const cartItem = await CartItem.findOne({
      user: user._id,
      product: productID,
    });

    if (!cartItem) {
      return res.status(400).send("Item não encontrado");
    }
    if (!CarrinhoUser) {
      return res.status(400).send("Carrinho não encontrado");
    }
    if (!product) {
      const itemIndex = CarrinhoUser.items.findIndex((item) =>
        item._id.equals(cartItem._id)
      );
      if (itemIndex > -1) {
        CarrinhoUser.items.splice(itemIndex, 1);
      }
      await cartItem.deleteOne();

      // Recalcular o total
      const Total = CarrinhoUser.items.reduce((total, Items) => {
        return total + Items.totalPrice;
      }, 0);
      CarrinhoUser.total = Total;
      await CarrinhoUser.save();
      return res.status(200).send(CarrinhoUser);

    }
    if (quantity < 0) {
      return res.status(400).send("Quantidade inválida");
    }

    if (quantity === 0) {
      // Remover o item do carrinho
      const itemIndex = CarrinhoUser.items.findIndex((item) =>
        item._id.equals(cartItem._id)
      );
      if (itemIndex > -1) {
        CarrinhoUser.items.splice(itemIndex, 1);
      }
      await cartItem.deleteOne();

      // Recalcular o total
      const Total = CarrinhoUser.items.reduce((total, Items) => {
        return total + Items.totalPrice;
      }, 0);
      CarrinhoUser.total = Total;
      await CarrinhoUser.save();

      return res.status(200).send(CarrinhoUser);
    }

    // Atualizar a quantidade e o preço total do item no carrinho
    cartItem.quantity = quantity;
    cartItem.totalPrice = product.price * quantity;
    await cartItem.save();

    // Atualizar o item no carrinho
    const itemIndex = CarrinhoUser.items.findIndex((item) =>
      item._id.equals(cartItem._id)
    );
    if (itemIndex > -1) {
      CarrinhoUser.items[itemIndex] = cartItem;
    } else {
      CarrinhoUser.items.push(cartItem);
    }

    // Recalcular o total do carrinho
    const Total = CarrinhoUser.items.reduce((total, Items) => {
      return total + Items.totalPrice;
    }, 0);
    CarrinhoUser.total = Total;
    await CarrinhoUser.save();

    res.status(200).send(CarrinhoUser);
  } catch (error) {
    console.error("Erro ao atualizar o carrinho:", error);
    res.status(500).send("Erro ao atualizar o carrinho");
  }
};


module.exports = {
  getCart,
  deleteCart,
  AddCarrinho,
  updateCart,
};
