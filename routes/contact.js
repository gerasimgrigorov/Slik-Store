const express = require('express')
const router = express.Router()
const AppError = require('../utilities/AppError')
const { productSchema, contactSchema, orderSchema } = require('../schemas')
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utilities/catchAsync')
const Contact = require('../models/contact')

const validateContact = (req, res, next) => {
    const { error } = contactSchema.validate(req.body)

    if(error){
        const msg = error.details.map(e => e.message).join(' ')
        throw new AppError(400, msg)
    }
    next()
}

router.get('/', (req, res) => {
    res.render('contact')
})

router.post('/', validateContact, catchAsync( async(req, res) => {
    const request = new Contact(req.body.contact)
    await request.save()
    req.flash('success', "Thanks for the feedback. We'll be in touch!")
    res.redirect('/contact')
}))

module.exports = router