import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <span className="font-semibold text-lg tracking-tight">Excel AI Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          {dashboardData && (
            <button
              onClick={() => setDashboardData(null)}
              className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
            >
              ← Upload Baru
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-lg transition flex items-center gap-2"
          >
            ⚙️ LLM Settings
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {dashboardData ? (
          <DashboardPage data={dashboardData} />
        ) : (
          <UploadPage onDashboardReady={setDashboardData} />
        )}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
