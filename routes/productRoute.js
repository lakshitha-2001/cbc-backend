import express from "express";
import { deleteProduct, getBestSellers, getProductById, getProducts, saveProduct, searchProducts, updateProduct } from "../controllers/producrController.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.post("/", saveProduct);
productRouter.get("/search/:query", searchProducts); // : aniwaryayai
productRouter.get("/best-sellers", getBestSellers);
productRouter.delete("/:productId", deleteProduct); // : aniwaryayai
productRouter.put("/:productId", updateProduct); // : aniwaryayai
productRouter.get("/:productId", getProductById); // : aniwaryayai


export default productRouter;