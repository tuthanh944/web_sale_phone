const AccountRouter = require('./account')
const PayingRouter = require('./paying')
const ViewCustomer = require('./view_customer')
const Report = require('./dashboard')
const ProductRouter = require('./product')
const UserRouter = require('./user')
const {
    logout,
    checkAuthorization,
    checkIsPasswordChangedAfterAccountCreated,
    getLoginForm,
    login,
} = require('../controllers/account')

function route(app, config) {
    const { uploadImgProduct, uploadAvatar } = config

    app.use('/accounts', AccountRouter)

    app.route('/login').get(getLoginForm).post(login)
    app.get('/logout', logout)

    // Check if user is logged in
    app.use((req, res, next) => {
        if (!req.session.userId) {
            req.session.flash = {
                type: "danger",
                message: `Please login before access any resources`,
              };
            return res.redirect('/login')
        }
        next()
    })

    // Check if saleperson has changed password after account created by admin
    app.use(checkIsPasswordChangedAfterAccountCreated)
    
    app.get('/', (req, res, next) => {
        res.render('home')
    })

    app.use('/paying', PayingRouter)
    app.use('/view-customer', ViewCustomer)
    app.use('/users', UserRouter(uploadAvatar))
    app.use('/products', ProductRouter(uploadImgProduct))
    app.use('/dashboard', checkAuthorization('admin'), Report())

    app.use((req, res) => {
        res.status(404)
        res.render('404')
    })

    app.use((err, req, res, next) => {
        res.status(500)
        res.render('500', {
            layout: 'noneLayout', 
            errorMsg: err.message,
        })
    })
}

module.exports = route
