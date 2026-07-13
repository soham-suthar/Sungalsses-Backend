import mongoose from "mongoose";
import Order from "../../models/order-model.js";
import User from "../../models/user-model.js";

const order = async (req, res) => {
  try {
    // Querying

    let sortQuery = {
      createdAt: -1,
      _id: -1,
    };

    let query = {};

    // Pagination

    const { page = 1, limit = 10 } = req.query;

    // Filtering

    const { search, orderStatus, paymentStatus } = req.query;

    // Sorting

    const { sort } = req.query;

    if (sort) {
      const descending = sort.startsWith("-");
      const field = descending ? sort.slice(1) : sort.toString();

      const allowedSortField = [
        "createdAt",
        "totalPrice",
        "paymentStatus",
        "orderStatus",
      ];

      if (!allowedSortField.includes(field)) {
        return res
          .status(400)
          .json({ message: "Please enter valid sort condition" });
      }

      const direction = descending ? -1 : 1;

      sortQuery = {
        [field]: direction,
        _id: -1,
      };
    }

    // Pagination

    let pageNumber = Number(page);
    let limitNumber = Number(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      pageNumber = 1;
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      limitNumber = 10;
    } else if (limitNumber > 20) {
      limitNumber = 20;
    }

    const skip = (pageNumber - 1) * limitNumber;

    // MongoDB Querying

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
      return res
        .status(400)
        .json({ message: "Please enter valid order status" });
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
        "totalItems totalPrice orderStatus paymentMethod paymentStatus createdAt",
      )
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNumber);

    // Return

    return res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      totalOrders,
      totalPages,
      orders,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const updateStatus = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const specifiedOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export { order, updateStatus, specifiedOrder };
