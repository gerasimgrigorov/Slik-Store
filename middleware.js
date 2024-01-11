module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    next()
}

module.exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.user.role === 'admin'){
        return next()
    }
    
    return res.redirect('/login')
}