import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false, // Image is not strictly required
      default: "https://via.placeholder.com/400x250?text=No+Image", // Default placeholder
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
