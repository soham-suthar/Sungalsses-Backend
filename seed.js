import mongoose from "mongoose";
import Product from "./src/product-model.js";
import data from "./data.json" with { type: "json" };
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  await mongoose.connect(`${process.env.MONGO_URL}`);

  await Product.deleteMany({});

  const products = [];

  for (const group in data) {
    products.push(...data[group]);
  }

  await Product.insertMany(products);

  console.log(`${products.length} products added`);
  process.exit();
}

seed();
