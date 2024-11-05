// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { createProduct } = require('../controllers/productController');
const upload = require('../middleware/upload');

// For single image upload
// router.post('/product', upload.single('image'), createProduct);

// For multiple image uploads
router.post('/product', upload.array('images', 5), createProduct); // Adjust the number as needed

module.exports = router;
