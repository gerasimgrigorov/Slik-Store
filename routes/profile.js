const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utilities/catchAsync')
const User = require('../models/user')
const Order = require('../models/order')
const Wishlist = require('../models/wishlist')
const Product = require('../models/product')

router.get('/info', isLoggedIn, (req, res) => {
    res.render('profile')
})

router.get('/delivery', isLoggedIn, catchAsync( async (req, res) => {
    const user_id = req.user._id
    const orders = await Order.find({ user_id })
    res.render('delivery', { orders })
}))

router.get('/wishlist', isLoggedIn, catchAsync( async (req, res) => {
    const user = req.user._id
    const wishlist = await Wishlist.findOne({ user })
    const products = []
    if(wishlist) {
        for(let item of wishlist.products){
            const product = await Product.findOne(item)
            products.push(product)
        }
    }

    res.render('wishlist', { products })
}))

router.put('/:id', isLoggedIn, catchAsync( async(req, res) => {
    const { id } = req.params
    const currUser = await User.findByIdAndUpdate(id, { ...req.body })
    await currUser.save()
    res.redirect('/profile/info')
}))

module.exports = router