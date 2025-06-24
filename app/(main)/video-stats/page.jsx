"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const API_KEY = "AIzaSyDxyU3DK-f0ty_2oIWrKG6MB3PVlHFx-qs";
const ChartJS = dynamic(() => import("@/components/ChartJS"), { ssr: false });

function extractVideoId(urlOrId) {
  // Extract video ID from URL or return as is if already ID
  const regex = /(?:v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/;
  const match = urlOrId.match(regex);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  return null;
}

export default function VideoStatsPage() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = async (e) => {
    e.preventDefault();
    setError("");
    setStats(null);
    setLoading(true);
    const videoId = extractVideoId(input.trim());
    if (!videoId) {
      setError("Vui lòng nhập đúng link hoặc ID video YouTube.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
      );
      const data = await res.json();
      if (!data.items || !data.items.length) {
        setError("Không tìm thấy video.");
      } else {
        setStats(data.items[0]);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi lấy dữ liệu.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Biểu đồ thống kê Video YouTube</h2>
      <form onSubmit={fetchStats} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Nhập link hoặc ID video YouTube"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#e11d48', color: '#fff', border: 'none' }}>Xem thống kê</button>
      </form>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {stats && (
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 24, background: '#fafafa', marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>{stats.snippet.title}</h3>
          <img src={stats.snippet.thumbnails.medium.url} alt="thumbnail" style={{ borderRadius: 8, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
            <div style={{ width: 300 }}>
              <ChartJS
                type="bar"
                data={{
                  labels: ["Lượt xem", "Like", "Bình luận"],
                  datasets: [
                    {
                      label: "Số lượng",
                      data: [
                        Number(stats.statistics.viewCount),
                        Number(stats.statistics.likeCount),
                        Number(stats.statistics.commentCount)
                      ],
                      backgroundColor: ["#3b82f6", "#22c55e", "#eab308"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 8 }}>Biểu đồ cột: Hiệu suất</div>
            </div>
            <div style={{ width: 300 }}>
              <ChartJS
                type="doughnut"
                data={{
                  labels: ["Lượt xem", "Like", "Bình luận"],
                  datasets: [
                    {
                      label: "Tỉ lệ",
                      data: [
                        Number(stats.statistics.viewCount),
                        Number(stats.statistics.likeCount),
                        Number(stats.statistics.commentCount)
                      ],
                      backgroundColor: ["#3b82f6", "#22c55e", "#eab308"],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 8 }}>Biểu đồ tròn: Tỉ lệ</div>
            </div>
          </div>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 32, fontSize: 16 }}>
            <li><b>Ngày đăng:</b> {new Date(stats.snippet.publishedAt).toLocaleString()}</li>
            <li><b>Kênh:</b> {stats.snippet.channelTitle}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
