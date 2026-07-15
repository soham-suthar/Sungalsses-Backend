import express from "express";
import adminDashboardRouter from "./dashboard-router.js";
import adminOrderRouter from "./order-router.js";
import adminProductRouter from "./product-router.js";
import adminUserRouter from "./user-router.js";
import adminCartRouter from "./cart-router.js";

const adminRouter = express.Router();

adminRouter.use(adminDashboardRouter);
adminRouter.use(adminOrderRouter);
adminRouter.use(adminProductRouter);
adminRouter.use(adminUserRouter);
adminRouter.use(adminCartRouter);

export default adminRouter;
