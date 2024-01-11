const express = require('express')
const router = express.Router()
const AppError = require('../utilities/AppError')
const { productSchema, contactSchema, orderSchema } = require('../schemas')
const { isLoggedIn, isAdmin } = require('../middleware');
const catchAsync = require('../utilities/catchAsync')
const Order = require('../models/order')
const Payment = require('../models/payment')

const validateOrder = (req, res, next) => {
    const { error } = orderSchema.validate(req.body)

    if(error){
        const msg = error.details.map(e => e.message).join(' ')
        throw new AppError(400, msg)
    }
    next()
}

router.get('/', isAdmin, catchAsync( async(req, res) => {
const orders = await Order.find({}).populate({ path: 'user_id' }).populate({ path: 'products', populate : { path: 'product_id' } })
    res.render('orders', { orders })
}))

router.put('/:id', catchAsync( async(req, res) => {
    const { order_status } = req.body
    const order = await Order.findByIdAndUpdate(req.params.id, { order_status})
    res.redirect('/order')
}))

router.post('/', isLoggedIn, validateOrder, catchAsync( async(req, res) => {
    //product order
    const orderedProducts = req.session.cartProducts
    const { total_price, delivery, card } = req.body;
    const ordering = JSON.parse(orderedProducts); //converting from JSON 
    const products = ordering.map(product => ({
        product_id: product.current._id,
        quantity: product.quantity,
        size: product.size
    }));
    let user_id = null

    if(req.user){
        delivery.email = req.user.email;
        user_id = req.user._id
    }

    const order = new Order({user_id, products, total_price, delivery});
    await order.save()

    //payment
    const payment = new Payment(card);
    payment.order_id = order._id;
    await payment.save()

    req.session.cart = [];
    req.flash('success', 'You successfully placed your order!')
    res.redirect('/home');
}))

module.exports = router