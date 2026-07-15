import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
import express from "express";
import userRouter from "./src/router/userRouter.js";
import cors from "cors";
import path from "path";
import adminRouter from "./src/router/admin/adminRouter.js";
import errorMiddleware from "./src/middleware/error-middleware.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

const joinPublic = path.join(import.meta.dirname, "./public/");
app.use("/public", express.static(joinPublic));

app.use("/", userRouter);
app.use("/api/admin", adminRouter);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
  });
});
