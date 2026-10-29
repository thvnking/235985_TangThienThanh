const mongoose = require("mongoose");
const Food = require("../models/Food");
const validateFood = require("../utils/validateFood");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSearchPattern(value) {
  const variants = {
    a: "aàáảãạăằắẳẵặâầấẩẫậ",
    d: "dđ",
    e: "eèéẻẽẹêềếểễệ",
    i: "iìíỉĩị",
    o: "oòóỏõọôồốổỗộơờớởỡợ",
    u: "uùúủũụưừứửữự",
    y: "yỳýỷỹỵ",
  };

  return Array.from(value, (character) => {
    const base = character.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    return variants[base]
      ? `[${variants[base]}]`
      : escapeRegex(character);
  }).join("");
}

function sendValidationError(res, errors) {
  return res.status(400).json({ error: "Dữ liệu không hợp lệ", details: errors });
}

async function getFoods(req, res, next) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const query = search
      ? {
          $or: ["name", "category", "region"].map((field) => ({
            [field]: { $regex: createSearchPattern(search), $options: "i" },
          })),
        }
      : {};

    const foods = await Food.find(query).sort({ createdAt: -1 });
    return res.json(foods);
  } catch (error) {
    return next(error);
  }
}

async function getFoodById(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "ID món ăn không hợp lệ" });
  }

  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: "Không tìm thấy món ăn" });
    }

    return res.json(food);
  } catch (error) {
    return next(error);
  }
}

async function createFood(req, res, next) {
  const errors = validateFood(req.body);
  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    const food = await Food.create(req.body);
    return res.status(201).json(food);
  } catch (error) {
    return next(error);
  }
}

async function updateFood(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "ID món ăn không hợp lệ" });
  }

  const errors = validateFood(req.body, { partial: true });
  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ error: "Không tìm thấy món ăn" });
    }

    return res.json(food);
  } catch (error) {
    return next(error);
  }
}

async function deleteFood(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "ID món ăn không hợp lệ" });
  }

  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ error: "Không tìm thấy món ăn" });
    }

    return res.json({ message: "Đã xóa món ăn", data: food });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getFoods, getFoodById, createFood, updateFood, deleteFood };
