import { useCallback, useEffect, useState } from "react";
import FoodForm from "./components/FoodForm.jsx";
import { createFood, deleteFood, getFood, getFoods, updateFood } from "./services/foodsApi.js";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`modal${wide ? " modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">BẾP NHÀ · QUẢN LÝ THỰC ĐƠN</p>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Đóng" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [detailFood, setDetailFood] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadFoods = useCallback(async (term, signal) => {
    setLoading(true);
    setError("");

    try {
      setFoods(await getFoods(term, { signal }));
    } catch (requestError) {
      if (signal?.aborted) return;
      setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => loadFoods(search.trim(), controller.signal), 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, loadFoods]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function openCreate() {
    setFormError("");
    setModal({ type: "create" });
  }

  async function openDetail(food) {
    setDetailFood({ loading: true });
    setModal({ type: "detail" });

    try {
      setDetailFood(await getFood(food._id));
    } catch (requestError) {
      setDetailFood({ error: requestError.message });
    }
  }

  async function submitFood(values) {
    setSubmitting(true);
    setFormError("");

    try {
      if (modal.type === "edit") {
        await updateFood(modal.food._id, values);
        setNotice("Đã cập nhật món ăn thành công.");
      } else {
        await createFood(values);
        setNotice("Đã thêm món ăn mới thành công.");
      }

      setModal(null);
      await loadFoods(search.trim());
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(food) {
    setFormError("");
    setModal({ type: "edit", food });
  }

  async function removeFood(food) {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${food.name}"?`)) return;

    setDeletingId(food._id);
    setError("");
    try {
      await deleteFood(food._id);
      setNotice(`Đã xóa món "${food.name}".`);
      await loadFoods(search.trim());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId("");
    }
  }

  const isSearching = search.trim().length > 0;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Bếp Nhà - trang chủ">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>Bếp Nhà<span className="brand-dot">.</span></span>
        </a>
        <span className="topbar-caption">KHÔNG GIAN QUẢN LÝ ẨM THỰC</span>
        <span className="topbar-avatar" aria-label="Quản trị viên">TN</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THỰC ĐƠN CỦA BẠN</p>
          <h1>Món ngon mỗi ngày<span>.</span></h1>
          <p className="hero-description">
            Quản lý bộ sưu tập món ăn của bạn — gọn gàng, dễ dàng và đầy cảm hứng.
          </p>
        </div>
        <div className="hero-decoration" aria-hidden="true">
          <span>✳</span>
          <span>✳</span>
          <span>✳</span>
        </div>
      </section>

      <section className="menu-section" aria-labelledby="menu-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BỘ SƯU TẬP</p>
            <h2 id="menu-heading">Danh sách món ăn</h2>
          </div>
          <button className="button button-primary add-button" type="button" onClick={openCreate}>
            <span aria-hidden="true">＋</span> Thêm món mới
          </button>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên món, loại món, vùng miền..."
              aria-label="Tìm kiếm món ăn"
            />
            {search && (
              <button
                type="button"
                className="clear-search"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>
          <span className="result-count">
            {loading ? "Đang tải..." : `${foods.length} món ăn`}
          </span>
        </div>

        {notice && <div className="notice" role="status">{notice}</div>}
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" className="text-button" onClick={() => loadFoods(search.trim())}>
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="food-grid" aria-label="Đang tải danh sách món ăn">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="food-card skeleton" key={index}>
                <div className="skeleton-line skeleton-short" />
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        ) : !error && foods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true">✳</div>
            <h3>{isSearching ? "Chưa tìm thấy món ăn" : "Thực đơn còn trống"}</h3>
            <p>
              {isSearching
                ? "Thử một từ khóa khác hoặc kiểm tra cách viết nhé."
                : "Thêm món ăn đầu tiên để bắt đầu xây dựng bộ sưu tập của bạn."}
            </p>
            {isSearching ? (
              <button className="button button-secondary" type="button" onClick={() => setSearch("")}>
                Xóa tìm kiếm
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={openCreate}>
                ＋ Thêm món ăn đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food, index) => (
              <article className="food-card" key={food._id}>
                <div className={`food-card-accent accent-${index % 4}`} aria-hidden="true">
                  <span>{["✳", "❋", "✿", "❊"][index % 4]}</span>
                  <span className="food-card-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="food-card-content">
                  <div className="food-meta">
                    <span className="category-chip">{food.category}</span>
                    {food.region && <span className="region-label">{food.region}</span>}
                  </div>
                  <button className="food-name" type="button" onClick={() => openDetail(food)}>
                    {food.name}
                  </button>
                  <p className="food-description">
                    {food.description || "Một món ngon đang chờ bạn khám phá."}
                  </p>
                  <div className="food-card-footer">
                    <span className="food-price">
                      {typeof food.price === "number" ? currency.format(food.price) : "Chưa có giá"}
                    </span>
                    <span className="food-id">{food.foodId}</span>
                  </div>
                  <div className="card-actions">
                    <button className="action-button" type="button" onClick={() => openDetail(food)}>
                      Chi tiết
                    </button>
                    <button className="action-button" type="button" onClick={() => startEdit(food)}>
                      Chỉnh sửa
                    </button>
                    <button
                      className="action-button action-delete"
                      type="button"
                      onClick={() => removeFood(food)}
                      disabled={deletingId === food._id}
                    >
                      {deletingId === food._id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>BẾP NHÀ<span className="brand-dot">.</span></span>
        <span>Nuôi dưỡng cảm hứng trong từng món ăn.</span>
      </footer>

      {modal?.type === "create" && (
        <Modal title="Thêm món ăn mới" onClose={() => setModal(null)} wide>
          <p className="modal-description">Điền thông tin để thêm món ăn vào bộ sưu tập của bạn.</p>
          {formError && <div className="error-banner" role="alert">{formError}</div>}
          <FoodForm onSubmit={submitFood} onCancel={() => setModal(null)} submitting={submitting} />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Chỉnh sửa món ăn" onClose={() => setModal(null)} wide>
          <p className="modal-description">Cập nhật thông tin cho món {modal.food.name}.</p>
          {formError && <div className="error-banner" role="alert">{formError}</div>}
          <FoodForm
            food={modal.food}
            onSubmit={submitFood}
            onCancel={() => setModal(null)}
            submitting={submitting}
          />
        </Modal>
      )}

      {modal?.type === "detail" && (
        <Modal title="Thông tin món ăn" onClose={() => setModal(null)}>
          {detailFood?.loading ? (
            <p className="detail-loading" role="status">Đang tải thông tin món ăn...</p>
          ) : detailFood?.error ? (
            <div className="error-banner" role="alert">{detailFood.error}</div>
          ) : detailFood ? (
            <div className="detail-content">
              <span className="category-chip">{detailFood.category}</span>
              <h3>{detailFood.name}</h3>
              <p className="detail-price">
                {typeof detailFood.price === "number" ? currency.format(detailFood.price) : "Chưa có giá"}
              </p>
              <dl className="detail-list">
                <div><dt>Mã món ăn</dt><dd>{detailFood.foodId}</dd></div>
                <div><dt>Vùng miền</dt><dd>{detailFood.region || "Chưa cập nhật"}</dd></div>
                <div><dt>Mô tả</dt><dd>{detailFood.description || "Chưa có mô tả."}</dd></div>
                {detailFood.createdAt && (
                  <div>
                    <dt>Ngày tạo</dt>
                    <dd>{new Date(detailFood.createdAt).toLocaleDateString("vi-VN")}</dd>
                  </div>
                )}
              </dl>
              <div className="form-actions">
                <button className="button button-secondary" type="button" onClick={() => setModal(null)}>
                  Đóng
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => startEdit(detailFood)}
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </main>
  );
}

export default App;
