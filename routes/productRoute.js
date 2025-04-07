import express from "express";
import { deleteProduct, getProducts, saveProduct } from "../controllers/producrController.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.post("/", saveProduct);
productRouter.delete("/:productId", deleteProduct); // : aniwaryayai

export default productRouter;