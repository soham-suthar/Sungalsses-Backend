import User from "../../models/user-model.js";
import getPagination from "../../util/Pagination.js";
import getSort from "../../util/Sorting.js";

const allUsers = async (req, res) => {
  try {
    // Query Parameters

    let query = {};

    // Filtering

    const { limit = 20, page = 1 } = req.query;

    const { search, role } = req.query;

    const { sort } = req.query;

    // Validation

    if (search) {
      query.$or = [
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
      ];
    }

    const allowedRoles = ["user", "admin"];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Please enter a valid role" });
    }

    if (role) {
      query.role = role;
    }

    // Utilities

    const { pageNumber, limitNumber, skip } = getPagination(page, limit);
    const sortQuery = getSort(sort, ["name", "email", "role", "createdAt"]);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNumber);

    // MongoDB Querying

    const users = await User.find(query)
      .select("_id name email role createdAt")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Response

    return res.status(200).json({
      data: users,

      pagination: {
        page: pageNumber,
        limit: limitNumber,

        totalUsers,
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

const getSpecifiedUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("_id name email role createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await User.findById(req.params.id).select(
      "_id name email role createdAt",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }

      user.name = trimmedName;
    }

    const allowedRoles = ["user", "admin"];

    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Enter a valid role",
        });
      }

      if (req.user.userId === req.params.id && role === "user") {
        return res.status(400).json({
          message: "You cannot remove your own admin role",
        });
      }

      if (user.role === "admin" && role === "user") {
        const adminCount = await User.countDocuments({
          role: "admin",
        });

        if (adminCount === 1) {
          return res.status(400).json({
            message: "Cannot remove the last admin",
          });
        }
      }

      user.role = role;
    }

    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const adminCount = await User.countDocuments({
      role: "admin",
    });

    if (user.role === "admin" && adminCount === 1) {
      return res.status(400).json({ message: "Cannot delete last admin" });
    }

    if (req.user.userId === req.params.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export { allUsers, getSpecifiedUser, updateUser, deleteUser };
