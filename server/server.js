import express from "express";

import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
const app = express();
const port = process.env.PORT || 3000;
connectDB();
const allowedOrigins = ["http://localhost:5173"];
app.use(express.json());

app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

//API End Points
app.use("/api/auth", authRouter); // Changed from app.get to app.use
app.use("/api/user", userRouter);
app.get("/", (req, res) => {
  res.send("Api is working fine");
});

app.listen(port, () => {
  console.log(`Server listening on PORT:${port}`);
});
