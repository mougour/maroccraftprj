import express from "express";
import Category from "../models/category.js";

const categoryRouter = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
categoryRouter.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default categoryRouter; 