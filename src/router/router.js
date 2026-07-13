import express from "express";
import * as Page from "../controller/controller.js";
import validate from "../middleware/validation-middleware.js";
import { registerSchema, loginSchema } from "../validation/validation.js";
import authMiddleware from "../middleware/auth-middleware.js";
import * as CartController from "../controller/cart-controller.js";
import * as order from "../controller/order-controller.js";

const router = express.Router();

router.route("/api/products").get(Page.getProducts);
router.route("/api/colors").get(Page.getColors);

// User routes

router.route("/api/register").post(validate(registerSchema), Page.Register);
router.route("/api/login").post(validate(loginSchema), Page.Login);
router.route("/api/profile").get(authMiddleware, Page.getProfile);

// Cart routes

router.route("/api/cart").get(authMiddleware, CartController.getCart);
router.route("/api/cart").post(authMiddleware, CartController.addToCart);
router
  .route("/api/cart/:productId")
  .patch(authMiddleware, CartController.updateQuantity);
router
  .route("/api/cart/:productId")
  .delete(authMiddleware, CartController.removeFromCart);
router.route("/api/cart").delete(authMiddleware, CartController.clearCart);

// Order routes

router.route("/api/checkout").post(authMiddleware, order.checkout);
router.route("/api/order").get(authMiddleware, order.getOrder);
router.route("/api/order/:id").get(authMiddleware, order.specifiedOrder);
router.route("/api/order/:id/cancel").patch(authMiddleware, order.cancellation);

// Payment

router.route("/api/order/:id/pay").patch(authMiddleware, order.payment);
router.route("/api/order/:id/invoice").get(authMiddleware, order.invoice);

export default router;
