import express from "express";
import * as productController from "../controller/product-controller.js";

const userRouter = express.Router();

userRouter.route("/api/products").get(productController.getProducts);
userRouter.route("/api/colors").get(productController.getColors);

export default userRouter;
