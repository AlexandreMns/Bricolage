const Wishlist = require('../models/wishlist');
const Product = require('../models/produto');
const { decodeToken } = require('../utils/TokenUtil');


const createWishlist = async (req, res) => {
    try {
        const wishlist = new Wishlist({
            cliente: req.user._id,
            produtos: req.body.produtos,
        });
        await wishlist.save();
        res.status(201).send(wishlist);
    } catch (err) {
        res.status(500).send(err);
    }
}

const addToWishlist = async (req, res) => {
    try {
        const { productID } = req.params;
        const token = req.headers['x-access-token'];
        const decoded = await decodeToken(token);
        const userID = decoded.id;
        const wishlist = await Wishlist.findOne({ cliente: userID });
        const products = await Product.findById(productID);
        const exists = wishlist.produtos.find((product) => product._id == productID);

        if(!wishlist) {
            const newWishlist = new Wishlist({
                cliente: userID,
                produtos: [products]
            });
            await newWishlist.save();
            res.status(201).send(newWishlist);
        }

        if(exists) {
            return res.status(400).send({ message: 'Produto já está na lista de desejos' });
        }

        wishlist.produtos.push(products);
        await wishlist.save();
        res.status(200).send(wishlist);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const getWishlist = async (req, res) => {
    try {
        const token = req.headers['x-access-token'];
        const decoded = await decodeToken(token);
        const userID = decoded.id;
        const wishlist = await Wishlist.find({ cliente: userID });
        res.status(200).send(wishlist);
    } catch (err) {
        res.status(500).send(err);
    }
}

const removeFromWishList = async (req, res) => {
    try {
        
    } catch (err) {
        res.status(500).send(err);
    }
}



module.exports = {
    createWishlist,
    getWishlist,
    addToWishlist,
    removeFromWishList
}