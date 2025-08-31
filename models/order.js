import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  labeledTotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  shippingMethod: {
    type: String,
    required: true,
    enum: ['standard', 'express'],
    default: 'standard'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'paypal', 'cash_on_delivery'],
    default: 'credit_card'
  },
  products: [{
    productInfo: {
      productId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      altNames: [{
        type: String
      }],
      description: {
        type: String,
        required: true
      },
      images: [{
        type: String
      }],
      labeledPrice: {
        type: Number,
        required: false
      },
      price: {
        type: Number,
        required: true
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;