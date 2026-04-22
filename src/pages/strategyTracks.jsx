import { useState, useEffect } from "react";
import "../styles/strategyTracks.css";
 
const ABSA_RED  = "#C8102E";
const DARK_NAVY = "#0f1923";
 
const tracks = [
  {
    id: "property",
    icon: "",
    name: "Property Builder",
    tagline: "Own your first home within 5 years",
    color: ABSA_RED,
    description: "Designed for professionals who want to purchase property within the next 3–5 years. This track keeps you focused on building a deposit, optimising your credit score, and maintaining stable financial habits.",
    prioritises: ["Saving for deposit", "Credit score optimisation", "Stable income habits", "Reducing unnecessary debt"],
    avoids: ["Large depreciating purchases", "Excessive lifestyle inflation", "Revolving credit card debt"],
    milestones: [
      { year: "Year 1", label: "Emergency Fund", detail: "Build 3–6 months expenses (R24 000+)", done: true,  color: "#1D9E75" },
      { year: "Year 2", label: "Deposit Savings", detail: "Save R80 000+ towards deposit", done: false, color: ABSA_RED },
      { year: "Year 3", label: "Pre-approval", detail: "Achieve home loan pre-approval", done: false, color: "#EF9F27" },
      { year: "Year 4", label: "Property Purchase", detail: "Buy your first property", done: false, color: "#378ADD" },
    ],
    stats: [{ label: "Avg deposit needed", value: "R200k" }, { label: "Target savings rate", value: "25%" }, { label: "Timeline", value: "4 yrs" }],
  },
  {
    id: "balanced",
    icon: "",
    name: "Balanced Lifestyle",
    tagline: "Invest consistently, live well today",
    color: "#1D9E75",
    description: "For professionals who want to enjoy their income now while still building wealth systematically. This track balances lifestyle spending with regular investment contributions and retirement savings.",
    prioritises: ["15–20% monthly investment", "Travel and lifestyle budget", "Retirement annuity contributions", "ETF portfolio building"],
    avoids: ["Over-saving at the cost of wellbeing", "Neglecting retirement early", "Lifestyle debt"],
    milestones: [
      { year: "Year 1", label: "Emergency Fund", detail: "Build 3 months expenses buffer", done: true,  color: "#1D9E75" },
      { year: "Year 2", label: "Investment Portfolio", detail: "R50 000 invested in ETFs/RA", done: false, color: "#1D9E75" },
      { year: "Year 3", label: "Balanced Budget", detail: "15% invest + lifestyle budget locked in", done: false, color: "#EF9F27" },
      { year: "Year 5", label: "R200k Portfolio", detail: "Diversified portfolio milestone", done: false, color: "#378ADD" },
    ],
    stats: [{ label: "Monthly invest target", value: "20%" }, { label: "Lifestyle budget", value: "30%" }, { label: "RA contribution", value: "10%" }],
  },
  {
    id: "global",
    icon: "",
    name: "Global Investor",
    tagline: "Build wealth across international markets",
    color: "#378ADD",
    description: "Designed for tech professionals and globally mobile workers who want offshore exposure and long-term portfolio diversification. Prioritises ETFs, offshore investing, and global market participation.",
    prioritises: ["Offshore ETF exposure", "Global portfolio diversification", "Long-term compound growth", "Currency hedge strategy"],
    avoids: ["Over-concentration in SA assets", "Speculative single stocks", "Short-term trading"],
    milestones: [
      { year: "Year 1", label: "Local Foundation", detail: "Emergency fund + RA started", done: true,  color: "#1D9E75" },
      { year: "Year 2", label: "First Offshore",   detail: "Open offshore investment account", done: false, color: "#378ADD" },
      { year: "Year 3", label: "Diversified Portfolio", detail: "40% offshore allocation reached", done: false, color: "#EF9F27" },
      { year: "Year 5", label: "R500k Portfolio",  detail: "Global diversified portfolio milestone", done: false, color: "#378ADD" },
    ],
    stats: [{ label: "Offshore target", value: "40%" }, { label: "ETF focus", value: "S&P 500" }, { label: "Timeline", value: "5 yrs" }],
  },
];
 
const CIRCUMFERENCE = 226.2;
 
function MilestoneStep({ milestone, index, total }) {
  return (
    <div className="st-milestone">
      <div className="st-milestone-left">
        <div className={`st-milestone-dot ${milestone.done ? "done" : ""}`} style={{ borderColor: milestone.color, background: milestone.done ? milestone.color : "transparent" }}>
          {milestone.done && <span>✓</span>}
        </div>
        {index < total - 1 && <div className="st-milestone-line" />}
      </div>
      <div className="st-milestone-body">
        <span className="st-milestone-year" style={{ color: milestone.color }}>{milestone.year}</span>
        <p className="st-milestone-label">{milestone.label}</p>
        <p className="st-milestone-detail">{milestone.detail}</p>
      </div>
    </div>
  );
}
 
