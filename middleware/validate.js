const mongoose = require("mongoose");

function validateObjectId(param) {
  return (req, res, next) => {
    const value = req.params[param];
    const isObjectId = mongoose.isValidObjectId(value);
    const isLegacyAlnumId = typeof value === "string" && /^[A-Za-z0-9]+$/.test(value);

    if (!isObjectId && !isLegacyAlnumId) {
      return res.status(400).json({ success: false, message: `Invalid ${param}` });
    }
    return next();
  };
}

function validateBody() {
  return (req, res, next) => {
    if (req.body == null) {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }
    return next();
  };
}

module.exports = { validateObjectId, validateBody };
