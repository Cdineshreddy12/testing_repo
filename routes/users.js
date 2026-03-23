const express = require("express");
const { authenticate } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/:id/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email bio avatarUrl createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const avatarUrl =
      user.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;

    return res.json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (_err) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
});

module.exports = router;
