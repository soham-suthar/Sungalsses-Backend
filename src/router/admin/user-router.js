import express from "express";
import authMiddleware from "../../middleware/auth-middleware.js";
import adminMiddleware from "../../middleware/admin/admin-middleware.js";
import validateObjectId from "../../middleware/validateObjectId.js";
import * as adminController from "../../controller/admin/user-controller.js";

const adminRouter = express.Router();

adminRouter
  .route("/users")
  .get(authMiddleware, adminMiddleware, adminController.allUsers);

adminRouter
  .route("/users/:id")
  .get(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    adminController.getSpecifiedUser,
  )
  .patch(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    adminController.updateUser,
  )
  .delete(
    authMiddleware,
    adminMiddleware,
    validateObjectId,
    adminController.deleteUser,
  );

export default adminRouter;
