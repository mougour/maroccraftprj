import express from "express";
import Message from "../models/message.js";
import User from "../models/user.js";
const router = express.Router();

// Send a message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get conversation between two users
router.get("/conversation", async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) return res.status(400).json({ success: false, error: "Missing user IDs" });
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ sentAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all unique users the current user has messaged with
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find all messages where the user is sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });
    // Get unique user IDs (other than the current user)
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
    });
    // Fetch user details
    const users = await User.find({ _id: { $in: Array.from(userIds) } }, 'name email profilePicture');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router; 