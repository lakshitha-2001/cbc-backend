import express from 'express';

import { getAlluser, saveUser, loginUser, isAdmin, getCurrentUser, loginWithGoogle, sendOTP, resetPassword, verifyOTP } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAlluser);
router.get('/me', getCurrentUser);
router.post('/register', saveUser);
router.post('/login', loginUser);
router.get('/isAdmin', isAdmin);
router.post('/login/google', loginWithGoogle);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;