import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("Đang kiểm tra kết nối...");

  useEffect(() => {
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API phản hồi ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setApiStatus(data.status === "ok" ? "Đã kết nối backend" : "Backend chưa sẵn sàng");
      })
      .catch(() => {
        setApiStatus("Không thể kết nối backend");
      });
  }, []);

  return (
    <main className="app">
      <h1>Quản lý món ăn</h1>
      <p>Frontend React đã sẵn sàng.</p>
      <p role="status">{apiStatus}</p>
    </main>
  );
}

export default App;
