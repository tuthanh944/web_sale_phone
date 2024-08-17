// order.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const vietnamTime = moment.tz(new Date(), 'Asia/Ho_Chi_Minh').format('DD-MM-YYYY HH:mm');
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  phone: {
    type: String,
    required: true
  },
  name_customer: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  refundAmount: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now()
  },
  numberOfproduct:{
    type:Number,
    required:true
  },
  products: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    imgSrc:{
      type:String,
      require:true
    },
    total:{
      type: Number,
      required: true
    }
  }]
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
