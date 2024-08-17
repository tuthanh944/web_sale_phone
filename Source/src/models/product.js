
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, },
    cate: { type: String},
    price: {type: String},
    capitalPrice: {type: String},
    imgSrc: { type: String },
    desc: {type: String},
});

module.exports = mongoose.model('Product', ProductSchema);
