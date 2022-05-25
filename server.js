if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const { PrismaClient, prisma } = require("@prisma/client")
const { admin } = new PrismaClient()
const { user } = new PrismaClient()

const initializePassport = require('./passport-config')
const req = require('express/lib/request')
initializePassport(
    passport,
    async email => {
        const findAdmin = await admin.findUnique({
            where:{
                email
            }
        })
    },
    async id =>{
        const findAdmin = await admin.findUnique({
            where:{
                id
            }
        })
    }
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//Homepage Route
app.get('/', checkAuthenticated, async (req, res) => {
    const userId = req.session.passport.user
    const adminUser = await admin.findFirst({
        where: {
            id: userId
        }
    })
    const userData = await user.findMany()
    res.render('index.ejs', { adminUser,  userData})
})

//Login Route
app.get('/login', checkNotauthenticated, (req, res) => {
    res.render('login.ejs')
})
app.post('/login', checkNotauthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

//Register Route
app.get('/register', checkNotauthenticated,  (req, res) => {
    res.render('register.ejs')
})
app.post('/register', checkNotauthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const userExists = await admin.findUnique({
            where: {
                email: req.body.email
            },
            select: {
                email: true
            }
        })
        if(userExists){
            return res.status(400).json({
                msg: "admin already exists"
            })
        }
        const newUser = await admin.create({
            data:{
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
        })
        console.log(newUser)
        res.redirect('/login')
    }catch(e){
        console.log(e)
        res.redirect('/register')
    }
})

//Logout
app.delete('/logout', (req, res) => {
    req.logOut(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/login');
    });
});

//add User Route
app.get('/new', checkAuthenticated, (req, res) => {
    res.render('addUser.ejs')
})
app.post('/new', checkAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = await user.create({
            data: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                address: req.body.address,
                postcode: req.body.postcode,
                phone_number: req.body.phonenumber,
                email: req.body.email,
                username: req.body.username,
                password: hashedPassword
            }
        })
        console.log(newUser)
        res.redirect('/')
    }
    catch(e){
        console.log(e)
        res.redirect('/new')
    }
})

//edit User Route
app.get('/user/:id', checkAuthenticated, async (req, res) => {
    const id = req.params.id
    const userAccount = await user.findUnique({
        where:{
            id: Number(id)
        }
    })
    res.render('editUser.ejs', { user: userAccount })
})
app.post('/user/:id', checkAuthenticated, async (req, res) => {
    try{
        const newHashedPassword = await bcrypt.hash(req.body.password, 10)
        const updateuser = await user.update({
            where:{
                id: Number(req.body.id)
            },
            data:{
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                address: req.body.address,
                postcode: req.body.postcode,
                phone_number: req.body.phone_number,
                email: req.body.email,
                username: req.body.username,
                password: newHashedPassword
            }
        })
        res.redirect('/')
    }
    catch(e){
        console.log(e)
        res.redirect('/')
    }
})

//delete User Route
app.get('/delete/:id', checkAuthenticated, async(req, res) => {
    const id = Number(req.params.id)
    const deleteUser = await user.delete({
        where: {
            id
        }
    })
    res.redirect('/')
})

//For Authentication
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotauthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(3000)