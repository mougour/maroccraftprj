import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi"; // For validating incoming data

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "artisan"],
    default: "user",
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  profilePicture: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
  },
  bio: {
    type: String,
  },
  // Extra artisan-related fields (optional)
  specialty: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  socialLinks: {
    instagram: { type: String },
    twitter: { type: String },
    website: { type: String },
  },
  // Email verification status
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: { 
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to generate authentication token (e.g., for login sessions)
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual field for 'id'
userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

const User = mongoose.model("User", userSchema);

// Validation function for incoming user data
const validateData = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("User Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
    isAdmin: Joi.boolean().default(false),
    role: Joi.string().valid("user", "admin", "artisan").default("user"),
  });
  return schema.validate(data);
};

// Use ES module export
export { User, validateData };
