const { response } = require('express');
const Product = require('../models/product');
const { mongooseToObject, multipleMongooseToObject } = require('../utils/mongoose');
const mongoose = require('mongoose')

class ProductController {
    // [GET] / products
    index(req, res, next){
        Product.find()
            .then((products) => {
                res.render('./product/listProduct', {
                    products: multipleMongooseToObject(products)
                })
            })
            .catch(next)
    }

    // [GET] /products /create
    getAddProduct(req, res, next) {
        res.render('./product/addProduct', {
            layout: 'dashboard'
        })
    }

    // [POST] / products
    addProduct(req, res, next) {
        console.log(req.file.path.split("public\\")[1])
        let newProduct = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.nameItem,
            cate: req.body.typeProduct,
            price: req.body.priceItem,
            imgSrc: req.file.path.split("public\\")[1],
            desc: req.body.descItem,
        })
        newProduct.save()
        .then(() => {
            res.redirect('/dashboard/products')
            
        })
        .catch(err => res.send({
            message: "Thêm thất bại",
            err
        }));
    }

    // [DELETE] / dashboard/ products
    async deleteProduct(req, res, next) {
        if (mongoose.isValidObjectId(req.body.productID)) {
            const result = await Product.findOneAndDelete({_id: { $in: req.body.productID }})
            if(result === null) {
                res.json({
                    'message': 'ID sản phẩm không tồn tại',
                    isDeleted: false
                })
                return
            }
            res.json({
                result,
                isDeleted: true
            });
        }
        else{
            res.json({
                'message': 'ID sản phẩm không hợp lệ',
                isDeleted: false
            })
        }
    }

    // [PUT] / dashboard/ products
    async editProduct(req, res, next) {
    
        try {
            const product = {
                name: req.body.name,
                cate: req.body.cate,
                price: req.body.price,
                // imgSrc: req.body.imgItem,
                desc: req.body.desc
            }
            console.log(product)
            const result = await Product.findOneAndUpdate({_id: { $in: req.body.productID}}, product)
            res.json({
                result,
                message: "Cập nhật thành công"
            })
        } catch (error) {
            res.json({
                message: "Cập nhật thất bại",
                error
            })
        }
    }

    // [GET] / products /:id
    getProduct(req, res, next) {
        Product.findById(req.params.id)
            .then((product) => {
                res.render('./product/detailProduct', {
                    product: mongooseToObject(product)
                })
            })
            .catch(next)
    }
}

module.exports = new ProductController;