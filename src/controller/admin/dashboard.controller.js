import Order from "../../models/order-model.js";
import Product from "../../models/product-model.js";
import User from "../../models/user-model.js";

const dashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      pendingOrders,
      cancelledOrders,
      deliveredOrders,
      revenueData,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({
        orderStatus: "Pending",
      }),
      Order.countDocuments({
        orderStatus: "Cancelled",
      }),
      Order.countDocuments({
        orderStatus: "Delivered",
      }),
    ]);

    let revenue = 0;

    await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          orderStatus: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]);

    return res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export { dashboard };
