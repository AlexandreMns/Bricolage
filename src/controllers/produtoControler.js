const Produto = require("../models/produto");
const ProdutoModel = require("../models/produto");
const path = require("path");

function ProdutoController(ProdutoModel) {
  // MUdar find All
  const findAll = async (req, res, next) => {
    try {
      let filtro = {};
      const { sortBy, titulo } = req.query;
      if (titulo) {
        filtro.titulo = { $regex: titulo, $options: "i" };
      }

      let sortOption = {};
      if (sortBy === "asc") {
        sortOption = { preço: 1 };
      } else if (sortBy === "desc") {
        sortOption = { preço: -1 };
      }
      const data = await ProdutoModel.find(filtro).sort(sortOption);
      const produtos = data.map((data) => {
        return {
          id: data._id,
          titulo: data.titulo,
          categoria: data.categoria,
          descrição: data.descrição,
          preço: data.preço,
          quantidadeMinima: data.quantidadeMinima,
          imagem: data.imagem,
        };
      });

      if (produtos.lengths === 0) {
        res.status(404);
        res.send("Nenhum produto encontrado");
      } else {
        res.status(200);
        res.send(produtos);
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

  const create = async (req, res, next) => {
    try {
      const { titulo, categoria, descrição, preço, quantidadeMinima } =
        req.body;
      const imagem = req.file;

      let newProduct = new ProdutoModel({
        titulo,
        categoria,
        descrição,
        preço,
        quantidadeMinima,
        imagem,
      });
      console.log("Produto:", JSON.stringify(req.body));
      await save(newProduct);

      if (imagem) {
        const FileName = newProduct._id + path.extname(imagem.originalname);
        newProduct.imagem = FileName;
        await newProduct.save();
      }
      res.status(201).send("Produto criado \n" + newProduct);
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
  return {
    create,
    findOne,
    findAll,
    findById,
    update,
    removeById,
  };
}

module.exports = ProdutoController;
