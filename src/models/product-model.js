import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  hoverSrc: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    index: true,
  },
  section: {
    type: String,
    index: true,
  },
  description: {
    type: String,
    default: "",
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const Product = new mongoose.model("products", productSchema);

export default Product;
