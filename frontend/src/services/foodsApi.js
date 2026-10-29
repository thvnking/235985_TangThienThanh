const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Hãy kiểm tra backend và thử lại.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.details?.join(". ") || data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
  }

  return data;
}

export function getFoods(search = "", options = {}) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request(`/foods${query}`, options);
}

export function getFood(id) {
  return request(`/foods/${encodeURIComponent(id)}`);
}

export function createFood(food) {
  return request("/foods", { method: "POST", body: JSON.stringify(food) });
}

export function updateFood(id, food) {
  return request(`/foods/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(food),
  });
}

export function deleteFood(id) {
  return request(`/foods/${encodeURIComponent(id)}`, { method: "DELETE" });
}
