function createRateLimiter({
  windowMs = 60000,
  max = 100,
  message = "Too many requests",
} = {}) {
  const store = new Map();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();

    for (const [ip, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(ip);
      }
    }
  }, windowMs);

  cleanupInterval.unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const existing = store.get(ip);

    if (!existing || existing.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    existing.count += 1;

    if (existing.count > max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
}

module.exports = { createRateLimiter };
