const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentSchema = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    name: String,
    number: Number,
    exp: String,
    cvv: Number
})

module.exports = mongoose.model('Payment', paymentSchema)