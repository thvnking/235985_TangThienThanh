const allowedFields = new Set([
  "foodId",
  "name",
  "category",
  "region",
  "description",
  "price",
]);

const stringLimits = {
  foodId: 40,
  name: 120,
  category: 80,
  region: 100,
  description: 1000,
};

function validateFood(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Nội dung request phải là một đối tượng JSON"];
  }

  const errors = [];
  const fields = Object.keys(body);

  for (const field of fields) {
    if (!allowedFields.has(field)) {
      errors.push(`Trường "${field}" không được hỗ trợ`);
    }
  }

  if (partial && fields.length === 0) {
    errors.push("Cần cung cấp ít nhất một trường để cập nhật");
  }

  if (!partial) {
    for (const field of ["foodId", "name", "category"]) {
      if (typeof body[field] !== "string" || body[field].trim().length === 0) {
        errors.push(`${field} là bắt buộc và phải là chuỗi không rỗng`);
      }
    }
  }

  for (const [field, maximum] of Object.entries(stringLimits)) {
    if (body[field] === undefined) {
      continue;
    }

    if (typeof body[field] !== "string") {
      errors.push(`${field} phải là chuỗi`);
    } else if (body[field].trim().length > maximum) {
      errors.push(`${field} không được vượt quá ${maximum} ký tự`);
    } else if (!partial && ["foodId", "name", "category"].includes(field) && !body[field].trim()) {
      continue;
    } else if (partial && ["foodId", "name", "category"].includes(field) && !body[field].trim()) {
      errors.push(`${field} không được để trống`);
    }
  }

  if (body.price !== undefined && (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0)) {
    errors.push("price phải là số hữu hạn lớn hơn hoặc bằng 0");
  }

  return errors;
}

module.exports = validateFood;
