const Produto = require("../models/produto");
const Categoria = require("../models/categoria");
const Stock = require("../models/stock");
const Alert = require("../models/alert");

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
        sortOption = { price: 1 };
      } else if (sortBy === "desc") {
        sortOption = { price: -1 };
      }
      const data = await ProdutoModel.find(filtro).sort(sortOption);
      const produtos = data.map((data) => {
        return {
          id: data._id,
          titulo: data.titulo,
          categoria: data.categoria,
          description: data.description,
          price: data.price,
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

  /*const AddCarrinho = async (req, res, next) => {
    //Função addicionar ao carrinho
  };*/
  return {
    create,
    findOne,
    findAll,
    findById,
    update,
    removeById,
    productDelete,
    //AddCarrinho,
  };
}

module.exports = ProdutoController;
