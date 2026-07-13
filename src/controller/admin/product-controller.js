import Product from "../../models/product-model.js";
import mongoose from "mongoose";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      color,
      description,
      section,
      src,
      hoverSrc,
    } = req.body;

    const existingProduct = await Product.findOne({
      name,
      color,
    });

    if (existingProduct) {
      return res.status(409).json({ message: "Product already exists" });
    }

    const newProduct = await Product.create({
      name,
      price,
      color,
      src,
      hoverSrc,
      quantity,
      section,
      description,
    });

    return res
      .status(201)
      .json({ message: "Product added successfully", newProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      color,
      src,
      hoverSrc,
      quantity,
      section,
      description,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.color = color ?? product.color;
    product.src = src ?? product.src;
    product.hoverSrc = hoverSrc ?? product.hoverSrc;
    product.quantity = quantity ?? product.quantity;
    product.section = section ?? product.section;
    product.description = description ?? product.description;

    const existingProduct = await Product.findOne({
      name: product.name,
      color: product.color,
      _id: { $ne: product._id },
    });

    if (existingProduct) {
      return res
        .status(409)
        .json({ message: "Another product with same name and color exists" });
    }

    await product.save();

    return res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    return res
      .status(200)
      .json({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getProducts = async (req, res) => {
  try {
    let query = {};
    let sortQuery = {
      createdAt: -1,
    };

    // Pagination
    const { page = 1, limit = 20 } = req.query;

    // Filtering
    const { search, color, section } = req.query;

    // Sorting

    const { sort } = req.query;

    if (sort) {
      const descending = sort.startsWith("-");
      const field = descending ? sort.slice(1) : sort.toString();

      const allowedSortField = ["name", "price", "createdAt"];

      if (!allowedSortField.includes(field)) {
        return res
          .status(400)
          .json({ message: "Please enter valid sort condition" });
      }

      const direction = descending ? -1 : 1;

      sortQuery = {
        [field]: direction,
      };
    }

    // MongoDB Querying

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (color) {
      query.color = {
        $regex: color,
        $options: "i",
      };
    }

    if (section) {
      query.section = {
        $regex: section,
        $options: "i",
      };
    }

    // Pagination

    let pageNumber = Number(page);
    let limitNumber = Number(limit);

    if (isNaN(pageNumber) || pageNumber < 1) {
      pageNumber = 1;
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      limitNumber = 20;
    } else if (limitNumber > 50) {
      limitNumber = 50;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query)
      .lean()
      .select("name price quantity color section src")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNumber);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    // Return

    return res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages,
      products,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getSpecifiedProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product Id" });
    }
    const product = await Product.findById(req.params.id)
      .lean()
      .select("name price color quantity section description src");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getSpecifiedProduct,
};
