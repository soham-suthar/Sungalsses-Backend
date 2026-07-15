import Order from "../models/order-model.js";
import Cart from "../models/cart-model.js";
import generateInvoice from "../util/invoice.js";
import Product from "../models/product-model.js";
import asyncMiddleware from "../middleware/asyncMiddleware.js";

const checkout = asyncMiddleware(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is Empty" });
  }

  let totalItems = 0;
  let totalPrice = 0;
  const orderItems = [];

  for (const item of cart.items) {
    if (!item.product) {
      return res
        .status(400)
        .json({ message: "One or more products are currently unavailable" });
    }

    if (item.product.quantity < item.quantity) {
      return res.status(400).json({
        message: `${item.product.name} is out of stock or has insufficient quantity`,
      });
    }

    totalItems += item.quantity;
    totalPrice += item.quantity * item.product.price;

    orderItems.push({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    });
  }

  const { paymentMethod } = req.body;

  const order = await Order.create({
    user: userId,
    items: orderItems,

    totalItems,
    totalPrice,

    paymentMethod,
  });

  // cart.items.forEach((item) => {
  //     totalItems += item.quantity;
  //     totalPrice += item.quantity * item.product.price;
  // });

  // orderItems.push

  order.paymentStatus = "Pending";

  await order.save();

  return res.status(201).json({ message: "Order created successfully", order });
});

const getOrder = asyncMiddleware(async (req, res) => {
  const userId = req.user._id;

  const order = await Order.find({ user: userId })
    .populate("items.product", "name price src")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    count: order.length,
    order,
  });
});

const specifiedOrder = asyncMiddleware(async (req, res) => {
  const userId = req.user._id;

  const order = await Order.findOne({
    user: userId,
    _id: req.params.id,
  }).populate("items.product");

  if (!order) {
    return res.status(404).json({ message: "Order not Found" });
  }
  return res.status(200).json(order);
});

const cancellation = asyncMiddleware(async (req, res) => {
  const userId = req.user._id;

  const order = await Order.findOne({ user: userId, _id: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Order not Found" });
  }

  const nonCancellable = ["Shipped", "Delivered"];

  if (nonCancellable.includes(order.orderStatus)) {
    return res.status(400).json({ message: "Order already Processed" });
  }

  if (order.orderStatus === "Cancelled") {
    return res.status(400).json({ message: "Order already Cancelled" });
  }

  order.orderStatus = "Cancelled";
  await order.save();

  return res
    .status(200)
    .json({ message: "Order Cancelled Successfully", order });
});

// Payment

const payment = asyncMiddleware(async (req, res) => {
  const userId = req.user._id;
  const order = await Order.findOne({
    user: userId,
    _id: req.params.id,
  }).populate("items.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.paymentStatus === "Paid") {
    return res.status(400).json({ message: "Order already paid" });
  }

  if (order.orderStatus === "Cancelled") {
    return res.status(400).json({ message: "Order was Cancelled" });
  }

  for (const item of order.items) {
    const updatedItem = await Product.findOneAndUpdate(
      {
        _id: item.product._id,
        quantity: { $gte: item.quantity },
      },
      {
        $inc: { quantity: -item.quantity },
      },
      {
        new: true,
      },
    );

    if (!updatedItem) {
      return res
        .status(400)
        .json({ message: `${item.product.name} does not have enough stock` });
    }
  }

  order.paymentStatus = "Paid";
  order.orderStatus = "Delivered";
  await order.save();

  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return res.status(200).json({ message: "Payment Successful", order });
});

const invoice = asyncMiddleware(async (req, res) => {
  const userId = req.user._id;
  const order = await Order.findOne({
    user: userId,
    _id: req.params.id,
  })
    .populate("items.product")
    .populate("user");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  generateInvoice(res, order);
});

export { checkout, getOrder, specifiedOrder, cancellation, payment, invoice };
