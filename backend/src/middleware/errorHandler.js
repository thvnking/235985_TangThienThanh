const mongoose = require("mongoose");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON request không hợp lệ" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Nội dung request quá lớn" });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    const details =
      error.name === "ValidationError"
        ? Object.values(error.errors).map((item) => item.message)
        : [error.message];
    return res.status(400).json({ error: "Dữ liệu không hợp lệ", details });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: "Mã món ăn foodId đã tồn tại" });
  }

  if (
    error.name === "MongooseServerSelectionError" ||
    error.name === "MongoNetworkError" ||
    error.name === "MongoNetworkTimeoutError" ||
    (error.name === "MongooseError" && mongoose.connection.readyState !== 1)
  ) {
    console.error("MongoDB request failed:", error.message);
    return res.status(503).json({ error: "Không thể kết nối cơ sở dữ liệu" });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({ error: "Đã xảy ra lỗi máy chủ" });
}

module.exports = errorHandler;
