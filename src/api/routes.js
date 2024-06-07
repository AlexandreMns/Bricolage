const routes = [
  {
    path: "/produtos",
    router: require("./routes/produtoRouter"),
  },
  {
    path: "/user",
    router: require("./routes/userRouter"),
  },
  {
    path: "/venda",
    router: require("./routes/vendaRouter"),
  },
  {
    path: "/stock",
    router: require("./routes/stockRouter"),
  },
  {
    path: "/categoria",
    router: require("./routes/categoryRouter"),
  },
  {
    path: "/alert/",
    router: require("./routes/alertRouter"),
  },
  {
    path: "/cart",
    router: require("./routes/cartRouter"),
  },
];

module.exports = routes;
