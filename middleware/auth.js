function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorised" });
  }

  req.user = { token };
  return next();
}

module.exports = { authenticate };
