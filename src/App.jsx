import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import OnboardingQuiz from "./pages/onboarding";
import Profile from "./pages/profile";
import Sidebar from "./components/sidebar";
import MoneySnapshot from "./pages/moneySnapshot";  // ← fixed name
import StrategyTracks from "./pages/strategyTracks";
import KnowYourMoney from "./pages/knowyourMoney";
import Learn from "./pages/learn";
import "./App.css";

function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/snapshot" element={<MoneySnapshot />} />   {/* ← lowercase */}
          <Route path="/tracks" element={<StrategyTracks />} />
          <Route path="/simulation" element={<KnowYourMoney />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

// Option B — export at the bottom
function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;