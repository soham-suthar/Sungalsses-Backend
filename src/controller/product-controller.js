import Product from "../models/product-model.js";

const getProducts = async (req, res) => {
  try {
    const { color } = req.query;

    const filter = {};

    if (color) {
      filter.color = new RegExp(`^${color}$`, "i");
    }

    const products = await Product.find(filter).lean();

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server Error" });
  }
};

const getColors = async (req, res) => {
  try {
    const colors = await Product.distinct("color");

    const filteredColors = colors.filter(Boolean);
    return res.status(200).json(filteredColors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Data not Found" });
  }
};

export { getProducts, getColors };
