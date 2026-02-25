dotenv.config();

import "express-async-errors";
import * as dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import helmet from "helmet";
import cors from "cors";
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
//router
import jobRouter from "./routes/jobRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import errorHandlerMiddleware from "./middleware/errorMiddleware.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const app = express();
import cookieParser from "cookie-parser";

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.post("/", (req, res) => {
  res.json({ message: "data recieved", data: req.body });
});

app.use(express.json());
app.use(cookieParser());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

const PORT = 5000;

// connect to MongoDB
try {
  await mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
  });
  mongoose.set("strictQuery", true);

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
} catch (error) {
  console.log(error);
}

// routes
app.use("/api/v1/jobs", authenticateUser, jobRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/auth", authRouter);

// 404 route
app.use("*", (req, res) => {
  res.status(404).json({ msg: "not found!" });
});

app.use(errorHandlerMiddleware);
