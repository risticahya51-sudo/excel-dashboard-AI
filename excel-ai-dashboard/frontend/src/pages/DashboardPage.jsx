import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5"];

function KPICard({ kpi }) {
  const fmt = (v) => {
    if (v == null) return "—";
    if (kpi.format === "currency") return `Rp ${Number(v).toLocaleString("id-ID")}`;
    if (kpi.format === "percent") return `${Number(v).toFixed(1)}%`;
    return Number(v).toLocaleString("id-ID", { maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-gray-400 text-sm mb-1">{kpi.label}</p>
      <p className="text-2xl font-bold text-white">{fmt(kpi.value)}</p>
      <p className="text-xs text-gray-600 mt-1">{kpi.aggregation} · {kpi.column}</p>
    </div>
  );
}

function ChartCard({ chart, data }) {
  const x = chart.x_column;
  const y = chart.y_column;

  const renderChart = () => {
    if (!data || data.length === 0)
      return <div className="text-gray-600 text-sm text-center py-10">Data tidak tersedia</div>;

    if (chart.type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey={y} nameKey={x} cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey={x} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
            <Line type="monotone" dataKey={y} stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === "scatter") {
      return (
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey={x} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis dataKey={y} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
            <Scatter data={data} fill="#6366f1" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    // Default: bar
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey={x} tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
          <Bar dataKey={y} fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="font-semibold text-white mb-1">{chart.title}</h3>
      <p className="text-gray-500 text-xs mb-4">{chart.description}</p>
      {renderChart()}
    </div>
  );
}

export default function DashboardPage({ data }) {
  const { filename, dashboard, chart_data, stats } = data;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const context = `File: ${filename}, Rows: ${stats.rows}, Columns: ${stats.cols}, Summary: ${dashboard.summary}`;

  const askQuestion = async () => {
    if (!question.trim()) return;
    setChatLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { question, context });
      setAnswer(res.data.answer);
    } catch {
      setAnswer("Gagal mendapatkan jawaban. Coba lagi.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <span>📁</span>
          <span>{filename}</span>
          <span>·</span>
          <span>{stats.rows.toLocaleString()} baris</span>
          <span>·</span>
          <span>{stats.cols} kolom</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{dashboard.title}</h1>
        <p className="text-gray-400 mt-2 max-w-3xl">{dashboard.summary}</p>
      </div>

      {/* KPIs */}
      {dashboard.kpis?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {dashboard.kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {dashboard.charts?.map((chart) => (
          <ChartCard key={chart.id} chart={chart} data={chart_data[chart.id]} />
        ))}
      </div>

      {/* Insights */}
      {dashboard.insights?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-white mb-4">💡 Insight AI</h2>
          <ul className="space-y-2">
            {dashboard.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="text-indigo-400 mt-0.5">→</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chat */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">💬 Tanya Tentang Data Ini</h2>
        <div className="flex gap-3">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="Contoh: Apa produk dengan penjualan tertinggi?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          />
          <button
            onClick={askQuestion}
            disabled={chatLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
          >
            {chatLoading ? "..." : "Tanya"}
          </button>
        </div>
        {answer && (
          <div className="mt-4 bg-gray-800 rounded-xl p-4 text-gray-300 text-sm leading-relaxed">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
