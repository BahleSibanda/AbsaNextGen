import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login          from "./pages/login";
import OnboardingQuiz from "./pages/onboarding";
import Profile        from "./pages/profile";
import Sidebar        from "./components/sidebar";
import ErrorBoundary  from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import MoneySnapshot  from "./pages/moneySnapshot";
import StrategyTracks from "./pages/strategyTracks";
import KnowYourMoney  from "./pages/knowyourMoney";
import Learn          from "./pages/learn";
import "./App.css";

// ── 404 page ──────────────────────────────────────────────────────────────────
function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "70vh", padding: "40px 24px", textAlign: "center",
      fontFamily: "'DM Sans', sans-serif", color: "#f0ebe8",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "48px 56px", maxWidth: 420,
      }}>
        <p style={{ fontSize: 56, marginBottom: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#C8102E" }}>
          404
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>
          Page not found
        </h2>
        <p style={{ fontSize: 14, color: "rgba(240,235,232,0.5)", lineHeight: 1.6, marginBottom: 28 }}>
          This page doesn't exist. Head back to your snapshot to stay on track.
        </p>
        <button
          onClick={() => navigate("/snapshot")}
          style={{
            background: "#C8102E", color: "#fff", border: "none",
            borderRadius: 10, padding: "11px 28px",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Go to Snapshot →
        </button>
      </div>
    </div>
  );
}

// ── Authenticated layout ──────────────────────────────────────────────────────
function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/snapshot"   element={<ErrorBoundary><MoneySnapshot  /></ErrorBoundary>} />
          <Route path="/tracks"     element={<ErrorBoundary><StrategyTracks /></ErrorBoundary>} />
          <Route path="/simulation" element={<ErrorBoundary><KnowYourMoney  /></ErrorBoundary>} />
          <Route path="/learn"      element={<ErrorBoundary><Learn          /></ErrorBoundary>} />
          <Route path="/profile"    element={<ErrorBoundary><Profile        /></ErrorBoundary>} />
          {/* Catch-all for unknown sub-routes */}
          <Route path="*"           element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/"        element={<Login />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/onboard" element={<OnboardingQuiz />} />
          <Route path="/*"       element={<AppLayout />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;


































































































