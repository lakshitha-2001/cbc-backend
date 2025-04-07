import User from "../models/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function getAlluser(req, res) {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error fetching users",
        error: error.message,
      });
    });
}

export function saveUser(req, res) {

  if (req.body.role == "admin") {
    if(req.user != null ){
      if (req.user.role != "admin") {
          res.status(403).json({ 
          message: "You are not authorized to create an admin accounts" });
          return;
      }
    }
    else {
        res.status(403).json({ 
        message: "You are not authorized to create an admin accounts. please login first" });
        return;
    }
  } 

  const hashPassword = bcrypt.hashSync(req.body.password, 10);  // Hash the password with a salt round of 10
    
  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashPassword,
    role: req.body.role || "customer", // Default to 'customer' if not provided
    isBlocked: req.body.isBlocked || false, // Default to false
    img:
      req.body.img ||
      "https://www.freepik.com/free-vector/user-circles-set_145856997.htm#fromView=keyword&page=1&position=2&uuid=36d691cd-2815-4f14-bbe3-e161009deedd&query=Default+User",
  });

  user
    .save()
    .then((savedUser) => {
      // Exclude password from the response
      const { password, ...userData } = savedUser.toObject();
      res.status(201).json({
        message: "User registered successfully",
        user: userData,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        res.status(409).json({
          message: "Email already exists",
          error: error.message,
        });
      } else {
        res.status(400).json({
          message: "Error registering user",
          error: error.message,
        });
      }
    });
}

export function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Exclude password from the response
      const { password: _, ...userData } = user.toObject();

      // Generate JWT token
      const token = jwt.sign(
        { 
         email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          img: user.img
        },
        process.env.JWT_SECRET 
      );

      res.status(200).json({
        message: "Login successful",
        token: token,
      });
    })
    .catch((error) => {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in", error: error.message });
    });
} 

export function isAdmin(req, res){
  if (req.user == null) {
    return false; 
  }

  if (req.user.role != "admin") {
    return false; 

  } else {
    return true; 
  }
}