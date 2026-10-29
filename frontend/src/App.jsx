import { useCallback, useEffect, useState } from "react";
import FoodForm from "./components/FoodForm.jsx";
import { createFood, deleteFood, getFood, getFoods, updateFood } from "./services/foodsApi.js";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const foodImages = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80",
];

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
            <p className="eyebrow">LÒ PIZZA · THỰC ĐƠN NHÀ LÒ</p>
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
      <div className="announcement">
        <span className="announcement-spark">✳</span>
        NƯỚNG TƯƠI MỖI NGÀY <span className="announcement-divider">·</span> NGON NHƯ Ở Ý
        <span className="announcement-spark">✳</span>
      </div>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Lò Pizza - trang chủ">
          <span className="brand-mark" aria-hidden="true">🍕</span>
          <span>LÒ PIZZA<span className="brand-dot">.</span></span>
        </a>
        <nav className="topbar-nav" aria-label="Điều hướng chính">
          <a href="#menu">Thực đơn</a>
          <a href="#story">Câu chuyện</a>
        </nav>
        <a className="topbar-order" href="#menu">Ghé thăm gian bếp <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker"><span className="kicker-dot" /> PIZZERIA · TỪ 2024</span>
          <h1>Một miếng pizza,<br />ấm cả <em>buổi tối.</em></h1>
          <p className="hero-description">
            Đế bánh nướng lò đá, sốt cà chua chín mọng và những buổi tối quây quần thật lâu.
          </p>
          <div className="hero-actions">
            <a className="button button-primary hero-cta" href="#menu">
              Khám phá thực đơn <span aria-hidden="true">↘</span>
            </a>
            <span className="hero-note">Làm thủ công, nướng bằng lửa thật.</span>
          </div>
          <div className="hero-stats">
            <div><strong>48<span>h</span></strong><small>ủ bột chậm</small></div>
            <i />
            <div><strong>100<span>%</span></strong><small>nguyên liệu tươi</small></div>
            <i />
            <div><strong>400<span>°</span></strong><small>lò đá thủ công</small></div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src={foodImages[0]}
            alt="Pizza nướng lò với phô mai và cà chua tươi"
            className="hero-image"
          />
          <div className="hero-image-shade" />
          <div className="hero-stamp"><span>FATTO</span><strong>con<br />amore</strong><span>DAL 2024</span></div>
          <div className="hero-image-caption"><span className="caption-line" /> LÒ NƯỚNG ĐANG ĐỎ LỬA</div>
        </div>
      </section>

      <section className="menu-section" id="menu" aria-labelledby="menu-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TỪ LÒ NÓNG, VỚI TÌNH YÊU</p>
            <h2 id="menu-heading">Thực đơn nhà Lò<span>.</span></h2>
            <p className="section-description">Món ngon làm thủ công, dành cho những cuộc vui không vội.</p>
          </div>
          <button className="button button-primary add-button" type="button" onClick={openCreate}>
            <span aria-hidden="true">＋</span> Thêm món vào thực đơn
          </button>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Bạn đang thèm món gì?"
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
            {loading ? "Đang tải..." : `${foods.length} món ngon`}
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
            <div className="empty-illustration" aria-hidden="true">🍕</div>
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
                <div className={`food-card-accent accent-${index % 3}`}>
                  <img
                    src={foodImages[index % foodImages.length]}
                    alt=""
                    loading="lazy"
                  />
                  <span className="food-image-tag">TỪ LÒ NHÀ LÒ</span>
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
                  <p className="food-description">{food.description || "Nướng thủ công, thơm ngon trong từng miếng."}</p>
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
        <div className="footer-brand"><span className="footer-mark">🍕</span><span>LÒ PIZZA<span className="brand-dot">.</span></span></div>
        <span id="story">Bột, lửa và những câu chuyện quanh bàn ăn.</span>
        <span className="footer-est">FATTO CON AMORE · 2024</span>
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
