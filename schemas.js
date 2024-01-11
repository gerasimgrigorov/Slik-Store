const Joi = require('joi')

module.exports.productSchema = Joi.object({
    product: Joi.object({
        brand: Joi.string().required().alphanum(),
        model: Joi.string().required(),
        price: Joi.number().required().min(0),
        type: Joi.string().required().alphanum()
    }).required()
})

module.exports.contactSchema = Joi.object({
    contact: Joi.object({
        email: Joi.string().required(),
        subject: Joi.string().required().min(10),
        message: Joi.string().required().min(20)
    }).required()
})

module.exports.orderSchema = Joi.object({
    delivery: Joi.object({
        email: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.number().required(),
        address: Joi.string().required(),
        zip_code: Joi.number().required(),
        message: Joi.string().allow('')
    }).required(),
    card: Joi.object({
        name: Joi.string().required(),
        number: Joi.number().required(),
        exp: Joi.string().required(),
        cvv: Joi.number().required().integer().min(100).max(999) // Enforce a minimum and maximum length of 3 digits
    }).required(),
    total_price: Joi.number().required() // Include total_price in the schema
})