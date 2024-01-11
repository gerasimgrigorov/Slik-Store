const mongoose = require('mongoose')
const Product = require('../models/product')
const Cart = require('../models/cart')
const User = require('../models/user')

mongoose.connect('mongodb://127.0.0.1:27017/slik-store')
    .then(() => {
        console.log('MONGOOSE CONNECTED')
    })
    .catch((e) => {
        console.log('ERROR', e)
    })

const seedDB = async() => {
    await Product.deleteMany({});
    const product = new Product({
    brand: 'Bape',
    model: 'Gangsta G\'s',
    images:[
        {
            url: 'https://res.cloudinary.com/dfkaodmtf/image/upload/v1700915419/cld-sample-5.jpg' 
        }
    ],
    price: 44,
    type: 'shoes'
    })

    await product.save()
}

const changeDB = async() => {
    const product = await Cart.findByIdAndDelete('65775ea26ca14b5f721957cf')

    await product.save()
}

changeDB()
    .then(() => {
        console.log('Completed')
    })