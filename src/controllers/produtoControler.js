const Produto = require("../models/produto");
const Categoria = require("../models/categoria");
const Stock = require("../models/stock");
const mongoose = require("mongoose");
const Alert = require("../models/alert");

function ProdutoController(ProdutoModel) {
  // MUdar find All
  const findAll = async (req, res, next) => {
    try {
      let query = {};
      const { page = 1, limit = 6, sortBy, titulo } = req.query;
  
      if (titulo) {
        query.titulo = { $regex: titulo, $options: "i" };
      }
  
      let sortOption = {};
      if (sortBy === "asc") {
        sortOption = { price: 1 };
      } else if (sortBy === "desc") {
        sortOption = { price: -1 };
      }
  
      const options = {
        skip: (parseInt(page) - 1) * parseInt(limit),
        limit: parseInt(limit),
      };
  
      let produtos;
      let total;
  
      if (sortBy) {
        produtos = await Produto.find(query)
          .sort(sortOption)
          .skip(options.skip)
          .limit(options.limit);
  
        total = await Produto.countDocuments(query);
      } else {
        produtos = await Produto.find(query)
          .skip(options.skip)
          .limit(options.limit);
  
        total = await Produto.countDocuments(query);
      }
  
      res.json({
        produtos,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Erro ao buscar produtos" });
      next(err);
    }
  };
  function findById(id) {
    return new Promise(function (resolve, reject) {
      ProdutoModel.findById(id)
        .then((product) => resolve(product))
        .catch((err) => reject(err));
    });
  }

  function update(id, product) {
    return new Promise(function (resolve, reject) {
      ProdutoModel.findByIdAndUpdate(id, product)
        .then((product) => resolve(product))
        .catch((err) => reject(err));
    });
  }

  function removeById(id) {
    return new Promise(function (resolve, reject) {
      ProdutoModel.findByIdAndDelete(id)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }
  const productDelete = async (req, res, next) => {
    try {
      const id = req.params.id;
      const product = await findById(id);
      if (!product) {
        res.status(404);
        res.send("Produto não encontrado");
      } else {
        await removeById(id);
        const stock = await Stock.find();
        const alerts = await Alert.find();

        for (let i = 0; i < stock.length; i++) {
          await Stock.findOneAndDelete({ product: id });
        }

        for (let i = 0; i < alerts.length; i++) {
          await Alert.findOneAndDelete({ product: id });
        }

        res.status(204).json("Produto deletado com sucesso");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Erro ao deletar produto" });
      next(err);
    }
  };

  const create = async (req, res, next) => {
    try {
      const { titulo, categoria, description, price, quantidadeMinima } =
        req.body;
      const imagem = req.file;

      if (!imagem) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const categoryExists = await Categoria.findById(categoria);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category" });
      }

      let newProduct = new ProdutoModel({
        titulo,
        categoria,
        description,
        price,
        quantidadeMinima,
        imagem: imagem.filename,
      });

      await save(newProduct);
      await Alert.create({
        product: newProduct._id,
        message: "Produto criado com sucesso, mas sem stock",
        stock: 0,
        quantity: 0,
        status: "active",
        createdAt: new Date(),
      });

      console.log("Produto:", JSON.stringify(req.body));
      res.status(201).send(newProduct);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Erro ao criar produto" });
      next(err);
    }
  };

  const findOne = async (req, res, next) => {
    try {
      const id = req.params.id;
  
      // Verifica se o ID é um ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
  
      const product = await Produto.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
  
      res.status(200).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar produto" });
      next(err);
    }
  }

  
  function save(newProduct) {
    return new Promise(function (resolve, reject) {
      newProduct
        .save()
        .then(() => resolve("Product created"))
        .catch((err) => reject(err));
    });
  }
  return {
    create,
    findOne,
    findAll,
    findById,
    update,
    removeById,
    productDelete,
  };
}

module.exports = ProdutoController;
