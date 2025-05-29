import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const testRouter = express.Router();

testRouter.post("/test-create-user", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("TestPassword123", salt);

    const newUser = new User({
      name: "Test User",
      email: `testuser${Date.now()}@example.com`,
      password: hashedPassword,
      isAdmin: false,
      role: "user",
      profilePicture: "./default.png",
      isVerified: true,
    });

    const savedUser = await newUser.save();
    console.log("Saved user:", savedUser);

    return res.status(201).json({
      message: "Test user created",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default testRouter;
