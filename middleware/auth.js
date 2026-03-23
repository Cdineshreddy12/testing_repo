const User = require("../models/User");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }

  req.user = { token, _id: token };
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
