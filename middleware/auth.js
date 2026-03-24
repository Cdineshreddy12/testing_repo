const User = require("../models/User");
const mongoose = require("mongoose");

const MAX_TOKEN_LENGTH = 2048;

function isValidBearerToken(token) {
  if (typeof token !== "string") return false;
  if (!token || token.length > MAX_TOKEN_LENGTH) return false;
  // Guard against header-injection/control characters.
  return !/[\r\n\t]/.test(token);
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!isValidBearerToken(token)) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }

  req.user = { token, _id: token };
  req.auth = {
    token,
    isUserIdToken: mongoose.isValidObjectId(token)
  };
  return next();
}

async function loadUser(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorised" });
    }

    req.user = user;
    return next();
  } catch (_err) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }
}

module.exports = { authenticate, loadUser };
