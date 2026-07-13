import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
import express from "express";
import router from "./src/router/router.js";
import cors from "cors";
import path from "path";
import adminRouter from "./src/router/admin/index.js";

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

app.use("/", router);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
  });
});
