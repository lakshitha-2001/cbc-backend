import express from 'express';
import { getAlluser,loginUser,saveUser, } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.get('/', getAlluser);

userRouter.post('/', saveUser);
    
userRouter.post('/login', loginUser);
  
userRouter.put('/', );

export default userRouter;