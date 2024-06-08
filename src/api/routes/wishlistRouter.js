const {
    createWishlist,
    getWishlist,
    removeFromWishList,
    addToWishlist
} = require('../../controllers/wishlistController');
const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const authorize = require('../../middlewares/authorize');
const scopes = require('../../models/scopes');

// ==========================USER ROUTES==========================

// Create Wishlist
router.post('/create', verifyToken, createWishlist);

// Get Wishlist
router.get('/get', verifyToken, getWishlist);

// Remove from Wishlist
router.delete('/remove/:id', verifyToken, removeFromWishList);

// Add to Wishlist
router.post('/add/:productID', verifyToken, addToWishlist);

module.exports = router;