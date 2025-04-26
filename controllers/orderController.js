import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {
  // Ensure user is logged in
  if (!req.user) {
    return res.status(401).json({ message: "Please login and try again" });
  }

  const orderInfo = req.body;

  // Validate required fields
  if (!orderInfo.address || !orderInfo.phone || !orderInfo.products || !Array.isArray(orderInfo.products)) {
    return res.status(400).json({ message: "Missing required fields: address, phone, or products" });
  }

  // If name not provided, use the logged-in user's name
  if (!orderInfo.name) {
    orderInfo.name = `${req.user.firstName} ${req.user.lastName}`;
  }

  // Generate a unique order ID in the format CBC00001, CBC00002, ...
  let orderId = "CBC00001";

  try {
    // Find the most recent order, sorted by creation date
    const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].orderId;
      const lastOrderNumberString = lastOrderId.replace("CBC", "");
      const lastOrderNumber = parseInt(lastOrderNumberString);
      const newOrderNumber = lastOrderNumber + 1;
      const newOrderNumberString = String(newOrderNumber).padStart(5, "0");
      orderId = `CBC${newOrderNumberString}`;
    }

    let total = 0;
    let labeledTotal = 0;
    const products = [];

    // Validate and process products
    for (let i = 0; i < orderInfo.products.length; i++) {
      const item = await Product.findOne({ productId: orderInfo.products[i].productId });
      if (!item) {
        return res.status(404).json({
          message: `Product with productId ${orderInfo.products[i].productId} not found`
        });
      }

      if (!item.isAvailable) {
        return res.status(400).json({
          message: `Product with productId ${orderInfo.products[i].productId} is not available right now`
        });
      }

      products.push({
        productInfo: {
          productId: item.productId,
          name: item.name,
          altNames: item.altName || [], // altName යූස් කරනවා (Product Collection එකට ගැලපෙන්න)
          description: item.description || "",
          images: item.images || [],
          labeledPrice: item.labelledPrice || 0, // labelledPrice යූස් කරනවා
          price: item.price
        },
        quantity: orderInfo.products[i].qty
      });

      total += item.price * orderInfo.products[i].qty;
      labeledTotal += (item.labelledPrice || 0) * orderInfo.products[i].qty; // labelledPrice යූස් කරලා labeledTotal ගණනය
    }

    // Create and save the new order
    const newOrder = new Order({
      orderId,
      name: orderInfo.name,
      email: req.user.email,
      address: orderInfo.address,
      phone: orderInfo.phone,
      labeledTotal, // labeledTotal පළමුව
      total,
      products,
    });

    const createdOrder = await newOrder.save();
    return res.status(201).json({ message: "Order placed successfully!", order: createdOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}