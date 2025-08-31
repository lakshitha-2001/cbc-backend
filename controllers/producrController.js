import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";


export async function getProducts(req, res) {
  try {
    const { sort, limit } = req.query;
    const filter = isAdmin(req) ? {} : { isAvailable: true };

    let query = Product.find(filter);

    // Handle sorting
    if (sort) {
      const sortFields = sort.split(',').reduce((acc, field) => {
        if (field.startsWith('-')) {
          acc[field.substring(1)] = -1; // Descending
        } else {
          acc[field] = 1; // Ascending
        }
        return acc;
      }, {});
      query = query.sort(sortFields);
    }

    // Handle limit
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const products = await query.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
// In your productController.js
export async function searchProducts(req, res) {
  const searchQuery = req.params.query;
  
  try {
    // Search in name, altName, and description (case insensitive)
    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { altName: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } }
      ],
      isAvailable: true // Only show available products to non-admins
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found matching your search",
        searchQuery: searchQuery
      });
    }

    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

export async function getBestSellers(req, res) {
  try {
    const bestSellers = await Product.find({ isAvailable: true })
      .sort({ salesCount: -1 })
      .limit(12);
    res.json(bestSellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}