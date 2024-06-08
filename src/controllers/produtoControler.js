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
      const { page, limit ,sortBy, titulo } = req.query;
      if (titulo) {
        query.titulo = { $regex: titulo, $options: "i" };
      }

      let sortOption = {};
      if (sortBy === "asc") {
        sortOption = { price: 1 };
      } else if (sortBy === "desc") {
        sortOption = { price: -1 };
      }

      if(sortBy){
        const produtos = await Produto.find(query)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        const total = await Produto.countDocuments(query);
  
      res.json({
        produtos,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      });
      }else{
        const produtos = await Produto.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        const total = await Produto.countDocuments(query);
        
      res.json({
        produtos,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      });
      }
    } catch (err) {
      console.log(err);
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
        imagem: imagem.path,
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
      const product = await Produto.findOne({ _id: id });
      if (!product) {
        res.status(404);
        res.send("Produto não encontrado");
      } else {
        res.status(200);
        res.send(product);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Erro ao buscar produto" });
      next(err);
    }
  };

  
  function save(newProduct) {
    return new Promise(function (resolve, reject) {
      newProduct
        .save()
        .then(() => resolve("Product created"))
        .catch((err) => reject(err));
    });
  }
/*
  const ProductsWithFilters = async (req, res, next) => {
      const { page = 1, limit = 10, sort = "titulo", search } = req.query;
      try {
        const query = {};


        if (search) {
          const regex = new RegExp(search, "i");
          if (mongoose.Types.ObjectId.isValid(search)) {
            query._id = search;
          } else {
            query.$or = [{ titulo: regex }, { categoria: regex }];
          }
        }
        if(sort){
          const produtos = await Produto.find(query)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
  
          const total = await Produto.countDocuments(query);
    
        res.json({
          produtos,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        });
        }else{
          const produtos = await Produto.find(query)
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
  
          const total = await Produto.countDocuments(query);
    
        res.json({
          produtos,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        });
        }
      }catch(err){
        next(err);
      }
    };
*/
  return {
    create,
    findOne,
    findAll,
    findById,
    update,
    removeById,
    productDelete,
    //ProductsWithFilters,
  };
}

module.exports = ProdutoController;
