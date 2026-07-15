import Product from "../../models/product-model.js";
import getPagination from "../../util/Pagination.js";
import getSort from "../../util/Sorting.js";
import asyncMiddleware from "../../middleware/asyncMiddleware.js";

const addProduct = asyncMiddleware(async (req, res) => {
  const { name, price, quantity, color, description, section, src, hoverSrc } =
    req.body;

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
});

const updateProduct = asyncMiddleware(async (req, res) => {
  const { name, price, color, src, hoverSrc, quantity, section, description } =
    req.body;

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
});

const deleteProduct = asyncMiddleware(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await product.deleteOne();

  return res.status(200).json({ message: "Product deleted successfully" });
});

const getProducts = asyncMiddleware(async (req, res) => {
  // Query Parameters
  let query = {};

  // Filtering

  const { page = 1, limit = 20 } = req.query;

  const { search, color, section } = req.query;

  const { sort } = req.query;

  // Validation

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

  // Utilities

  const { pageNumber, limitNumber, skip } = getPagination(page, limit);
  const sortQuery = getSort(sort, ["name", "price", "createdAt"]);

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limitNumber);

  // MongoDB Querying

  const products = await Product.find(query)
    .select("name price quantity color section src")
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  // Response

  return res.status(200).json({
    data: products,
    pagination: {
      page: pageNumber,
      limit: limitNumber,

      totalProducts,
      totalPages,

      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    },
  });
});

const getSpecifiedProduct = asyncMiddleware(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .select("name price color quantity section description src")
    .lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json({ product });
});

export {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getSpecifiedProduct,
};
