import authMiddleware from "../../middleware/auth-middleware.js";
import adminMiddleware from "../../middleware/admin/admin-middleware.js";
import express from "express";
import * as adminController from "../../controller/admin/order-controller.js";

const adminRouter = express.Router();

adminRouter
  .route("/orders")
  .get(authMiddleware, adminMiddleware, adminController.order);

adminRouter
  .route("/orders/:id/status")
  .patch(
    authMiddleware,
    adminMiddleware,
    adminController.updateStatus,
  ); /* orderStatus: __, valid: ["Placed", "Processing", "Shipped", "Delivered"] */

adminRouter
  .route("/orders/:id")
  .get(authMiddleware, adminMiddleware, adminController.specifiedOrder);

export default adminRouter;
