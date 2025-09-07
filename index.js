import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import orderRouter from "./routes/orderRoute.js";
import cors from "cors";
import sliderRouter from "./routes/sliderRoute.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in the .env file");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS ---
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(bodyParser.json());

// --- JWT Middleware ---
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString && tokenString.startsWith("Bearer ")) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Invalid token:", err.message);
        return res.status(403).json({ message: `Invalid token: ${err.message}` });
      }
      req.user = decoded;
      next();
    });
  } else {
    next();
  }
});

// --- MongoDB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to the database"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// --- Routes ---
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/sliders", sliderRouter);

// --- Health Check ---
app.get("/health", (req, res) => res.send("OK"));

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
