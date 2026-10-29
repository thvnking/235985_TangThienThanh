const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: [true, "Mã món ăn là bắt buộc"],
      unique: true,
      trim: true,
      maxlength: [40, "Mã món ăn không được vượt quá 40 ký tự"],
    },
    name: {
      type: String,
      required: [true, "Tên món ăn là bắt buộc"],
      trim: true,
      maxlength: [120, "Tên món ăn không được vượt quá 120 ký tự"],
    },
    category: {
      type: String,
      required: [true, "Loại món ăn là bắt buộc"],
      trim: true,
      maxlength: [80, "Loại món ăn không được vượt quá 80 ký tự"],
    },
    region: {
      type: String,
      trim: true,
      maxlength: [100, "Vùng miền không được vượt quá 100 ký tự"],
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
      default: "",
    },
    price: {
      type: Number,
      min: [0, "Giá món ăn không được nhỏ hơn 0"],
    },
  },
  { timestamps: true, collection: "foods" },
);

module.exports = mongoose.model("Food", foodSchema);
