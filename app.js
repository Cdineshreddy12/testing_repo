const express = require("express");
const usersRouter = require("./routes/users");
const { createRateLimiter } = require("./middleware/rateLimit");

const app = express();

app.use(express.json());
app.use(createRateLimiter({ windowMs: 60000, max: 100 }));
app.get(
  "/api/users/:id/profile",
  createRateLimiter({ windowMs: 60000, max: 30 }),
  (_, __, next) => next()
);
app.use("/api/users", usersRouter);

module.exports = app;
