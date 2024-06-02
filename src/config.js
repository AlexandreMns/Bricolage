const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(process.env.MONGODB_CONNECTION)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.log("Database connection error");
      });
  }
}

const config = {
  secret: String(process.env.SECRET),
  expiresIn: Number(process.env.EXPIRESIN),
  saltRounds: Number(process.env.SALT_ROUNDS),
};

const db = new Database();
module.exports = { config, db };
