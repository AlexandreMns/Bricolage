const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(process.env.DBURL)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.log("Database connection error");
      });
  }
}

const config = {
  secret: process.env.SECRET,
  expiresIn: Number(process.env.EXPIRESIN),
  saltRounds: 10,
};

const db = new Database();

module.exports = config;
module.exports = db;