export default function StrategyTracks() {
  const [selected, setSelected]   = useState(null);
  const [mounted, setMounted]     = useState(false);
  const [activeTab, setActiveTab] = useState("milestones");
 
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
 
  const track = tracks.find(t => t.id === selected);
  const progress = track ? Math.round((track.milestones.filter(m => m.done).length / track.milestones.length) * 100) : 0;
 
  return (
    <main className={`st-main ${mounted ? "st-in" : ""}`}>
 
      <div className="st-hero">
        <div>
          <p className="st-eyebrow">First Five Years</p>
          <h1 className="st-title">Strategy <span>Tracks</span></h1>
          <p className="st-subline">Choose the financial path that matches your goals and lifestyle</p>
        </div>
        {selected && (
          <div className="st-score-wrap">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="#f0efeb" strokeWidth="8"/>
              <circle cx="44" cy="44" r="36" fill="none" stroke={track.color} strokeWidth="8"
                strokeDasharray={`${(progress / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeLinecap="round" transform="rotate(-90 44 44)"
                style={{ transition: "stroke-dasharray 1.2s ease .3s" }}
              />
              <text x="44" y="49" textAnchor="middle" fontSize="16" fontWeight="700" fill={DARK_NAVY}>{progress}%</text>
            </svg>
            <div>
              <span className="st-badge" style={{ background: track.color + "22", color: track.color, borderColor: track.color + "44" }}>
                {track.name}
              </span>
              <span className="st-score-sub">track progress</span>
            </div>
          </div>
        )}
      </div>
 
      {/* track selector cards */}
      <div className="st-track-grid">
        {tracks.map((t) => (
          <div
            key={t.id}
            className={`st-track-card ${selected === t.id ? "st-track-active" : ""}`}
            style={{ "--track-color": t.color }}
            onClick={() => setSelected(selected === t.id ? null : t.id)}
          >
            <div className="st-track-card-top">
              <span className="st-track-icon">{t.icon}</span>
              {selected === t.id && <span className="st-track-selected-tag" style={{ background: t.color }}>Active</span>}
            </div>
            <h3 className="st-track-name">{t.name}</h3>
            <p className="st-track-tagline">{t.tagline}</p>
            <div className="st-track-stats">
              {t.stats.map(s => (
                <div key={s.label} className="st-track-stat">
                  <span className="st-track-stat-val" style={{ color: t.color }}>{s.value}</span>
                  <span className="st-track-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <button className="st-choose-btn" style={{ background: selected === t.id ? t.color : "transparent", color: selected === t.id ? "#fff" : t.color, borderColor: t.color }}>
              {selected === t.id ? "✓ Selected" : "Choose track"}
            </button>
          </div>
        ))}
      </div>
 
      {/* expanded track detail */}
      {track && (
        <div className="st-detail st-fade" style={{ "--track-color": track.color }}>
          <div className="st-detail-hero" style={{ borderLeft: `4px solid ${track.color}` }}>
            <div>
              <h2 className="st-detail-title">{track.icon} {track.name}</h2>
              <p className="st-detail-desc">{track.description}</p>
            </div>
          </div>
 
          <div className="st-detail-tabs">
            {["milestones", "priorities", "tips"].map(t => (
              <button key={t} className={`st-detail-tab ${activeTab === t ? "active" : ""}`}
                style={{ "--tc": track.color }} onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
 
          {activeTab === "milestones" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">Year-by-year milestones</p>
                  <div className="st-milestones">
                    {track.milestones.map((m, i) => (
                      <MilestoneStep key={m.label} milestone={m} index={i} total={track.milestones.length} />
                    ))}
                  </div>
                </div>
                <div className="st-card">
                  <p className="st-card-label">Track progress</p>
                  <div className="st-progress-ring-wrap">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f0efeb" strokeWidth="10"/>
                      <circle cx="60" cy="60" r="50" fill="none" stroke={track.color} strokeWidth="10"
                        strokeDasharray={`${(progress / 100) * 314.2} 314.2`} strokeLinecap="round"
                        transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 1.2s ease" }}
                      />
                      <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill={DARK_NAVY}>{progress}%</text>
                    </svg>
                    <p className="st-ring-label">{track.milestones.filter(m => m.done).length} of {track.milestones.length} milestones complete</p>
                  </div>
                  <div className="st-milestone-summary">
                    {track.milestones.map(m => (
                      <div key={m.label} className="st-ms-row">
                        <div className="st-ms-dot" style={{ background: m.done ? m.color : "#e0dfdb" }} />
                        <span className={`st-ms-text ${m.done ? "done" : ""}`}>{m.label}</span>
                        {m.done && <span className="st-ms-check">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {activeTab === "priorities" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">This track prioritises</p>
                  {track.prioritises.map(p => (
                    <div key={p} className="st-priority-row">
                      <div className="st-priority-dot" style={{ background: track.color }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <div className="st-card">
                  <p className="st-card-label">This track avoids</p>
                  {track.avoids.map(a => (
                    <div key={a} className="st-priority-row">
                      <div className="st-priority-dot" style={{ background: "#E24B4A" }} />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
 
          {activeTab === "tips" && (
            <div className="st-detail-body st-fade">
              <div className="st-tips-grid">
                {[
                  { icon: "", tip: "Automate your savings on salary day so you never have the chance to spend it first." },
                  { icon: "", tip: "Review your budget monthly — small adjustments early prevent big problems later." },
                  { icon: "", tip: "A Tax-Free Savings Account (TFSA) lets you invest R36 000/year with zero tax on returns." },
                  { icon: "", tip: "ETFs (Exchange Traded Funds) are the lowest-cost way to invest in a diversified portfolio." },
                  { icon: "", tip: "Your emergency fund should cover 3–6 months of expenses before you invest aggressively." },
                  { icon: "", tip: "Keeping your credit utilisation below 30% significantly improves your credit score." },
                ].map((t, i) => (
                  <div key={i} className="st-tip-card" style={{ animationDelay: `${i * 0.08}s` }}>
                    <span className="st-tip-icon">{t.icon}</span>
                    <p className="st-tip-text">{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
 
      {!selected && (
        <div className="st-empty">
          <p>Select a track above to see your personalised milestones, priorities, and tips.</p>
        </div>
      )}
 
    </main>
  );
}