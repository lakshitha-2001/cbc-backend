import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import nodemailer from 'nodemailer';
import Otp from '../models/otp.js';

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

export async function loginWithGoogle(req, res) {
  const accessToken = req.body.accessToken;

  if (!accessToken) {
    return res.status(400).json({ message: 'Token not provided' });
  }

  try {
    // Get user info from Google
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = response.data;
    const existingUser = await User.findOne({ email: userData.email });

    let user;
    if (!existingUser) {
      // Create a new user
      user = new User({
        email: userData.email,
        firstName: userData.given_name || '',
        lastName: userData.family_name || '',
        password: 'googleUser', // optional placeholder
        img: userData.picture || '',
      });
      await user.save();
    } else {
      user = existingUser;
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        img: user.img,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log('Google User Info:', userData);

    return res.status(200).json({
      message: 'Login successful',
      token: jwtToken,
      role: user.role,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        img: user.img,
      },
    });

  } catch (error) {
    console.error('Error verifying Google token:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
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
    img: req.body.img ||
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

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// SEND OTP FUNCTION
export async function sendOTP(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate 6-digit OTP
  const randomOTP = Math.floor(100000 + Math.random() * 900000);

  // Delete any existing OTPs for this email
  await Otp.deleteMany({ email });

  // Save new OTP
  const newOtp = new Otp({
    email: email,
    otp: randomOTP,
  });
  await newOtp.save();

  // Email content
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Resetting Password for Crystal Beauty Clear',
    text: `This is your password reset OTP: ${randomOTP}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);

    return res.status(200).json({
      message: 'OTP sent successfully',
      otp: randomOTP, // ⚠️ Remove this in production
    });
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    return res.status(500).json({ message: 'Failed to send OTP email' });
  }
}

// RESET PASSWORD FUNCTION
export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;

  if (!otp || !email || !newPassword) {
    return res.status(400).json({ message: 'OTP, email, and new password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash and update password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    // Remove all OTPs for this user
    await Otp.deleteMany({ email });

    return res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error.message);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// VERIFY OTP FUNCTION
export async function verifyOTP(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid (but don't delete it yet - we'll need it for the password reset)
    return res.status(200).json({ 
      message: 'OTP verified successfully',
      email: email,
      otp: otp
    });

  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}