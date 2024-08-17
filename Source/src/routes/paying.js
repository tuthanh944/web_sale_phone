const express = require('express')
const {
    getCheckNp,
    checkPhoneNumber,
    saveCustomerInfo,
    searchProductForOrder,
    findProductForOrder,
    checkMoney,
    saveOrder,
    printBillsInDetail
} = require('./../controllers/paying')
const route = require('.')

const router = express.Router()

router.route('/checkNp').get(getCheckNp).post(checkPhoneNumber)
router.route('/enter-name-address').post(saveCustomerInfo)
router.route('/check-money').post(checkMoney)
router.route('/add-order').get(searchProductForOrder).post(findProductForOrder)
router.route('/save-order').post(saveOrder)
router.route('/print-order').post(printBillsInDetail)
module.exports = router
