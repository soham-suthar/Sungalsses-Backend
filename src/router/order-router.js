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
userRouter.route("/api/order").get(authMiddleware, order.getOrder);
userRouter
  .route("/api/order/:id")
  .get(authMiddleware, validateObjectId, order.specifiedOrder);
userRouter
  .route("/api/order/:id/cancel")
  .patch(authMiddleware, validateObjectId, order.cancellation);

userRouter
  .route("/api/order/:id/pay")
  .patch(authMiddleware, validateObjectId, order.payment);
userRouter
  .route("/api/order/:id/invoice")
  .get(authMiddleware, validateObjectId, order.invoice);

export default userRouter;
