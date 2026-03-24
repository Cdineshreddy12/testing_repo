const express = require("express");
const usersRouter = require("./routes/users");
const { createRateLimiter } = require("./middleware/rateLimit");

const app = express();

app.disable("x-powered-by");

app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.use(express.json({ limit: "100kb" }));
app.use(createRateLimiter({ windowMs: 60000, max: 100 }));
app.get(
  "/api/users/:id/profile",
  createRateLimiter({ windowMs: 60000, max: 30 }),
  (_, __, next) => next()
);
app.use("/api/users", usersRouter);

module.exports = app;
