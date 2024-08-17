const { response } = require('express');
const Product = require('../models/product');
const Order = require('../models/order');
const Customer = require('../models/customer');
const { mongooseToObject, multipleMongooseToObject } = require('../utils/mongoose');
const mongoose = require('mongoose');
const { report } = require('../routes/account');

class DashboardController {
  // [GET] /dashboard
  async index(req, res, next) {
    try {

      let currentDate = new Date()
      let oneMonthAgo = new Date()
      oneMonthAgo.setMonth(currentDate.getMonth() - 1)

      const totalAmountDate = await Order.aggregate([
        {
          $match: {
            purchaseDate: { $gte: oneMonthAgo, $lt: currentDate }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: "$totalAmount"
            },
            totalOrder: {
              $count: {}
            },
            uniquePhones: {
              $addToSet: "$phone"
            }
          }
        },
        {
          $project: {
            totalAmount: 1,
            totalOrder: 1,
            totalCustomer: { $size: "$uniquePhones" }
          }
        }
      ]);

      const result = await Order.aggregate([
        {
          $addFields: {
            purchaseDate: {
              $toDate: "$purchaseDate"
            }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$purchaseDate" },
              year: { $year: "$purchaseDate" }
            },
            totalAmountByMonth: { $sum: "$totalAmount" }
          }
        },
        {
          $project: {
            _id: 1,
            totalAmountByMonth: {
              $cond: {
                if: { $ne: ["$totalAmountByMonth", null] },
                then: "$totalAmountByMonth",
                else: 0
              }
            }
          }
        }
      ]);

      const idProducts = []
      const productsByOrder = await Order.find({}).populate('products')
      for (let i = 0; i < productsByOrder.length; i++) {
        for (let j = 0; j < productsByOrder[i].products.length; j++) {
          idProducts.push(productsByOrder[i].products[j].id)
        }
      }

      const countProducts = await Product.aggregate([
        {
          $match: { _id: { $in: idProducts.map(id => new mongoose.Types.ObjectId(id)) } }
        },
        {
          $group: {
            _id: '$cate',
            count: { $sum: 1 }
          }
        }
      ])
      
      let quarter1 = 0
      let quarter2 = 0
      let quarter3 = 0
      let quarter4 = 0

      for (let i = 0; i < result.length; i++) {
        if (result[i]._id.month == 1 || result[i]._id.month == 2 || result[i]._id.month == 3) {
          quarter1 += result[i].totalAmountByMonth
        }
        else if (result[i]._id.month == 4 || result[i]._id.month == 5 || result[i]._id.month == 6) {
          quarter2 += result[i].totalAmountByMonth
        }
        else if (result[i]._id.month == 7 || result[i]._id.month == 8 || result[i]._id.month == 9) {
          quarter3 += result[i].totalAmountByMonth
        }
        else if (result[i]._id.month == 10 || result[i]._id.month == 11 || result[i]._id.month == 12) {
          quarter4 += result[i].totalAmountByMonth
        }
      }

      const totalAmountOneMonth = totalAmountDate.length > 0 ? totalAmountDate[0].totalAmount : 0
      const totalOrderOneMonth = totalAmountDate.length > 0 ? totalAmountDate[0].totalOrder : 0
      const totalCustomerOneMonth = totalAmountDate.length > 0 ? totalAmountDate[0].totalCustomer : 0

      let totalAmountByQuarter = { quarter1, quarter2, quarter3, quarter4 }

