const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    produtos: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produto",
        },
    ],
    });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

module.exports = Wishlist;
