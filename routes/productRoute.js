import express from "express";
import { deleteProduct, getProductById, getProducts, saveProduct, updateProduct } from "../controllers/producrController.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.post("/", saveProduct);
productRouter.delete("/:productId", deleteProduct); // : aniwaryayai
productRouter.put("/:productId", updateProduct); // : aniwaryayai
productRouter.get("/:productId", getProductById); // : aniwaryayai

export default productRouter;