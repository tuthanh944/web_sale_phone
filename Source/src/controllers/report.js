const { response } = require('express');
const Product = require('../models/product');
const Order = require('../models/order');
const Customer = require('../models/customer');
const { mongooseToObject, multipleMongooseToObject } = require('../utils/mongoose');
const mongoose = require('mongoose');
const { report } = require('../routes/account');
const { ISO_8601 } = require('moment-timezone');

class ProductController {
    // [GET] / report
    async index(req, res, next){
        try{
            let obj = []

            const result = await Order.aggregate([{
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }])

            const totalAmountReceived = result.length > 0 ? result[0].total : 0;
            const numberOrder = await Order.estimatedDocumentCount();

            obj.push({'Total order number' : numberOrder})
            obj.push({'Total Almont All' : totalAmountReceived})

            let currentDate = new Date()
            let sevenDayAgo = new Date()
            let oneMonthAgo = new Date()
            sevenDayAgo.setDate(currentDate.getDay() - 7)
            oneMonthAgo.setMonth(currentDate.getMonth() - 1)

            let totalAmountDate = 0
            if(req.query.temp){
                if(req.query.temp === 'SevenDayAgo') {
                    totalAmountDate = await Order.aggregate([
                        {
                            $match: {purchaseDate: {$gte: sevenDayAgo, $lt:currentDate}}
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalAmount' }
                            }
                        }
                    ])
                    totalAmountDate = totalAmountDate.length > 0 ? totalAmountDate[0] : 0
                    console.log('Tổng totalAmount trong tất cả đơn hàng trong 7 ngày qua là:', totalAmountDate);
                } 
                else if (req.query.temp === 'OneMonthAgo') {
                    totalAmountDate = await Order.aggregate([
                        {
                            $match: {purchaseDate: {$gte: oneMonthAgo, $lt:currentDate}}
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$totalAmount' }
                            }
                        }
                    ])
                    totalAmountDate = totalAmountDate.length > 0 ? totalAmountDate[0].total : 0
                    console.log('Tổng totalAmount trong tất cả đơn hàng trong 1 tháng qua là:', totalAmountDate);
                }
                obj.push({'Total Amount':totalAmountDate})
                res.json(obj)
            }
            else {
                let dateEnd = new Date(req.query.dateEnd)
                let dateStart = new Date(req.query.dateStart)
                
                if(req.query.dateEnd === ''){
                    dateEnd = Date.now()
                }
                totalAmountDate = await Order.aggregate([
                    {
                        $match: {purchaseDate: {$gte: dateStart, $lt: dateEnd}}
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$totalAmount' }
                        }
                    }
                ])
                totalAmountDate = totalAmountDate.length > 0 ? totalAmountDate[0].total : 0
                obj.push({'Total Amount from date to date':totalAmountDate})
                res.json(obj)
            }

            res.render('./analys/report')
        }
        catch(err) {
            console.log(err)
            throw err
        }
        
    }
   
}

module.exports = new ProductController;
