const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require("./api/routes");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3001;
const app = express();
const hostname = "localhost";

app.use("/uploads", express.static(path.join(__dirname, "uploads")));~

app.use(cors());

app.use(express.json());

for (const route of routes) {
  app.use(route.path, route.router);
}

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
