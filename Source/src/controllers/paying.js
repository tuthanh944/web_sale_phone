const mongoose = require('mongoose')
const fs = require('fs');
const PDFDocument = require('pdfkit');
const unidecode = require('unidecode');
const customers = require('../models/customer')
const products=require('../models/product')
const order =require('../models/order')
const moment = require('moment-timezone');
var easyinvoice = require('easyinvoice');

const vietnamTime = moment.tz(new Date(), 'Asia/Ho_Chi_Minh').format('DD-MM-YYYY HH:mm');
let phoneNumber;

exports.getCheckNp= async (req,res)=>{
    const billData = req.query.bill;
    const bill = JSON.parse(billData);
    for (let i = 0; i < bill.items.length; i++) {
        const itemId = bill.items[i].id;
        const foundProduct = await products.findOne({ _id:new mongoose.Types.ObjectId(itemId)});
        if (foundProduct) {
            bill.items[i].imgSrc = foundProduct.imgSrc;
        }
    }
    res.render('pay/checkNumberPhone', { bill: bill });
}
exports.searchProductForOrder=(req,res)=>{
    products.find()
        .limit(20)
        .then(product => {
            if (product.length > 0) {
                const plainproduct = product.map(product => product.toObject());
                res.render('pay/add_product_order', {product: plainproduct});
            } else {
                res.send({ message: "Không có gì cả" });
            }
        })
}

exports.findProductForOrder = (req, res, next) => {
    const searchTerm = req.body.searchTerm; // Từ khóa tìm kiếm từ form
    if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        products.find({
            $or: [
                { _id: new mongoose.Types.ObjectId(searchTerm) },
            ]
        })
        .limit(20)
        .then(foundProduct => {
            if (foundProduct.length > 0) {
                res.send(foundProduct);
            } else {
                res.send({message:"Không tìm thấy"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({message:"Lỗi server"});
        });
    } else{
        products.find({
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } } 
            ]
          })
        .limit(20)
        .then(foundProduct => {
            if (foundProduct.length > 0) {
                res.send(foundProduct);
            }else{
                res.send({message:"Không tìm thấy"});
            }
        })

        .catch(err => {
            console.log(err);
        });
  }
}
exports.checkPhoneNumber = (req, res, next) => {
    phoneNumber = req.body.phone;
    customers.findOne({ phone: phoneNumber })
        .then(customer => {
            if (customer) {
                res.send(customer.toObject());
            } else {
                res.send({message:'New customer'});
            }
        })
        .catch(err => {
            console.log(err);
        });
};

exports.saveCustomerInfo = (req, res, next) => {
    phone = phoneNumber;
    const name = req.body.name;
    const address = req.body.address;
    const newCustomer = new customers({
        phone: phone,
        name: name,
        address: address
    });
    newCustomer.save()
        .then(() => {
            console.log('Customer information saved successfully.');
            res.send(newCustomer.toObject());
        })
        .catch(err => {
            console.log(err);
        });
};
exports.checkMoney=(req,res)=>{
    let moneyOfCustomer= req.body.moneyOfCustomer;
    let total_money=req.body.total_money;
    if(moneyOfCustomer<total_money){
        res.send({error:'Số tền không đủ hãy nhập lại'})
    }else{
        let excess_money=moneyOfCustomer-total_money;
        res.send({excess_money:excess_money})
    }
}

exports.saveOrder= async (req,res)=>{
    const databill=req.body.detailBill;
    const  phone= databill.phone;
    const  name_customer= databill.name_customer;
    const totalAmount= databill.totalAmount 
    const amountPaid=databill.amountPaid 
    const refundAmount=databill.refundAmount
    const numberOfproduct=databill.numberOfproduct
    const products=databill.products
    const newOrder = new order({
        phone,
        name_customer,
        totalAmount,
        amountPaid,
        refundAmount,
        numberOfproduct,
        products,
    });

    await newOrder.save()
          .then(savedOrder => {
          const pdf= printBill(savedOrder)
          res.send({pdf:pdf,message:"Đã lưu hóa đơn thành công"})
        })
        .catch(error => {
        res.status(500).json({ error: 'Internal Server Error' });
        });
}
exports.printBillsInDetail=(req,res)=>{
  const databill=req.body.detailBill;
  const  phone= databill.phone;
  const  name_customer= databill.name_customer;
  const totalAmount= databill.totalAmount 
  const amountPaid=databill.amountPaid 
  const refundAmount=databill.refundAmount
  const numberOfproduct=databill.numberOfproduct
  const products=databill.products
  const printOrder = new order({
      phone,
      name_customer,
      totalAmount,
      amountPaid,
      refundAmount,
      numberOfproduct,
      products,
  });
  const pdf= printBill(printOrder)
  res.send(pdf)
}
 
function printBill(detailBill){
  let products=[]
  detailBill.products.forEach(item => {
    let items={
      "quantity":item.quantity,
      "description":item.name,
      "tax-rate":0,
      "price":item.price
    }
    products.push(items)
  });
  var data = {
    "customize": {
    },
    "taxNotation":'',
    "images": {
        "logo": "https://img.upanh.tv/2023/12/10/Web_Photo_Editor.jpg",
        "background": "https://img.upanh.tv/2023/12/10/Invoice.png"
    },
    "sender": {
        "company": "IPoneX",
        "address": "19, Nguyễn Hữu Thọ",
        "zip": "Quận 7",
        "city": "HCMC"
    },
    "client": {
        "company": `${detailBill.name_customer}`,
        "address": `0${detailBill.phone}`,
    },
    "information": {
        "date": vietnamTime
    },
 

    "products": products,
    "bottom-notice": "Cảm ơn đã mua hàng",
    "settings": {
        "currency": "VND",
        "format": "A4", 
    },
    // Translate your invoice to your preferred language
    "translate": {

    },
};
  return data;
}