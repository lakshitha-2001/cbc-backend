import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function getProducts(req, res) {
  try {
    if (isAdmin(req)) {
      const products = await Product.find();
      res.json(products);
    } else {
      const products = await Product.find({ isAvailable: true });
      res.json(products);
    }
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving products",
      error: err.message,
    });
  }
}

export async function saveProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to add products",
    });
  }

  // Destructure req.body to create the product properly
  const product = new Product({ ...req.body });

  try {
    await product.save();
    res.json({
      message: "Product added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
}

export async function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "You are not authorized to delete products",
    });
    return;
  }

  try {
    await Product.deleteOne({ productId: req.params.productId });

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}
