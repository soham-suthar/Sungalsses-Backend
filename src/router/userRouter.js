import express from "express";
import cartRouter from "./cart-router.js";
import orderRouter from "./order-router.js";
import usersRouter from "./user-router.js";
import productRouter from "./product-router.js";

const userRouter = express.Router();

userRouter.use(cartRouter);
userRouter.use(orderRouter);
userRouter.use(usersRouter);
userRouter.use(productRouter);

export default userRouter;
