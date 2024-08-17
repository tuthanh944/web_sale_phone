
const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboard')

const { checkAuthorization } = require('../controllers/account')

const {
    getAllUserExceptAdmin
} = require('../controllers/user')
const { getAllCustomers } = require('../controllers/view_customer')
const { getAllOrders } = require('../controllers/order')

module.exports = function() {    
    router.route('/revenue').get(checkAuthorization('admin'), dashboardController.getRevenue)
                            .post(checkAuthorization('admin'), dashboardController.revenue)
    router.route('/products').get(dashboardController.getAllproducts)
    router.route('/users').get(checkAuthorization('admin'), getAllUserExceptAdmin)
    router.route('/customers/:id').get(checkAuthorization('admin'), dashboardController.getCustomer)
    router.route('/customers').get(checkAuthorization('admin'), getAllCustomers)
    router.route('/orders/order-details/:id').get(checkAuthorization('admin'), dashboardController.orderDetails)
    router.route("/orders").get(checkAuthorization('admin'), getAllOrders)

    router.route('/').get(dashboardController.index)
    
    return router
}

