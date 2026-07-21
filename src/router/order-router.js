import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import * as order from "../controller/order-controller.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { checkoutSchema } from "../validation/validation.js";
import validate from "../middleware/validation-middleware.js";

const userRouter = express.Router();

userRouter
  .route("/api/checkout")
  .post(authMiddleware, validate(checkoutSchema), order.checkout);
userRouter.route("/api/order").get(authMiddleware, order.getOrders);
userRouter
  .route("/api/orders/:id")
  .get(authMiddleware, validateObjectId, order.getOrderById);
userRouter
  .route("/api/orders/:id/cancel")
  .patch(authMiddleware, validateObjectId, order.cancelOrder);

userRouter
  .route("/api/orders/:id/pay")
  .patch(authMiddleware, validateObjectId, order.payOrder);
userRouter
  .route("/api/orders/:id/invoice")
  .get(authMiddleware, validateObjectId, order.downloadInvoice);

export default userRouter;
