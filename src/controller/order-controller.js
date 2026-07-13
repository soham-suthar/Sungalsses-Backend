import Order from "../models/order-model.js";
import Cart from "../models/cart-model.js";
import generateInvoice from "../util/invoice.js";

const checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is Empty" });
    }

    let totalItems = 0;
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) continue;

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

    order.paymentMethod = "UPI";
    order.paymentStatus = "Paid";
    cart.items = [];

    await cart.save();
    await order.save();

    return res
      .status(201)
      .json({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const order = await Order.find({ user: userId })
      .populate("items.product", "name price src")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: order.length,
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const specifiedOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const order = await Order.findOne({
      user: userId,
      _id: req.params.id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not Found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const cancellation = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Payment

const payment = async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.findOne({ user: userId, _id: req.params.id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus == "Paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    if (order.orderStatus == "Cancelled") {
      return res.status(400).json({ message: "Order was Cancelled" });
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const invoice = async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.findOne({
      user: userId,
      _id: req.params.id,
    })
      .populate("items.product")
      .populate("user");
    generateInvoice(res, order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export { checkout, getOrder, specifiedOrder, cancellation, payment, invoice };
