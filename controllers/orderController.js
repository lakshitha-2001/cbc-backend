import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Please login and try again" });
  }

  const orderInfo = req.body;
  let productsArray = orderInfo.products || 
                     (orderInfo.shippingInfo && orderInfo.shippingInfo.products);

  if (!productsArray || !Array.isArray(productsArray)) {
    return res.status(400).json({ message: "Valid products array is required" });
  }

  try {
    // Generate order ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastOrderNumber = lastOrder ? parseInt(lastOrder.orderId.replace("CBC", "")) : 0;
    const orderId = `CBC${String(lastOrderNumber + 1).padStart(5, "0")}`;

    // Process products
    const products = await Promise.all(productsArray.map(async (productItem) => {
      const item = await Product.findOne({ productId: productItem.productId });
      if (!item) throw new Error(`Product ${productItem.productId} not found`);
      if (!item.isAvailable) throw new Error(`Product ${productItem.productId} unavailable`);

      return {
        productInfo: {
          productId: item.productId,
          name: item.name,
          altNames: item.altName || [],
          description: item.description || "",
          images: item.images || [],
          labeledPrice: item.labelledPrice || 0,
          price: item.price
        },
        quantity: productItem.qty
      };
    }));

    // Calculate totals
    const total = products.reduce((sum, item) => sum + (item.productInfo.price * item.quantity), 0);
    const labeledTotal = products.reduce((sum, item) => sum + (item.productInfo.labeledPrice * item.quantity), 0);

    // Create order
    const newOrder = new Order({
      orderId,
      name: orderInfo.name || `${req.user.firstName} ${req.user.lastName}`,
      email: req.user.email,
      address: orderInfo.address || (orderInfo.shippingInfo?.address),
      phone: orderInfo.phone || (orderInfo.shippingInfo?.phone),
      labeledTotal,
      total,
      products,
      status: 'pending',
      shippingMethod: orderInfo.shippingMethod || 'standard',
      paymentMethod: orderInfo.paymentInfo?.method || 'credit_card'
    });

    const createdOrder = await newOrder.save();

    const productIdsToUpdate = productsArray.map(item => item.productId);
    await Product.updateMany(
      { productId: { $in: productIdsToUpdate } },
      { $inc: { salesCount: 1 } }
    );
    
    return res.status(201).json({ 
      message: "Order created successfully", 
      order: createdOrder 
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ 
      message: error.message || "Internal server error",
      error: error.message 
    });
  }
}

export const getOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please login and try again" });
    }

    let orders;
    
    if (req.user.role === 'admin') {
      // If user is admin, get all orders
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      // If regular user, only get their own orders
      orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { status, notes },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated", order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
}

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findOneAndDelete({ orderId });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted", order: deletedOrder });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
}