const express = require("express");
require("./config");
const routes = require("./api/routes");

const app = express();
const port = 3000;
const hostname = "localhost";

app.use(express.json());

for (const route of routes) {
  app.use(route.path, route.router);
}

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
