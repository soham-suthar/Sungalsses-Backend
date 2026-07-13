import express from "express";
import adminDashboardRouter from "./dashboard-router.js";
import adminOrderRouter from "./order-router.js";
import adminProductRouter from "./product-router.js";

const adminRouter = express.Router();

adminRouter.use(adminDashboardRouter);
adminRouter.use(adminOrderRouter);
adminRouter.use(adminProductRouter);

export default adminRouter;
