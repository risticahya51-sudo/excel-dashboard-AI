# 📊 Excel AI Dashboard

Upload file Excel atau CSV → AI otomatis membuat dashboard lengkap dengan chart, KPI, dan insight.

## ✨ Fitur
- Upload `.xlsx`, `.xls`, `.csv`
- AI analisis data & generate dashboard otomatis
- Chart interaktif (Bar, Line, Pie, Scatter)
- KPI cards dengan nilai real
- Insight otomatis dari AI
- Tanya jawab tentang data (Chat)
- **Custom LLM**: setting Base URL + API Key sendiri (OpenAI-compatible)

## 🛠️ Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind + Recharts |
| Backend | Python FastAPI |
| LLM | Custom URL (OpenAI-compatible API) |

---

## 🚀 Cara Menjalankan

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env: isi LLM_BASE_URL, LLM_API_KEY, LLM_MODEL

pip install -r requirements.txt
uvicorn main:app --reload
# Berjalan di http://localhost:8000
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Berjalan di http://localhost:3000
```

---

## ⚙️ Konfigurasi LLM

Edit file `backend/.env` atau langsung di UI klik **LLM Settings**:

| Provider | Base URL | Contoh Model |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| Groq | `https://api.groq.com/openai/v1` | `llama3-8b-8192` |
| Together AI | `https://api.together.xyz/v1` | `mistralai/Mixtral-8x7B` |
| OpenRouter | `https://openrouter.ai/api/v1` | `openai/gpt-3.5-turbo` |
| Ollama (lokal) | `http://localhost:11434/v1` | `llama3` |

---

## 📁 Struktur Project

```
excel-ai-dashboard/
├── backend/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings LLM
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── llm.py        # LLM client (custom URL)
│       └── analyzer.py   # Pandas analyzer
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── UploadPage.jsx
    │   │   └── DashboardPage.jsx
    │   └── components/
    │       └── SettingsModal.jsx
    ├── package.json
    └── .env.example
```

---

## 🌐 Deploy ke GitHub Pages + Railway

```bash
# Push ke GitHub
git init
git add .
git commit -m "initial: excel ai dashboard"
git remote add origin https://github.com/USERNAME/excel-ai-dashboard.git
git push -u origin main
```

Backend → deploy ke **Railway** atau **Render** (gratis)  
Frontend → deploy ke **Vercel** (gratis)
