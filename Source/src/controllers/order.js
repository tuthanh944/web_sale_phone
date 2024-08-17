const Order = require("../models/order");

exports.getAllOrders = async(req, res, next) => {
	const orders = await Order.find();
	const plainOrders = orders.map(order => order.toObject());
	res.render('order/index', { orders: plainOrders, layout: "dashboard" });
}
