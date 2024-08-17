const express = require('express')
const {
    getFindCustomer,
    findCustomer,
    viewHistoryOrder,
    orderDetails,
} = require('./../controllers/view_customer')
const route = require('.')

const router = express.Router()

router.route('/search-customer').get(getFindCustomer).post(findCustomer)
router.route('/purchase-history/:phone').get(viewHistoryOrder)
router.route('/order-details/:id').get(orderDetails)
module.exports = router

