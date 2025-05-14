import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import orderRouter from "./routes/orderRoute.js";
import cors from 'cors';

dotenv.config();//.env file එකක තියෙන variables (උදා: MONGO_URI) load කරනවා.

const app = express();
app.use(cors({}));//cors ekak use karanawa. onema req ekakata access denawa.
app.use(bodyParser.json());

app.use((req, res, next) => {//middleware ekak wage use karanawa. token ekk check karanawa.
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (decoded != null) {
        req.user = decoded;
        next();
      } else {
        console.log("invalid token");//waradi token ekk nm block karanawa
        res.status(403).json({
          message: "Invalid token",
        });
      }
    });
  } else {
    next();//token ekk nathi unoth yanna denawa
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Database connection failed");
  });

app.use("/products", productRouter);
app.use("/users", userRouter);
app.use('/orders', orderRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
