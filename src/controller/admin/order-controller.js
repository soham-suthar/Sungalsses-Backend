import Order from "../../models/order-model.js";
import User from "../../models/user-model.js";
import getPagination from "../../util/Pagination.js";
import getSort from "../../util/Sorting.js";
import asyncMiddleware from "../../middleware/asyncMiddleware.js";

const order = asyncMiddleware(async (req, res) => {
  // Query Parameters

  let query = {};

  // Filtering

  const { page = 1, limit = 10 } = req.query;

  const { search, orderStatus, paymentStatus } = req.query;

  const { sort } = req.query;

  // Validation

  if (search) {
    const users = await User.find({
      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }).select("_id");

    if (users.length === 0) {
      return res.status(200).json({
        page: 1,
        limit: limitNumber,
        totalOrders: 0,
        totalPages: 0,
        orders: [],
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }

    // Utilities

    const { pageNumber, limitNumber, skip } = getPagination(page, limit);
    const sortQuery = getSort(sort, [
      "totalPrice",
      "paymentStatus",
      "orderStatus",
      "createdAt",
    ]);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNumber);

    // MongoDB querying

    const userIds = users.map((user) => user._id);

    query.user = {
      $in: userIds,
    };
  }

  const allowedPaymentStatus = ["Pending", "Paid", "Failed"];

  if (paymentStatus && !allowedPaymentStatus.includes(paymentStatus)) {
    return res
      .status(400)
      .json({ message: "Please enter valid payment status" });
  }

  const allowedOrderStatus = [
    "Placed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (orderStatus && !allowedOrderStatus.includes(orderStatus)) {
    return res.status(400).json({ message: "Please enter valid order status" });
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (orderStatus) {
    query.orderStatus = orderStatus;
  }

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("items.product", "name price color")
    .select(
      "items totalItems totalPrice orderStatus paymentMethod paymentStatus createdAt",
    )
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  // Return

  return res.status(200).json({
    data: orders,
    pagination: {
      page: pageNumber,
      limit: limitNumber,

      totalOrders,
      totalPages,

      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  });
});

const updateStatus = asyncMiddleware(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const nonChangeable = ["Delivered", "Cancelled"];

  if (nonChangeable.includes(order.orderStatus)) {
    return res
      .status(409)
      .json({ message: "Order is already delivered or cancelled" });
  }

  const allowedStatus = ["Placed", "Processing", "Shipped", "Delivered"];
  const { orderStatus } = req.body;

  if (orderStatus === order.orderStatus) {
    return res
      .status(409)
      .json({ message: `Order is already in ${order.orderStatus} status` });
  }

  if (allowedStatus.includes(orderStatus)) {
    order.orderStatus = orderStatus;
  } else {
    return res.status(400).json({ message: "Enter a valid status" });
  }

  await order.save();

  return res
    .status(200)
    .json({ message: "Status changed successfully", order });
});

const specifiedOrder = asyncMiddleware(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name color src")
    .select(
      "paymentStatus paymentMethod orderStatus totalItems totalPrice createdAt",
    )
    .lean();
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.status(200).json({
    order,
  });
});

export { order, updateStatus, specifiedOrder };
