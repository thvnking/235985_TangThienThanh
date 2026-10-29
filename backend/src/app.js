const express = require("express");
const mongoose = require("mongoose");
const foodRoutes = require("./routes/foodRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get(["/health", "/api/health"], (req, res) => {
  const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const status = database === "connected" ? 200 : 503;
  return res.status(status).json({ status: database === "connected" ? "ok" : "unavailable", database });
});

app.use("/api/foods", foodRoutes);
app.use((req, res) => {
  return res.status(404).json({ error: "Không tìm thấy endpoint" });
});
app.use(errorHandler);

module.exports = app;
