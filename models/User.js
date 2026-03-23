const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
