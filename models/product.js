import mongoose from "mongoose";

const productSchema = new mongoose.Schema({ //product structure eka define karanawa
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  altName : [
    {type: String}
  ],
  description : {
    type: String,
    required: true,
  },
  images: [
    { type: String }
  ],
  labelledPrice: {
    type: Number,
    required: true,
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
});

const Product = mongoose.model('Product', productSchema);
export default Product;