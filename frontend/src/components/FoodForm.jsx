import { useState } from "react";

const emptyFood = {
  foodId: "",
  name: "",
  category: "",
  region: "",
  description: "",
  price: "",
};

function FoodForm({ food, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(
    food
      ? {
          foodId: food.foodId || "",
          name: food.name || "",
          category: food.category || "",
          region: food.region || "",
          description: food.description || "",
          price: food.price ?? "",
        }
      : emptyFood,
  );
  const isEditing = Boolean(food);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const payload = {
      foodId: values.foodId.trim(),
      name: values.name.trim(),
      category: values.category.trim(),
      region: values.region.trim(),
      description: values.description.trim(),
    };

    if (values.price !== "") {
      payload.price = Number(values.price);
    }

    onSubmit(payload);
  }

  return (
    <form className="food-form" onSubmit={submit}>
      <label>
        Mã món ăn <span className="required">*</span>
        <input
          autoFocus
          required
          maxLength={40}
          name="foodId"
          value={values.foodId}
          onChange={updateField}
          placeholder="Ví dụ: FOOD-001"
          disabled={isEditing}
        />
        {isEditing && <small>Mã món ăn không thể thay đổi.</small>}
      </label>
      <label>
        Tên món ăn <span className="required">*</span>
        <input
          required
          maxLength={120}
          name="name"
          value={values.name}
          onChange={updateField}
          placeholder="Ví dụ: Phở bò"
        />
      </label>
      <div className="form-row">
        <label>
          Loại món <span className="required">*</span>
          <input
            required
            maxLength={80}
            name="category"
            value={values.category}
            onChange={updateField}
            placeholder="Món nước"
          />
        </label>
        <label>
          Vùng miền
          <input
            maxLength={100}
            name="region"
            value={values.region}
            onChange={updateField}
            placeholder="Miền Bắc"
          />
        </label>
      </div>
      <label>
        Giá bán (₫)
        <input
          type="number"
          min="0"
          step="1000"
          name="price"
          value={values.price}
          onChange={updateField}
          placeholder="Ví dụ: 50000"
        />
      </label>
      <label>
        Mô tả
        <textarea
          rows="3"
          maxLength={1000}
          name="description"
          value={values.description}
          onChange={updateField}
          placeholder="Mô tả ngắn về món ăn..."
        />
      </label>
      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm món ăn"}
        </button>
      </div>
    </form>
  );
}

export default FoodForm;
