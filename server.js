import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import express from "express";
import mongoose from "mongoose";
//router
import jobRouter from "./routes/jobRouter.js";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.post("/", (req, res) => {
  res.json({ message: "data recieved", data: req.body });
});

app.use(express.json());

const PORT = 5100;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
} catch (error) {
  console.log(error);
}

app.get("/", async (req, res) => {
  console.log("Hello Worlds");
  res.send(jobs);
});

app.use("/api/v1/jobs", jobRouter);

app.use("*", (req, res) => {
  res.status(404).json({ msg: "not found!" });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ msg: "Something went wrong!" });
});
