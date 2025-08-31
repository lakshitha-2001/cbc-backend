import express from 'express';
import { createOrder, deleteOrder, getOrders, updateOrder } from '../controllers/orderController.js';



const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:orderId',  updateOrder);
router.delete('/:orderId', deleteOrder);

const orderRouter = router;

export default orderRouter;