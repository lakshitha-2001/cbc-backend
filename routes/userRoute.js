import express from 'express';
import { getAlluser, saveUser, loginUser, isAdmin, getCurrentUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAlluser); // GET /api/users - Fetch all users (admin only)
router.get('/me', getCurrentUser); // GET /api/users/me - Fetch current user
router.post('/register', saveUser); // POST /api/users/register - Register a new user
router.post('/login', loginUser); // POST /api/users/login - Login user
router.get('/isAdmin', isAdmin); // GET /api/users/isAdmin - Check if user is admin

export default router;