import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PRESETS = [
  { label: "OpenAI", base_url: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { label: "Groq", base_url: "https://api.groq.com/openai/v1", model: "llama3-8b-8192" },
  { label: "Together AI", base_url: "https://api.together.xyz/v1", model: "mistralai/Mixtral-8x7B-Instruct-v0.1" },
  { label: "OpenRouter", base_url: "https://openrouter.ai/api/v1", model: "openai/gpt-3.5-turbo" },
  { label: "Ollama (lokal)", base_url: "http://localhost:11434/v1", model: "llama3" },
  { label: "Custom", base_url: "", model: "" },
];

export default function SettingsModal({ onClose }) {
  const [form, setForm] = useState({ base_url: "", api_key: "", model: "" });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/config`).then((res) => {
      setForm({
        base_url: res.data.base_url || "",
        api_key: res.data.has_api_key ? "••••••••" : "",
        model: res.data.model || "",
      });
    });
  }, []);

  const applyPreset = (preset) => {
    setForm((f) => ({ ...f, base_url: preset.base_url, model: preset.model }));
  };

  const save = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/config`, {
        base_url: form.base_url,
        api_key: form.api_key.startsWith("•") ? undefined : form.api_key,
        model: form.model,
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch {
      alert("Gagal menyimpan settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">⚙️ LLM Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">✕</button>
        </div>

        {/* Presets */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2">Provider Cepat</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Base URL</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={form.base_url}
              onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              placeholder="https://api.openai.com/v1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">API Key</label>
            <input
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Model</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="gpt-4o-mini"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition"
        >
          {saved ? "✓ Tersimpan!" : loading ? "Menyimpan..." : "Simpan Settings"}
        </button>
      </div>
    </div>
  );
}
