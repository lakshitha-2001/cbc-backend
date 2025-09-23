import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import orderRouter from "./routes/orderRoute.js";
import cors from 'cors';
import sliderRouter from "./routes/sliderRoute.js";

// Load .env file only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Check for required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode - ensure variables are set in Railway dashboard');
  } else {
    process.exit(1);
  }
}

const app = express();

// Secure CORS configuration
const allowedOrigins = [
  "http://localhost:4173",
  "http://localhost:3000", 
  "http://localhost:5000",
  "http://localhost:5173",
  "https://your-vercel-app.vercel.app" // Add your Vercel URL here
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Railway and Vercel subdomains
    if (origin.includes('.railway.app') || origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    const msg = 'CORS policy: Origin not allowed';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(bodyParser.json());

// ... rest of your code remains the same
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null && tokenString.startsWith("Bearer ")) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Invalid token:", err.message);
        return res.status(403).json({
          message: `Invalid token: ${err.message}`,
        });
      }
      if (decoded) {
        req.user = decoded;
        next();
      } else {
        console.log("Invalid token: No decoded payload");
        res.status(403).json({
          message: "Invalid token",
        });
      }
    });
  } else {
    next();
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use('/api/orders', orderRouter);
app.use("/api/sliders", sliderRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});