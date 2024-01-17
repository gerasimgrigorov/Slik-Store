if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash')
const { isLoggedIn, isAdmin } = require('./middleware');
const AppError = require('./utilities/AppError')
const catchAsync = require('./utilities/catchAsync')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo')

// passport setup
const passport = require('passport');
const LocalStrategy = require('passport-local');

// multer uploading
const multer = require('multer');
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });

// models
const Product = require('./models/product');
const Wishlist = require('./models/wishlist');
const User = require('./models/user');
const Order = require('./models/order');
const Payment = require('./models/payment');
const Contact = require('./models/contact')

//router
const productRouter = require('./routes/products')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')
const contactRouter = require('./routes/contact')
const profileRouter = require('./routes/profile')

const dbUrl = 'mongodb://127.0.0.1:27017/slik-store'
// const dbUrl = process.env.DB_URL

mongoose.connect(dbUrl)
    .then(() => {
        console.log('MONGOOSE CONNECTED')
    })
    .catch((e) => {
        console.log('ERROR', e)
    });

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // in seconds
    crypto: {
        secret: 'bettersecret'
    }
})

const sessionConfig = { 
    store,
    name: 'session', //not using the default name for security
    secret: 'bettersecret',
    saveUninitialized: false,
    resave: false, 
    cookie: {
        httpOnly: true, //not accesable through javascript
        // secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 1,
        maxAge: 1000 * 60 * 60 * 24 * 1
    } 
}

app.use(session(sessionConfig));

//MIDDLEWARE
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash())
app.use(methodOverride('_method'));
app.use(mongoSanitize())
 
//helmet setup
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://netdna.bootstrapcdn.com/"
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com",
    "https://netdna.bootstrapcdn.com",
    "'self'",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://ka-f.fontawesome.com/",
    "https://docs.mapbox.com/",
    "https://kit.fontawesome.com/",
    "'self'"
];

const fontSrcUrls = [
    "https://ka-f.fontawesome.com/",
    "'self'"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfkaodmtf/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://images.pexels.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// passport setup/ middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //adding authenticate method to the user model with the local strategy
passport.serializeUser(User.serializeUser()); //*login and logout user methods*
passport.deserializeUser(User.deserializeUser());

app.use(async(req, res, next) => {
    res.locals.currentUser = req.user
    if(!req.session.cart){
        res.locals.cartQuantity = 0
    } else {
        res.locals.cartQuantity = req.session.cart.length
    }
    if(res.locals.currentUser){
        const user = req.user
        const wishlist = await Wishlist.findOne({user})
        res.locals.currentWishlist = wishlist
    }
    next()
})

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/order', orderRouter)
app.use('/contact', contactRouter)
app.use('/profile', profileRouter)

app.get('/new', isAdmin, (req, res) => {
    res.render('new');
})

app.get('/home', catchAsync( async(req, res) => {
    const products = await Product.aggregate([{ $sample: { size: 8 } }]);
    res.render('index', { products });
}));

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Wellcome back, ${req.user.username}!`)
    res.redirect('/home');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', catchAsync( async(req, res) => {
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

app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        res.redirect('/home');
    });
});

app.post('/wishlist/:product_id', isLoggedIn, catchAsync( async(req, res) => {
    const id = req.params.product_id
    const user = req.user
    const product = await Product.findById(id)
    const existWishlist = await Wishlist.findOne({user})

    if (existWishlist) {
        const existProduct = existWishlist.products.includes(product._id)
        if (!existProduct) {
            existWishlist.products.push(product)
            await existWishlist.save()
        } else {
            //removing item if already existed in the wishlist
            const index = existWishlist.products.indexOf(product._id)
            const result = existWishlist.products.splice(index, 1)
            await existWishlist.save()
        }
    } else {
        const wishlist = new Wishlist({user})
        wishlist.products.push(product)
        await wishlist.save()
    }
    res.redirect(`/products/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new AppError(404, 'Page Not Found'))
})

app.use((err, req, res, next) => {
    if(!err.status) err.status = 500
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(err.status).render('error', { err })
})

app.listen(3000, () => {
    console.log('OPENED PORT 3000');
})