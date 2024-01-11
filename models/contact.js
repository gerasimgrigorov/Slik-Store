const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conctactSchema = new Schema({
    email: String,
    subject: String,
    message: String
})

module.exports = mongoose.model('Contact', conctactSchema)