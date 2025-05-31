import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinaryConfig.js";
import Product from "../models/product.js";
import Review from "../models/review.js"; // Import your Review model
import { verifyToken } from "../middleware/auth.js";

const productRouter = express.Router();

// Setup Multer for Cloudinary (Multiple Files Upload)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Setup Multer memory storage for parsing body without saving files (temporary)
// const memoryStorage = multer.memoryStorage(); // Remove this line

const upload = multer({ storage }); // Original Cloudinary upload
// const uploadMemory = multer({ storage: memoryStorage }); // Temporary: use memory storage for body parsing - remove this line

// Add a Multer error handling middleware
const uploadErrorHandler = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer Error:', err.message); // Log Multer specific error
      console.error('Multer Error Code:', err.code); // Log Multer error code
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown Upload Error:', err.message); // Log other upload errors
      console.error('Unknown Upload Error Stack:', err.stack); // Log stack trace
      return res.status(500).json({ error: `Upload failed: ${err.message}` });
    }
    // Everything went fine
    next();
  });
};

// Search products - Move this BEFORE the /:id route
productRouter.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { 'category.name': { $regex: q, $options: 'i' } }
      ]
    };

    const products = await Product.find(searchQuery)
      .populate('user', 'name profilePicture address')
      .populate('category', 'name')
      .lean();

    if (!products) {
      return res.json([]);
    }

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      error: 'Failed to search products',
      details: error.message 
    });
  }
});

// GET all products and calculate average rating for each product (simple approach)
productRouter.get("/", async (req, res) => {
  try {
    // Retrieve products and populate user data
    let products = await Product.find().populate("user").populate("category").lean();
    
    // For each product, fetch reviews and compute average rating
    products = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({ productId: product._id });
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        return { ...product, averageRating };
      })
    );
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single product (calculate rating from reviews)
productRouter.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("user").populate("category").lean();
    if (!product) return res.status(404).json({ error: "Product not found" });

    const reviews = await Review.find({ productId: req.params.id });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;
    product.averageRating = averageRating;

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new product with multiple image uploads
productRouter.post("/", verifyToken, uploadErrorHandler, async (req, res) => { // Use the new error handler here
  try {
    const { name, category, price, user, description, countInStock } = req.body;

    console.log('Product creation request body (after upload):', req.body); // Updated logging
    console.log('Uploaded files (after upload):', req.files); // Updated logging

    if (!name || !category || !price || !user) {
      console.error('Missing required fields for product creation');
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure req.files is treated as an array even if no files were uploaded
    const imageUrls = Array.isArray(req.files) ? req.files.map(file => file.path) : []; // Safer mapping

    console.log('Generated image URLs:', imageUrls); // Restore original logging

    // Set default rating to 0 (will be calculated from reviews)
    const product = new Product({
      name,
      category,
      price,
      user,
      images: imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/150"],
      description: description || "No description provided",
      countInStock: countInStock || 0,
      rating: 0,
      tags: req.body.tags ? req.body.tags.split(",") : [],
    });

    console.log('Product object before saving:', product); // Restore original logging

    await product.save();

    console.log('Product saved successfully:', product); // Restore original logging

    res.status(201).json(product);
  } catch (error) {
    // This catch block handles errors *after* successful upload/body parsing
    console.error("Error adding product (during save or later):", error.message); // Updated logging
    console.error("Error stack (during save or later):", error.stack); // Updated logging

    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Mongoose Validation Error Details (during save or later):'); // Updated logging
      for (const field in error.errors) {
        console.error(`${field}: ${error.errors[field].message}`);
      }
      res.status(400).json({ error: error.message, validationErrors: error.errors });
    } else {
      // Handle other types of errors
      res.status(500).json({ error: error.message });
    }
  }
});

// UPDATE a product (Supports Updating Multiple Images)
productRouter.put("/:id", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    let updatedData = { ...req.body };

    if (req.files.length > 0) {
      updatedData.images = req.files.map(file => file.path);
    }
    if (req.body.tags) {
      updatedData.tags = req.body.tags.split(",");
    }
    delete updatedData.rating; // Prevent manual updating of rating

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    }).populate("user");

    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a product
productRouter.delete("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET products by user
productRouter.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({ user: req.params.userId }).populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default productRouter;
