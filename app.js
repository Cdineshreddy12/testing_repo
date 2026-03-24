const express = require("express");
const usersRouter = require("./routes/users");

const app = express();

app.disable("x-powered-by");

app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.use(express.json({ limit: "100kb" }));
app.use("/api/users", usersRouter);

module.exports = app;
