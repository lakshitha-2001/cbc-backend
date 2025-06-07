import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function getProducts(req, res) {
  try {
    // console.log("Checking isAdmin:", isAdmin(req));
    // console.log("req.user:", req.user);
    if (isAdmin(req)) {
      const products = await Product.find();
      console.log("Products found:", products);
      res.json(products);
    } else {
      const products = await Product.find({ isAvailable: true });
      res.json(products);
    }
  } catch (err) {
    console.error("Error retrieving products:", err);
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

  const product = new Product({
    ...req.body,
    isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
  });

  try {
    await product.save();
    res.json({
      message: "Product added successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        message: "Product ID already exists",
        error: error.message,
      });
    } else if (error.name === "ValidationError") {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to add product",
        error: error.message,
      });
    }
  }
}

export async function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to delete products",
    });
  }

  try {
    await Product.deleteOne({ productId: req.params.productId });
    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
}

export async function updateProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to update products",
    });
  }
  const productId = req.params.productId;
  const updatedProduct = req.body;

  try {
    await Product.updateOne(
      { productId: productId },
      { $set: updatedProduct }
    );
    res.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function getProductById(req, res) {
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({ productId: productId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    if (product.isAvailable || isAdmin(req)) {
      res.json(product);
    } else {
      return res.status(403).json({
        message: "Product not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}