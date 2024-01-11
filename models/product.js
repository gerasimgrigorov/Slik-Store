const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    brand: String,
    model: String,
    images:[
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    type: {
        type: String,
        enum: ['hoodie', 'tshirt', 'shoes', 'pants', 'track', 'sweatshirt', 'jeans', 'polo', 'underwear', 'socks']
    }
})

module.exports = mongoose.model('Product', productSchema)