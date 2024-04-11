require("./routes/produtoRouter");

const routes = [
  {
    path: "/produto",
    router: require("./routes/produtoRouter"),
  },
  {
    path: "/user",
    router: require("./routes/userRouter"),
  },
];

module.exports = routes;
