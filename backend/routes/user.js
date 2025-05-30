import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User, { validateData } from "../models/user.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinaryConfig.js";
import transporter from "../config/email.js";
import Message from "../models/message.js";
import Order from "../models/order.js";
import ArtisanReview from "../models/artisanReview.js";

dotenv.config(); // Load .env variables

const userRouter = express.Router();

// Configure Cloudinary + Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profilePictures",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// Add a Multer error handling middleware for profile pictures
const profileUploadErrorHandler = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Profile Picture Multer Error:', err.message); // Log Multer specific error
      console.error('Profile Picture Multer Error Code:', err.code); // Log Multer error code
      return res.status(400).json({ error: `Profile picture upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown Profile Picture Upload Error:', err.message); // Log other upload errors
      console.error('Unknown Profile Picture Upload Error Stack:', err.stack); // Log stack trace
      return res.status(500).json({ error: `Profile picture upload failed: ${err.message}` });
    }
    // Everything went fine
    next();
  });
};

// ------------------
// Route: Verify Email (GET)
// ------------------
userRouter.get("/verify-email/:token", async (req, res) => {
  try {
    const token = decodeURIComponent(req.params.token);
    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }
    if (user.isVerified) {
      return res.redirect("http://localhost:5174/login?msg=Email+already+verified");
    }
    user.isVerified = true;
    await user.save();
    return res.redirect("https://rarely-frontend.onrender.com/login?msg=Email+verified+successfully");
  } catch (error) {
    console.error("Email verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token" });
    }
    return res.status(500).json({ error: "Server error verifying email" });
  }
});

// ------------------
// Route: Upload Profile Picture (POST)
// ------------------
userRouter.post("/upload", profileUploadErrorHandler, async (req, res) => {
  if (!req.file) {
    console.error('No file received in profile picture upload.'); // Add logging
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log('Profile picture uploaded successfully:', req.file.path); // Add logging
  res.json({ imageUrl: req.file.path });
});

// ------------------
// Route: Register User (POST)
// ------------------
userRouter.post("/", async (req, res) => {
  try {
    console.log("Registration request body:", req.body);
    const { error } = validateData(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ error: "User with given email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create the user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      isAdmin: req.body.isAdmin || false,
      role: req.body.role || "user",
      profilePicture: req.body.profilePicture || "./default.png",
      isVerified: true,
    });
    const savedUser = await newUser.save();

    // Workaround: forcibly update isVerified to true after save
    await User.findByIdAndUpdate(savedUser._id, { isVerified: true });

    // Reload the user after update
    const updatedUser = await User.findById(savedUser._id);

    // Generate a JWT token valid for 1 day (for email verification)
    // Skipping email verification as user should be verified immediately
    return res.status(201).json({
      message: "Registration successful! Your account is verified.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in registration route:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ------------------
// Route: Forgot Password (POST)
// ------------------
userRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ email });
    // For security, always return success even if user is not found
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }
    // Generate a reset token valid for 1 hour
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const encodedResetToken = encodeURIComponent(resetToken);
    // This link is for GET route (see below) which redirects to your front-end form
    const resetUrl = `http://localhost:5000/api/register/reset-password?token=${encodedResetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Reset Your Password</title>
            <style>
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #eaeaea;
                font-family: Arial, sans-serif;
                background-color: #fafafa;
                color: #333;
              }
              .header {
                text-align: center;
                padding-bottom: 20px;
              }
              .btn {
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 4px;
                display: inline-block;
                margin: 20px 0;
              }
              .footer {
                font-size: 0.9em;
                color: #777;
                text-align: center;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Password Reset</h2>
              </div>
              <p>You have requested to reset your password. Click the link below to reset your password:</p>
              <p><a href="${resetUrl}" class="btn">Reset Password</a></p>
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <div class="footer">
                <p>This link will expire in 1 hour.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Server error processing password reset request" });
  }
});

// ------------------
// Route: Reset Password (GET) - Redirect to front-end form
// ------------------
userRouter.get("/reset-password", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Invalid or missing token.");
    }
    // Instead of showing an HTML form here, redirect to your front-end page
    // e.g. "https://rarely-frontend.onrender.com/reset-password?token=..."
    return res.redirect(`https://rarely-frontend.onrender.com/reset-password?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error("Reset password (GET) error:", error);
    return res.status(500).send("Server error");
  }
});

// ------------------
// Route: Reset Password (POST) - Actually update the password
// ------------------
userRouter.post("/reset-password", async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }
    // Hash the new password and update user
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid token" });
    }
    return res.status(500).json({ error: "Server error resetting password" });
  }
});

// ------------------
// Route: Update User (PUT /:id)
// ------------------
userRouter.put("/:id", upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
    if (req.body.address) user.address = req.body.address;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.role) user.role = req.body.role;
    if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;

    if (req.body.isVerified !== undefined) user.isVerified = req.body.isVerified;
    

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.file) {
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();
    return res.json(updatedUser);
  } catch (error) {
    console.error("User update error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Notifications endpoint for artisan
userRouter.get("/notifications/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Unread messages: messages where receiver is userId and not marked as read
    const unreadMessages = await Message.countDocuments({ receiver: userId, read: { $ne: true } });
    const latestMessages = await Message.find({ receiver: userId, read: { $ne: true } })
      .sort({ sentAt: -1 }).limit(5).populate('sender', 'name email profilePicture');

    // New orders: orders where at least one product's artisan is userId and status is 'pending'
    const newOrders = await Order.countDocuments({
      'products.productId': { $exists: true },
      status: 'pending',
      // You may need to adjust this if you store artisan/user on the product
    });
    const latestOrders = await Order.find({
      'products.productId': { $exists: true },
      status: 'pending',
    }).sort({ orderDate: -1 }).limit(5);

    // New reviews: reviews for this artisan not yet seen (assuming a 'seen' field)
    const newReviews = await ArtisanReview.countDocuments({ artisanId: userId, seen: { $ne: true } });
    const latestReviews = await ArtisanReview.find({ artisanId: userId, seen: { $ne: true } })
      .sort({ createdAt: -1 }).limit(5);

    res.json({
      unreadMessages,
      newOrders,
      newReviews,
      latestMessages,
      latestOrders,
      latestReviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default userRouter;
