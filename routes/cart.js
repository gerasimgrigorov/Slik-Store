const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utilities/catchAsync')
const Product = require('../models/product')

const validateCart = (req, res, next) => {
  if (!req.session.cart[0]) {
    return res.redirect('/')
  }
  next()
}

router.get('/', validateCart, catchAsync( async(req, res) => {
  let totalPrice = 0; 
  const addedProducts = [];
  if(req.session.cart){
    for(let product of req.session.cart){
      const current = await Product.findById(product.id);
      const quantity = product.quantity;
      const size = product.size;
      totalPrice += current.price * quantity;
      addedProducts.push({ current, quantity, size });
    }
  }
  res.render('cart', {addedProducts, totalPrice});
}))

router.post('/delivery', async(req, res) => {
  const { totalPrice, addedProducts } = req.body
  const total = parseFloat(totalPrice)
  req.session.cartProducts = addedProducts
  res.render('details', { total })
})

router.post('/add', catchAsync( async(req, res) => {
  let { size, id, quantity = 1 } = req.body;
  let existSize = false;
  if(!req.session.cart){
    req.session.cart = []
  }
  for(let product of req.session.cart){
    if(product.size === size && product.id === id){
      product.quantity++;
      existSize = true;
      break;
    }
  }
  if(!existSize){
    req.session.cart.push({size, id, quantity})
  }
  res.redirect(`/products/${id}`);
}));

router.delete('/product', (req, res) => {
  const { id, size } = req.body;

  const indexToRemove = req.session.cart.findIndex(item => item.id === id && item.size === size); //going though every item and find the index and size which are matching
  if (indexToRemove !== -1) {
    req.session.cart.splice(indexToRemove, 1);
  }

  res.redirect('/cart');
});

module.exports = router 