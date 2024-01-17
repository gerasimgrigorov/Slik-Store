const express = require('express')
const router = express.Router()
const passport = require('passport')
const catchAsync = require('../utilities/catchAsync')
const User = require('../models/user')

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Wellcome back, ${req.user.username}!`)
    res.redirect('/home');
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
            res.redirect('/home')
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
        res.redirect('/home');
    });
});

module.exports = router