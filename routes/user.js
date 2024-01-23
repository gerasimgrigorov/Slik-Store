const express = require('express')
const router = express.Router()
const passport = require('passport')
const catchAsync = require('../utilities/catchAsync')
const User = require('../models/user')

const cartTransfer = (req, res, next) => {
    res.locals.temporary = req.session.cart
    console.log(req.session.cart)
    next()
}

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', cartTransfer, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Wellcome back, ${req.user.username}!`)
    req.session.cart = res.locals.temporary
    console.log(req.session.cart)
    res.redirect('/');
})

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', catchAsync( async(req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new User({email, username});
        const registerUser = await User.register(user, password);
        req.login(registerUser, () => {
            req.flash('success', `Wellcome, ${username}!`)
            res.redirect('/')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))

router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router