import validate from "../../middleware/validation-middleware.js";
import authMiddleware from "../../middleware/auth-middleware.js";
import adminMiddleware from "../../middleware/admin/admin-middleware.js";
import express from "express";
import {
  addProductSchema,
  updateProductSchema,
} from "../../validation/validation.js";
import * as adminController from "../../controller/admin/product-controller.js";
import validateObjectId from "../../middleware/validateObjectId.js";

const adminRouter = express.Router();

adminRouter
  .route("/products")
  .post(
    authMiddleware,
    adminMiddleware,
    validate(addProductSchema),
    adminController.addProduct,
  );
/*  all Required
    name,
    price,
    quantity,
    color,
    description,
    section,
    src,
    hoverSrc,*/

adminRouter
  .route("/products")
  .get(
    authMiddleware,
    adminMiddleware,
    adminController.getProducts,
  ); /* can use query parameters: {color, search, section}, search for name 
  also pagination by ?page=1&limit=20 */

adminRouter
  .route("/products/:id")
  .patch(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    validate(updateProductSchema),
    adminController.updateProduct,
  ); /* Any of them to update
  name,
      price,
      color,
      src,
      hoverSrc,
      quantity,
      section,
      description, */

adminRouter
  .route("/products/:id")
  .get(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    adminController.getSpecifiedProduct,
  )
  .delete(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    adminController.deleteProduct,
  );

export default adminRouter;
