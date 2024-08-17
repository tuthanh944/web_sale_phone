const mongoose = require('mongoose')
const customers = require('../models/customer')
const order =require('../models/order')
const Customer = require('../models/customer')
exports.getFindCustomer=(req,res)=>{
    res.render('view_customer/search_customer')
}
exports.findCustomer = (req, res, next) => {
    const searchTerm = req.body.searchTerm; // Từ khóa tìm kiếm từ form
    if(searchTerm!=''){
        customers.find({
            $or: [
                { phone: searchTerm },
                { name: { $regex: searchTerm, $options: 'i' } } // Tìm kiếm theo tên, không phân biệt chữ hoa chữ thường
            ]
        })
        .then(foundCustomers => {
            if (foundCustomers.length > 0) {
                res.send(foundCustomers);
            }else{
                res.send({message:"Không tìm thấy"});
            }
        })

        .catch(err => {
            console.log(err);
        });
    }else{
        res.send({message:"Không tìm thấy"});
    }
}

exports.viewHistoryOrder = async(req, res, next) => {
    const customerPhone = req.params.phone; 
    const customer = await customers.findOne({phone: customerPhone});
    await order.find({ phone: customerPhone })
        .then(orders => {
            if (orders.length > 0) {
                const plainOrders = orders.map(order => order.toObject());
                res.render('view_customer/purchase_history', 
                    {
                        layout: 'main',
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
exports.orderDetails = async(req, res, next) => {    
    const id = new mongoose.Types.ObjectId(req.params.id); 
    const orders = await order.findOne({ _id: id })
    const phone = orders.phone;
    const customer = await customers.findOne({phone: phone});
    await order.findOne({ _id: id })
        .then(orders => {
            if (orders) {
                res.render('view_customer/order_details', {
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

exports.getAllCustomers = async (req, res) => {
    const customers = await Customer.find({}).lean()
    res.render('view_customer/index', { customers, layout: 'dashboard' })
}