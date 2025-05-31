import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/order.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

const orderRouter = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders with optional filtering and pagination
 * @access  Public
 */
orderRouter.get("/", async (req, res) => {
    try {
        const { status, customerId, page = 1, limit = 10 } = req.query;
        const filter = {};
        
        if (status) filter.status = status;
        if (customerId) filter.customerId = customerId;

        const orders = await Order.find(filter)
            .populate("customerId", "name email")  // Populate user details
            .populate("products.productId", "name price")  // Populate product details
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ orderDate: -1 });

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Public
 */
orderRouter.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customerId", "name email")
            .populate({
                path: "products.productId",
                select: "name price user",
                populate: {
                    path: "user",
                    select: "name email _id"
                }
            });

        if (!order) return res.status(404).json({ success: false, error: "Order not found" });

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Public
 */
orderRouter.post(
    "/",
    [
        body("customerId").notEmpty().withMessage("Customer ID is required"),
        body("products").isArray({ min: 1 }).withMessage("At least one product is required"),
        body("products.*.productId").notEmpty().withMessage("Product ID is required"),
        body("products.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
        body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { customerId, products,totalAmount, shippingAddress } = req.body;
            
            // Calculate totalAmount dynamically
            // const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const order = new Order({
                customerId,
                products,
                totalAmount,
                shippingAddress,
            });

            await order.save();
            res.status(201).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update an order
 * @access  Public
 */
orderRouter.put(
    "/:id",
    [
        body("products").optional().isArray({ min: 1 }).withMessage("At least one product is required"),
        body("products.*.productId").optional().notEmpty().withMessage("Product ID is required"),
        body("products.*.quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
        body("paymentStatus").optional().isIn(["paid", "pending", "failed"]).withMessage("Invalid payment status"),
        body("shippingAddress").optional().notEmpty().withMessage("Shipping address is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const order = await Order.findById(req.params.id);
            if (!order) return res.status(404).json({ success: false, error: "Order not found" });

            const { products, paymentStatus, shippingAddress } = req.body;

            if (products) {
                order.products = products;
                order.totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
            }
            if (paymentStatus) order.paymentStatus = paymentStatus;
            if (shippingAddress) order.shippingAddress = shippingAddress;

            await order.save();
            res.json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete an order
 * @access  Public
 */
orderRouter.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ success: false, error: "Order not found" });

        res.json({ success: true, message: "Order deleted successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

orderRouter.get("/user/:userId", async (req, res) => {
    try {
        const { status, customerId, page = 1, limit = 10 } = req.query;

        const orders = await Order.find({ customerId: req.params.userId })
           .populate("customerId")  // Populate user details
            .populate("products.productId")  // Populate product details
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ orderDate: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add a new route to get orders for a specific artisan's products
orderRouter.get("/artisan/:userId", async (req, res) => {
  try {
    const artisanId = req.params.userId;

    // Find orders that contain products where the product's user matches the artisanId
    // This involves looking into the 'products' array within each order
    const orders = await Order.find({
      "products.productId": { // Look into the products array
        $in: await Product.find({ user: artisanId }).distinct('_id') // Find products by this artisan and get their IDs
      }
    })
    .populate("customerId", "name email")  // Populate customer details
    .populate("products.productId", "name price user") // Populate product details, including the user (artisan)
    .sort({ orderDate: -1 });

    // Although the query above finds orders containing the artisan's products,
    // it might also return orders with other products. If you only want to show
    // the items from this artisan within the order, you'd need further processing
    // on the frontend or adjust the query/aggregation here.
    // For simplicity, this query finds orders where at least one product is by the artisan.

    // Optional: Filter out orders that somehow passed the query but have no products by the artisan
    // This can happen if the product was deleted or the product's artisan changed.
    const filteredOrders = orders.filter(order =>
        order.products.some(item =>
            item.productId && item.productId.user && item.productId.user.toString() === artisanId
        )
    );

    res.json({ success: true, count: filteredOrders.length, orders: filteredOrders });
  } catch (error) {
    console.error("Error fetching artisan orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch artisan orders." });
  }
});

// New route to get customer order statistics
orderRouter.get("/user/:id/stats", async (req, res) => {
  try {
    const customerId = req.params.id;

    // Count total orders for the customer
    const totalOrders = await Order.countDocuments({ customerId: customerId });

    // Calculate total amount spent by the customer
    const totalSpentResult = await Order.aggregate([
      { $match: { customerId: new mongoose.Types.ObjectId(customerId) } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalSpent = totalSpentResult[0] ? totalSpentResult[0].total : 0;

    res.json({ success: true, totalOrders, totalSpent });
  } catch (error) {
    console.error("Error fetching customer order stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch customer order stats." });
  }
});

// Add a new route to update the status of an order
orderRouter.put("/:id/status", [
    body("status").notEmpty().withMessage("Status is required")
                 .isIn(["pending", "shipped", "delivered", "cancelled"]).withMessage("Invalid status"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        order.status = req.body.status;

        // Assuming a 'deliveredAt' field needs to be set when status is 'delivered'
        if (order.status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();
        res.json({ success: true, message: "Order status updated successfully", order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, error: "Failed to update order status." });
    }
});

export default orderRouter;
