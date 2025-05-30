import express from "express";
import bcrypt from "bcryptjs";
import User, { validateData } from "../models/user.js";
import Joi from "joi";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "marocraft/profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register a new user
router.post("/register", upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    console.log('Registration request file:', req.file);

    // Validate request data
    const { error } = validateData(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      profilePicture: req.file ? req.file.path : '/default.png',
    };

    // Add artisan-specific fields if role is artisan
    if (req.body.role === 'artisan') {
      if (!req.body.phone || !req.body.address || !req.body.description || !req.body.specialties) {
        return res.status(400).json({ 
          error: "Artisan registration requires phone, address, description, and specialties" 
        });
      }
      userData.phone = req.body.phone;
      userData.address = req.body.address;
      userData.description = req.body.description;
      userData.specialties = req.body.specialties;
    }

    console.log('Creating user with data:', {
      ...userData,
      password: '[REDACTED]'
    });

    const user = new User(userData);

    // Save user to database
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Return user data (excluding password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      description: user.description,
      profilePicture: user.profilePicture,
      specialties: user.specialties,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering user: " + error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    // Validate request data
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = user.generateAuthToken();

    // Return user data
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      description: user.description,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Validate login data
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

export default router;
