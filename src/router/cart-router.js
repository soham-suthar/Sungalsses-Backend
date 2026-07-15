import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import * as CartController from "../controller/cart-controller.js";
import validateObjectId from "../middleware/validateObjectId.js";

const userRouter = express.Router();

userRouter
  .route("/api/cart")
  .get(authMiddleware, CartController.getCart)
  .post(authMiddleware, CartController.addToCart)
  .delete(authMiddleware, validateObjectId, CartController.clearCart);

userRouter
  .route("/api/cart/:id")
  .patch(authMiddleware, validateObjectId, CartController.updateQuantity)
  .delete(authMiddleware, validateObjectId, CartController.removeFromCart);

export default userRouter;
