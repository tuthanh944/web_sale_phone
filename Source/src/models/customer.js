const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tạo mô hình Customer
const customerSchema = new Schema({
  phone: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

// Tạo model từ schema
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
