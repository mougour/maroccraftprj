import express from "express";
import User from "../models/user.js";
import Order from "../models/order.js"; 
import ArtisanReview from "../models/artisanReview.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
const usersRouter = express.Router();

// Search artisans
usersRouter.get("/search", async (req, res) => {
  try {
    const { q, role } = req.query;
    if (!q) {
      return res.json([]);
    }

    const searchQuery = {
      role: role || 'artisan',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { specialties: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } }
      ]
    };

    const artisans = await User.find(searchQuery)
      .select('-password -email -phone -role -createdAt -updatedAt')
      .lean();

    if (!artisans) {
      return res.json([]);
    }

    // Get additional stats for each artisan
    const artisansWithStats = await Promise.all(
      artisans.map(async (artisan) => {
        try {
          const stats = await User.findById(artisan._id).select('stats').lean();
          return {
            ...artisan,
            stats: stats?.stats || {
              totalSales: 0,
              completedOrders: 0,
              averageRating: 0,
              productCount: 0
            }
          };
        } catch (error) {
          console.error(`Error fetching stats for artisan ${artisan._id}:`, error);
          return {
            ...artisan,
            stats: {
              totalSales: 0,
              completedOrders: 0,
              averageRating: 0,
              productCount: 0
            }
          };
        }
      })
    );

    res.json(artisansWithStats);
  } catch (error) {
    console.error('Error searching artisans:', error);
    res.status(500).json({ 
      error: 'Failed to search artisans',
      details: error.message 
    });
  }
});

usersRouter.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

usersRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

usersRouter.put("/:id", async (req, res) => {
  try {
    console.log('Update user request body:', req.body);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

usersRouter.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats: completed orders, average rating, total sales
usersRouter.get("/stats/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Find orders that contain products belonging to this artisan and have 'delivered' status
    const completedOrders = await Order.countDocuments({
      "products.productId": { 
        $in: await Product.find({ user: userId }).distinct('_id')
      },
      status: "delivered"
    });

    // Calculate average rating from reviews for the artisan's products
    const reviews = await ArtisanReview.aggregate([
      { $match: { artisanId: new mongoose.Types.ObjectId(userId) } }, // Match reviews for this artisan
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);
    const averageRating = reviews[0] ? reviews[0].average : 0;

    // Total sales: use "totalAmount" field from Order schema and filter by artisan products
    // Calculate total sales from delivered orders containing the artisan's products
    const totalSalesResult = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          "products.productId": {
            $in: await Product.find({ user: userId }).distinct('_id')
          }
        }
      },
      {
        $unwind: "$products" // Split the products array into individual documents
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $match: {
          "productDetails.user": new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] }
          }
        }
      }
    ]);
    const totalSales = totalSalesResult[0] ? totalSalesResult[0].total : 0;

    // Get product count for the artisan
    const productCount = await Product.countDocuments({ user: userId });

    res.json({
      completedOrders,
      averageRating: averageRating,
      totalSales: totalSales,
      productCount // Include product count
    });
  } catch (error) {
    console.error('Error fetching artisan stats:', error.stack || error);
    res.status(500).json({ error: error.message });
  }
});

usersRouter.get("/artisans", async (req, res) => {
  try {
    const artisans = await User.find({ role: 'artisan' }).select('-password'); // Exclude passwords
    res.json({ artisans });
  } catch (error) {
    console.error('Error fetching artisans:', error.stack || error);
    res.status(500).json({
      error: 'Failed to fetch artisans due to server error',
      details: error.message,
    });
  }
});

// Get user notifications
usersRouter.get("/notifications/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // TODO: Implement logic to fetch notifications for the user
    // This might involve querying a Notification model or checking user-specific fields
    const notifications = []; // Placeholder for fetched notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

export default usersRouter;
