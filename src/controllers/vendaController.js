// Importa o model
const Relatorio = require("../models/relatorio");
const Product = require("../models/produto");
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

  const findAll = async (req, res, next) => {
    try {
      const data = await VendaModel.find();
      const vendas = data.map((data) => {
        return {
          id: data._id,
          produto: data.produto,
          quantidade: data.quantidade,
          cliente: data.cliente,
          data: data.data,
          totalPreço: data.totalPreço,
        };
      });
      res.status(200).json(vendas);
    } catch (err) {
      next(err);
    }
  };

  const CriarVenda = async (req, res, next) => {
    try {
      const { id, quantidade } = req.body;

      let token = req.headers["x-access-token"];
      if (!token) {
        return res
          .status(400)
          .send({ auth: false, message: "No token provided" });
      }
      console.log();
      const decoded = await decodeToken(token);
      const clienteID = decoded.id;

      const cliente = User.findOne({ _id: clienteID });

      // Verificar se o produto existe
      const produtoExistente = await Product.findOne({
        _id: id,
      });

      if (!produtoExistente) {
        return res.status(400).json({ message: "Produto não encontrado" });
      }

      let stock = await Stock.findOne({ product: id, quantity: { $gt: 0 } });

      //Ver se existe produtos em stock
      if (!stock || stock.quantity === null) {
        return res
          .status(400)
          .json({ message: "Stock inválido ou não disponível" });
      }
      // Verificar se há quantidade suficiente disponível
      if (quantidade > stock.quantity) {
        return res
          .status(400)
          .json({ message: "Quantidade disponível insuficiente " });
      }

      // Criar a encomenda
      const precoTotal = produtoExistente.price * quantidade;
      const precoTotalFormatado = `${precoTotal} €`;
      const venda = new newVenda({
        produto: produtoExistente._id,
        quantidade: quantidade,
        cliente: clienteID,
        data: Date.now(),
        totalPreço: precoTotalFormatado,
      });

      stock.quantity -= quantidade;

      await stock.save();
      await produtoExistente.save();
      const novaVenda = await venda.save();

      const relatorio = new Relatorio({
        produto: produtoExistente._id,
        quantidade: quantidade,
        cliente: clienteID,
        data: Date.now(),
        totalPreço: precoTotal,
      });
      save(relatorio);
      if (stock.quantity < produtoExistente.quantidadeMinima) {
        createAlert(produtoExistente._id);
      }

      res.status(201).json(novaVenda);
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
  };
}

module.exports = VendaController;
