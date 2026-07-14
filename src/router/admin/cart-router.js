import express from "express";
import authMiddleware from "../../middleware/auth-middleware.js";
import adminMiddleware from "../../middleware/admin/admin-middleware.js";
import validateObjectId from "../../middleware/validateObjectId.js";
import * as adminController from "../../controller/admin/cart-controller.js";

const adminRouter = express.Router();

adminRouter
  .route("/carts")
  .get(
    authMiddleware,
    adminMiddleware,
    adminController.getCarts,
  ); /* Optional query parameters:
        ?search=
        ?page=1
        ?limit=10
    */

adminRouter
  .route("/carts/:id")
  .get(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    adminController.getSpecifiedCart,
  );

export default adminRouter;
