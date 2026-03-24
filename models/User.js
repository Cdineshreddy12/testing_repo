const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 500 },
    avatarUrl: { type: String, default: "" },
    notifPrefs: {
      task_assigned: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false }
      },
      task_review: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true }
      },
      task_done: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false }
      },
      comment_mention: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true }
      },
      bug_opened: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false }
      }
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
