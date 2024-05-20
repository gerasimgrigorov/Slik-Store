const express = require('express')
const router = express.Router()
const AppError = require('../utilities/AppError')
const { productSchema, contactSchema, orderSchema } = require('../schemas')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { isAdmin } = require('../middleware');
const catchAsync = require('../utilities/catchAsync')
const Product = require('../models/product')

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body)

  if(error){
    const msg = error.details.map(e => e.message).join(' ')
    throw new AppError(400, msg)
  }
  next()
}

router.get('/', catchAsync( async(req, res) => {
  const products = await Product.find({});
  res.render('products', { products });
}))

router.get('/:id', catchAsync( async(req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  const featured = await Product.aggregate([{ $sample: { size: 4 } }]);
  res.render('show', { product, featured } );
}))

router.delete('/:id', isAdmin, catchAsync( async(req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  res.redirect('/new');
}))

router.post('/', isAdmin, upload.array('image', 4), validateProduct, catchAsync( async(req, res, next) => {
  const product = new Product(req.body.product);
  product.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
  await product.save();
  res.redirect('/products');
}))

module.exports = router