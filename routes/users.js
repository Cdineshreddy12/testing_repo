const express = require("express");
const { authenticate, loadUser } = require("../middleware/auth");
const { validateObjectId, validateBody } = require("../middleware/validate");
const User = require("../models/User");
const { normalizeNotifPrefs, buildNotifPrefsSetUpdate } = require("../utils/notifPrefs");

const router = express.Router();

router.get("/:id/profile", authenticate, validateObjectId("id"), async (req, res, next) => {
  try {
    // When token format is a user id, treat profile access as self-only.
    if (req.auth && req.auth.isUserIdToken && String(req.user._id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

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
  } catch (err) {
    return next(err);
  }
});

router.get("/me/notification-prefs", authenticate, loadUser, async (req, res, next) => {
  try {
    const prefs = normalizeNotifPrefs(req.user.notifPrefs);
    return res.json({
      success: true,
      data: { prefs }
    });
  } catch (err) {
    return next(err);
  }
});

router.patch("/me/notification-prefs", authenticate, loadUser, validateBody(), async (req, res, next) => {
  try {
    const { setFields, hasValidUpdates } = buildNotifPrefsSetUpdate(req.body);

    let updatedUser = req.user;
    if (hasValidUpdates) {
      updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: setFields }, { new: true });
    }

    const prefs = normalizeNotifPrefs(updatedUser && updatedUser.notifPrefs);
    return res.json({
      success: true,
      data: { prefs }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
