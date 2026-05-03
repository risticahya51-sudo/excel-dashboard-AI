import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function UploadPage({ onDashboardReady }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress("Membaca file...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress("Menganalisis data dengan AI...");
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProgress("Membuat dashboard...");
      onDashboardReady(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal memproses file. Pastikan LLM settings sudah benar.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }, [onDashboardReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
    disabled: loading,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Upload & Analisis Otomatis
        </h1>
        <p className="text-gray-400 text-lg">
          Upload file Excel atau CSV — AI akan langsung membuatkan dashboard lengkap beserta insight.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`max-w-xl w-full border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? "border-indigo-400 bg-indigo-500/10" : "border-gray-700 hover:border-indigo-500 hover:bg-gray-900"}
          ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-4">📊</div>
        {loading ? (
          <div>
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-indigo-300 font-medium">{progress}</p>
          </div>
        ) : isDragActive ? (
          <p className="text-indigo-300 font-medium text-lg">Lepaskan file di sini...</p>
        ) : (
          <>
            <p className="text-white font-semibold text-lg mb-2">Drag & drop file di sini</p>
            <p className="text-gray-500 text-sm">atau klik untuk memilih file</p>
            <p className="text-gray-600 text-xs mt-3">Mendukung: .xlsx, .xls, .csv</p>
          </>
        )}
      </div>

      {error && (
        <div className="max-w-xl w-full mt-4 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="max-w-xl w-full mt-8 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: "🤖", label: "AI Analisis Otomatis" },
          { icon: "📈", label: "Chart Dinamis" },
          { icon: "💬", label: "Tanya Jawab Data" },
        ].map((f) => (
          <div key={f.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-xs text-gray-400">{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
