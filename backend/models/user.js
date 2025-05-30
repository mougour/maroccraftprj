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
    enum: ["customer", "artisan"],
    default: "customer",
    required: true,
  },
  profilePicture: {
    type: String,
    default: './default.png',
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  description: {
    type: String,
  },
  // Extra artisan-related fields
  specialties: [{
    type: String,
  }],
  coverImage: {
    type: String,
    default: './default-cover.png',
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  orderCount: {
    type: Number,
    default: 0,
  },
  socialLinks: {
    instagram: { type: String },
    twitter: { type: String },
    website: { type: String },
  },
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
    name: Joi.string().required().label("Full Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(6).required().label("Password"),
    role: Joi.string().valid("customer", "artisan").required().label("Role"),
    profilePicture: Joi.string().optional(),
    // Optional fields for artisan
    phone: Joi.when('role', {
      is: 'artisan',
      then: Joi.string().required().label("Phone Number"),
      otherwise: Joi.string().optional().allow(''),
    }),
    address: Joi.when('role', {
      is: 'artisan',
      then: Joi.string().required().label("Address"),
      otherwise: Joi.string().optional().allow(''),
    }),
    description: Joi.when('role', {
      is: 'artisan',
      then: Joi.string().required().label("Description"),
      otherwise: Joi.string().optional().allow(''),
    }),
    specialties: Joi.when('role', {
      is: 'artisan',
      then: Joi.array().items(Joi.string()).min(1).required().label("Specialties"),
      otherwise: Joi.array().items(Joi.string()).optional().allow(null),
    }),
  });
  return schema.validate(data);
};

// Use ES module export
export default mongoose.model("User", userSchema);
export { validateData };
