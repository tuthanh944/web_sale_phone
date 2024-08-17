
const express = require('express')
const router = express.Router()
const productController = require('../controllers/product')

module.exports = function(upload) {    

    router.route('/add').get(productController.getAddProduct)
                           .post(upload.single('imgItem'), productController.addProduct)

    router.route('/:id').get(productController.getProduct)

    router.route('/').get(productController.index)
                     .put(productController.editProduct)
                     .delete(productController.deleteProduct)
    
    return router
}

