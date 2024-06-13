// Importa o model
const Relatorio = require("../models/relatorio");
const Product = require("../models/produto");
const { ShoppingCart, CartItem } = require("../models/carrinho");
const newVenda = require("../models/venda");
const Stock = require("../models/stock");
const { createAlert } = require("../service/alertConfig");
const { decodeToken } = require("../utils/TokenUtil");

const User = require("../models/user");

function VendaController(VendaModel) {
  function findOne(id) {
    return new Promise(function (resolve, reject) {
      VendaModel.findById(id)
        .then((venda) => resolve(venda))
        .catch((err) => reject(err));
    });
  }

  function create(values) {
    let newVenda = new VendaModel(values);
    return save(newVenda);
  }

  function save(newVenda) {
    return new Promise(function (resolve, reject) {
      newVenda
        .save()
        .then(() => resolve("Venda criada"))
        .catch((err) => reject(`There is a problem with register ${err}`));
    });
  }

  function findById(id) {
    return new Promise(function (resolve, reject) {
      Relatorio.findById(id)
        .then((relatorio) => resolve(relatorio))
        .catch((err) => reject(err));
    });
  }

  function VendaID(id) {
    return new Promise(function (resolve, reject) {
      newVenda
        .findById(id)
        .then((venda) => resolve(venda))
        .catch((err) => reject(err));
    });
  }
  function RelatorioVenda(venda) {
    let relatorio = new Relatorio({
      produto: venda.produto._id,
      quantidade: venda.quantidade,
      cliente: venda.cliente,
      data: Date.now(),
      totalPreço: venda.totalPreço,
    });
    return save(relatorio);
  }

  const getRelatorio = async (req, res, next) => {
    try {
      const { id } = req.params;
      const VendaExists = await VendaModel.findById(id);
      if (!VendaExists) {
        return res.status(404).send("Venda não encontrada");
      }
      const relatorio = await Relatorio.find({ venda: id });
      res.status(200).json(relatorio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

  const findAll = async (req, res, next) => {
    try {
      const data = await VendaModel.find();
      const vendas = data.map((data) => {
        return {
          id: data._id,
          carrinho: data.carrinho,
          data: data.data,
        };
      });
      res.status(200).json(vendas);
    } catch (err) {
      next(err);
    }
  };

  const CriarVenda = async (req, res, next) => {
    try {
      let token = req.headers["x-access-token"];
      if (!token) {
        return res
          .status(400)
          .send({ auth: false, message: "No token provided" });
      }
      const decoded = await decodeToken(token);
      const clienteID = decoded.id;
      const user = await User.findOne({ _id: clienteID });
      const CartUser = await ShoppingCart.findById({ _id: user.carrinho });

      if (!CartUser) {
        return res.status(400).send({ message: "Carrinho vazio" });
      }

      for (let i = 0; i < CartUser.items.length; i++) {
        let id = CartUser.items[i].product._id;
        let product = await Product.findById(id);
        let quantidade = CartUser.items[i].quantity;

        let stocks = await Stock.find({
          product: id,
          quantity: { $gt: 0 },
        });

        if (!stocks || stocks.length === 0) {
          return res.status(400).json({
            message: "Nenhum estoque disponível para o produto " + id,
          });
        }

        // Calcular a quantidade total disponível no estoque
        let totalAvailable = stocks.reduce(
          (acc, stock) => acc + stock.quantity,
          0
        );

        // Verificar se a quantidade total disponível é suficiente
        if (quantidade > totalAvailable) {
          return res.status(400).json({
            message:
              "Quantidade disponível insuficiente para o produto " +
              id +
              ". Disponível: " +
              totalAvailable,
          });
        }

        // Deduzir a quantidade necessária dos registros de estoque na ordem apropriada (FIFO)
        let remainingQuantity = quantidade;
        for (let stock of stocks) {
          if (remainingQuantity <= 0) break;

          if (stock.quantity >= remainingQuantity) {
            stock.quantity -= remainingQuantity;
            remainingQuantity = 0;
          } else {
            remainingQuantity -= stock.quantity;
            stock.quantity = 0;
          }
          await stock.save();

          if (stock.quantity < product.quantidadeMinima) {
            createAlert(product._id);
          }
        }
      }

      // Criar a encomenda
      const total = CartUser.total;
      const venda = new newVenda({
        cliente: clienteID,
        carrinho: CartUser,
        data: Date.now(),
        totalPrice: total,
      });
      await venda.save();

      const relatorio = new Relatorio({
        data: Date.now(),
        venda: venda._id,
        price: venda.totalPreço,
        relatorio: "Venda",
      });

      for (let i = 0; i < CartUser.items.length; i++) {
        let item = CartUser.items[i]._id;
        const cartItem = await CartItem.findById(item);
        await cartItem.deleteOne();
      }

      await relatorio.save();
      await CartUser.deleteOne();

      res.status(201).json(venda);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };

  return {
    findOne,
    findAll,
    create,
    save,
    findById,
    RelatorioVenda,
    CriarVenda,
    VendaID,
    getRelatorio,
  };
}

module.exports = VendaController;
