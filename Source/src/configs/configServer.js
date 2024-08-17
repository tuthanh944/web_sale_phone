const path = require('path')
const multer = require('multer')
const express = require('express')
const session = require('express-session')
const methodOverride = require('method-override')
const expressHandlebars = require('express-handlebars')

function configServer(app, dirPath) {
    // Set session
    app.use(
        session({
            secret: 'secret',
            resave: true,
            saveUninitialized: true,
        })
    )

    // flash message
    app.use((req, res, next) => {
        res.locals.flash = req.session.flash
        delete req.session.flash
        next()
    })

    // Override form action
    app.use(methodOverride('_method'))

    // Handle req.body
    app.use(express.urlencoded())
    app.use(express.json())
    app.app

    // Configure Handlebars view engine + Template Engine
    app.engine(
        'handlebars',
        expressHandlebars.create({
            defaultLayout: 'main',
            extname: '.hbs',
            layoutsDir: path.join(dirPath, 'views/layouts'),
            // partialsDir: path.join(dirPath, 'views/partials'),
            helpers: require('../helpers/handlebars.js'),
        }).engine
    )
    app.set('view engine', 'handlebars')

    // Set path partials
    app.set('partials', path.join(dirPath, '/views/partials'))

    // Set path views
    app.set('views', path.join(dirPath, '/views'))

    // Set public file
    app.use(express.static(path.join(dirPath, 'public')))

    // Set Storage image of product Local
    var storageImg = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './src/public/images/products')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        },
    })

    let storageAvatar = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './src/public/images/avatar')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname)
        },
    })

    // Config Check File Upload

    const uploadImgProduct = multer({
        storage: storageImg,
        // Upload file size
        limits: { fileSize: 1000000 },
        fileFilter: function (req, file, cb) {
            const filetypes = /jpeg|jpg|png/
            const extname = filetypes.test(
                path.extname(file.originalname).toLowerCase()
            )
            const mimetype = filetypes.test(file.mimetype)

            if (mimetype && extname) {
                return cb(null, true)
            } else {
                cb('Error: .jpeg, jpg or .png')
            }
        },
    })

    const uploadAvatar = multer({
        storage: storageAvatar,
        // Upload file size
        limits: { fileSize: 1000000 },
        fileFilter: function (req, file, cb) {
            const filetypes = /jpeg|jpg|png/
            const extname = filetypes.test(
                path.extname(file.originalname).toLowerCase()
            )
            const mimetype = filetypes.test(file.mimetype)

            if (mimetype && extname) {
                return cb(null, true)
            } else {
                cb('Error: .jpeg, jpg or .png')
            }
        },
    })

    return {
        uploadImgProduct,
        uploadAvatar,
    }
}

module.exports = configServer
