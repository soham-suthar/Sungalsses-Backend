import authMiddleware from "../../middleware/auth-middleware.js";
import adminMiddleware from "../../middleware/admin/admin-middleware.js";
import express from "express";
import * as adminController from "../../controller/admin/dashboard-controller.js";

const adminRouter = express.Router();

adminRouter
  .route("/")
  .get(authMiddleware, adminMiddleware, adminController.dashboard);

export default adminRouter;
