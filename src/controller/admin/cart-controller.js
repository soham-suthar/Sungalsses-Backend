import getPagination from "../../util/Pagination.js";
import Cart from "../../models/cart-model.js";
import User from "../../models/user-model.js";

const getCarts = async (req, res) => {
  try {
    let query = {};
    const { search } = req.query;
    const { page = 1, limit = 10 } = req.query;

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
          data: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            totalCarts: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }

      const userIds = users.map((user) => user._id);

      query.user = {
        $in: userIds,
      };
    }

    // Pagination

    const { pageNumber, limitNumber, skip } = getPagination(page, limit);
    const totalCarts = await Cart.countDocuments(query);
    const totalPages = Math.ceil(totalCarts / limitNumber);

    const carts = await Cart.find(query)
      .select("user items updatedAt")
      .populate("user", "name email")
      .populate("items.product", "name price")
      .skip(skip)
      .limit(limitNumber)
      .lean();

    return res.status(200).json({
      data: carts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,

        totalCarts,
        totalPages,

        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getSpecifiedCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price color src quantity")
      .lean();

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    return res.status(200).json({
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export { getCarts, getSpecifiedCart };
