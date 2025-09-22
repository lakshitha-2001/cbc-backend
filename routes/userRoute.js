import express from 'express';

import { getAlluser, saveUser, loginUser, isAdmin, getCurrentUser, loginWithGoogle, sendOTP, resetPassword, verifyOTP, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';

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

router.get('/',  getAlluser);
router.get('/me', getCurrentUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id',  deleteUser);

export default router;