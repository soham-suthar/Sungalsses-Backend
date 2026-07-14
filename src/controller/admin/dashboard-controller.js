import Order from "../../models/order-model.js";
import Product from "../../models/product-model.js";
import User from "../../models/user-model.js";

const dashboard = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, statusData, revenueData] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.aggregate([
          {
            $group: {
              _id: "$orderStatus",
              count: {
                $sum: 1,
              },
            },
          },
        ]),

        // Order.countDocuments({
        //   orderStatus: "Pending",
        // }),
        // Order.countDocuments({
        //   orderStatus: "Cancelled",
        // }),
        // Order.countDocuments({
        //   orderStatus: "Delivered",
        // }),
        Order.aggregate([
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
        ]),
      ]);

    const totalRevenue = revenueData[0]?.revenue || 0;

    const statusCount = {};

    statusData.forEach((status) => {
      statusCount[status._id] = status.count;
    });

    return res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      orderStatus: {
        placed: statusCount.Placed || 0,
        processing: statusCount.Processing || 0,
        shipped: statusCount.Shipped || 0,
        delivered: statusCount.Delivered || 0,
        cancelled: statusCount.Cancelled || 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export { dashboard };
