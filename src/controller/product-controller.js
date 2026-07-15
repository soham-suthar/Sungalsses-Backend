import Product from "../models/product-model.js";
import asyncMiddleware from "../middleware/asyncMiddleware.js";

const getProducts = asyncMiddleware(async (req, res) => {
  const { color } = req.query;

  const filter = {};

  if (color) {
    filter.color = new RegExp(`^${color}$`, "i");
  }

  const products = await Product.find(filter).lean();

  return res.status(200).json(products);
});

const getColors = asyncMiddleware(async (req, res) => {
  const colors = await Product.distinct("color");

  const filteredColors = colors.filter(Boolean);
  return res.status(200).json(filteredColors);
});

export { getProducts, getColors };
