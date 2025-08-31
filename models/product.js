import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  altName: [
    { type: String }
  ],
  description: {
    type: String,
    required: true,
  },
  images: [
    { type: String }
  ],
  labelledPrice: {
    type: Number,
    required: false
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdAt: { 
    type: Date, default: Date.now
   },
  views: {
     type: Number, default: 0 
  },
  salesCount: { type: Number, default: 0 }
});

const Product = mongoose.model('Product', productSchema);
export default Product;