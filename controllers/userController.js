import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Utility function to check if user is admin
export function isAdmin(req) {
  return req.user && req.user.role === 'admin';
}

// Endpoint to check admin status (optional)
export function checkIsAdmin(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ isAdmin: false });
  }
  return res.status(200).json({ isAdmin: true });
}

export function getAlluser(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }

  User.find().select('-password')
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Error fetching users',
        error: error.message,
      });
    });
}

export function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
  }
  res.status(200).json({
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
    img: req.user.img,
  });
}

export function saveUser(req, res) {
  if (req.body.role === 'admin') {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        message: req.user
          ? 'You are not authorized to create admin accounts'
          : 'Please login first to create admin accounts',
      });
    }
  }

  const hashPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashPassword,
    role: req.body.role || 'customer',
    isBlocked: req.body.isBlocked || false,
    img:
      req.body.img ||
      'https://www.freepik.com/free-vector/user-circles-set_145856997.htm#fromView=keyword&page=1&position=2&uuid=36d691cd-2815-4f14-bbe3-e161009deedd&query=Default+User',
  });

  user
    .save()
    .then((savedUser) => {
      const { password, ...userData } = savedUser.toObject();
      res.status(201).json({
        message: 'User registered successfully',
        user: userData,
      });
    })
    .catch((error) => {
      if (error.code === 11000) {
        res.status(409).json({
          message: 'Email already exists',
          error: error.message,
        });
      } else {
        res.status(400).json({
          message: 'Error registering user',
          error: error.message,
        });
      }
    });
}

export function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      const { password: _, ...userData } = user.toObject();

      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          img: user.img,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token: token,
      });
    })
    .catch((error) => {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error: error.message });
    });
}