      res.render('./dashboard/dashboard', {
        layout: 'dashboard',
        totalAmountOneMonth: totalAmountOneMonth,
        totalOrderOneMonth: totalOrderOneMonth,
        totalCustomerOneMonth: totalCustomerOneMonth,
        totalAmountByQuarter: JSON.parse(JSON.stringify(totalAmountByQuarter)),
        countProductsBought: countProducts
      })
    }
    catch (err) {
      console.log(err)
      throw err
    }
  }

  // [GET] /dashboard /products
  async getAllproducts(req, res, next) {
    const products = await Product.find({})
    res.render('./dashboard/products', {
      layout: 'dashboard',
      products: multipleMongooseToObject(products)
    })
  }

  // [GET] /dashboard /revenue
  getRevenue(req, res, next) {
    res.render('./dashboard/reportRevenue', {
      layout: 'dashboard'
    })
  }

  async revenue(req, res, next) {
    try {

      let currentDate = new Date()
      let dateStart = new Date()
      const resulteAmountDate = []
      const orders = await Order.find()



      if(req.body.type == 'sevenDay') {
        dateStart.setDate(currentDate.getDate() - 7)

        // Doanh thu 
        const totalAmountDate = await Order.aggregate([
          {
            $match: {
              purchaseDate: { $gte: dateStart, $lt: currentDate }
            }
          },
          {
            $group: {
              _id: { $dayOfWeek: "$purchaseDate" },
              totalAmount: { $sum: "$totalAmount" }
            }
          },
          {
            $sort: {
              _id: 1 
            }
          }
        ]);

        for (let day = 1; day <= 7; day++) {
          const foundDay = totalAmountDate.find(item => item._id === day);
          if (foundDay) {
            foundDay._id = "Thứ " + (day- (-1))
            resulteAmountDate.push(foundDay);
          } else {
            let date = "Thứ " + (day- (-1))
            if(day == 7) {
              date = "Chủ nhật"
            }
            resulteAmountDate.push({ _id: date, totalAmount: 0 });
          }
        }

      }
      else if(req.body.type == 'oneMonth') {
        dateStart.setMonth(currentDate.getMonth() - 1)

        // Doanh thu
        const totalAmountDateOneMonth = await Order.aggregate([
          {
            $match: {
              purchaseDate: { $gte: dateStart, $lt: currentDate }
            }
          },
          {
            $group: {
              _id: { $dayOfMonth: "$purchaseDate",  },
              totalAmount: { $sum: "$totalAmount" }
            }
          },
          {
            $sort: {
              _id: 1
            }
          }
        ]);

        for (let day = 1; day <= 31; day++) {
          const foundDay = totalAmountDateOneMonth.find(item => item._id === day);
          if (foundDay) {
            foundDay._id = day
            resulteAmountDate.push(foundDay);
          } else {
            resulteAmountDate.push({ _id: day, totalAmount: 0 });
          }
        }
      }
      else {
        dateStart = new Date(req.body.dateStart)
        currentDate = new Date(req.body.dateEnd)
        const timeDiff = currentDate - dateStart;
        const daysDiff = Math.abs(Math.round(timeDiff / (1000 * 60 * 60 * 24)));

        // Doanh thu
        const totalAmountDateCustom = await Order.aggregate([
          {
            $match: {
              purchaseDate: { $gte: dateStart, $lt: currentDate }
            }
          },
          {
            $group: {
              _id: { $dayOfMonth: "$purchaseDate",  },
              totalAmount: { $sum: "$totalAmount" }
            }
          },
          {
            $sort: {
              _id: 1
            }
          }
        ]);

        for (let day = 1; day <= daysDiff; day++) {
          const foundDay = totalAmountDateCustom.find(item => item._id === day);
          if (foundDay) {
            foundDay._id = day
            resulteAmountDate.push(foundDay);
          } else {
            resulteAmountDate.push({ _id: day, totalAmount: 0 });
          }
        }
      }

      res.json({
        totalAmountDate: JSON.parse(JSON.stringify(resulteAmountDate)),
        orders: JSON.parse(JSON.stringify(orders))
      })
    }
    catch (err) {
      console.log(err)
      throw err
    }
  }

  async orderDetails(req, res, next) {    
    const id = new mongoose.Types.ObjectId(req.params.id); 
    const orders = await Order.findOne({ _id: id })
    const phone = orders.phone;
    const customer = await Customer.findOne({phone: phone});
    await Order.findOne({ _id: id })
        .then(orders => {
            if (orders) {
                res.render('view_customer/order_details', {
                  layout: 'dashboard',
                    orders: orders.toObject(), 
                    customer:customer.toObject(),
                });
            } else {
                res.send({ message: "Không tìm thấy chi tiết đơn hàng." });
            }
        })
        .catch(err => {
            console.log(err);
            res.send({ message: "Đã xảy ra lỗi khi truy xuất chi tiết đơn hàng." });
        });
};


async getCustomer(req, res, next) {
  const customerPhone = req.params.id; 
  const customer = await Customer.findOne({phone: customerPhone});
  await Order.find({ phone: customerPhone })
      .then(orders => {
          if (orders.length > 0) {
              const plainOrders = orders.map(order => order.toObject());
              res.render('view_customer/purchase_history', 
                  {
                      layout: 'dashboard',
                      orders: plainOrders,customer:customer.toObject()
                  });
          } else {
              res.send({ message: "Không tìm thấy lịch sử mua hàng cho khách hàng này." });
          }
      })
      .catch(err => {
          console.log(err);
          res.send({ message: "Đã xảy ra lỗi khi truy xuất lịch sử mua hàng." });
      });
};

}
  module.exports = new DashboardController;
