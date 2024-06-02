// Importa o model
const Relatorio = require("../models/relatorio");
const Product = require("../models/produto");
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
    async (req, res) => {
      try {
        const { id, quantidade } = req.body;

        let token = req.headers["x-access-token"];
        if (!token) {
          return res
            .status(400)
            .send({ auth: false, message: "No token provided" });
        }
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
        // Verificar se há quantidade suficiente disponível
        if (quantidade > produtoExistente.quantidadeDisponivel) {
          return res
            .status(400)
            .json({ message: "Quantidade disponível insuficiente " });
        }

        // Criar a encomenda
        const precoTotal = produtoExistente.preço * quantidade;
        const precoTotalFormatado = `${precoTotal} €`;
        const venda = new newVenda({
          produto: produtoExistente._id,
          quantidade: quantidade,
          cliente: cliente,
          data: Date.now(),
          totalPreço: precoTotalFormatado,
        });
        produtoExistente.quantidadeDisponivel -= quantidade;
        await produtoExistente.save();

        console.log("Venda:", venda);
        const novaVenda = await venda.save();

        vendaController.RelatorioVenda(novaVenda);

        res.status(201).json(novaVenda);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao processar a encomenda" });
      }
    };
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
