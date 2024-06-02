var mongoose = require("mongoose");
let scopes = require("./scopes");

let Schema = mongoose.Schema;

let RoleSchema = new Schema({
  name: { type: String, required: true },
  scopes: [
    {
      type: String,
      enum: [scopes["Cliente"], scopes["Administrador"]],
    },
  ],
});

module.exports = RoleSchema;
