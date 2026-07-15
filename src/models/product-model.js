import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
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
  },
  {
    timestamps: true,
  },
);

const Product = new mongoose.model("Products", productSchema);

export default Product;
