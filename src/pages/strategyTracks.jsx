import { useState, useEffect } from "react";
import "../styles/strategyTracks.css";

const ABSA_RED  = "#C8102E";
const DARK_NAVY = "#0f1923";
const GRN = "#1D9E75";
const AMB = "#EF9F27";
const BLU = "#378ADD";

const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;

// ── Milestone progress persists per track ────────────────────────────────────
const getMilestoneState = (trackId) => {
  const key = `nw_milestones_${trackId}`;
  return JSON.parse(localStorage.getItem(key) || "null");
};
const saveMilestoneState = (trackId, done) => {
  localStorage.setItem(`nw_milestones_${trackId}`, JSON.stringify(done));
};

// ── Track data ────────────────────────────────────────────────────────────────
const tracks = [
  {
    id: "property",
    icon: "🏠",
    name: "Property Builder",
    tagline: "Own your first home within 5 years",
    color: ABSA_RED,
    description: "Designed for young SA professionals who want to purchase property within 3–5 years. Every financial decision is optimised toward building a deposit, protecting your credit profile, and maintaining the stable income history banks require for bond approval.",
    why: "Property remains one of the most powerful wealth-building tools in South Africa — it provides forced savings, leverage, rental income potential, and long-term capital appreciation. For first-time buyers, government transfer duty exemptions on properties under R1.1 million make entry more accessible than ever.",
    prioritises: [
      "Building a 10–20% deposit (R150k–R400k for typical starter home)",
      "Credit score above 650 — check yours free at TransUnion or Experian",
      "Stable income history — banks look at 3+ months of payslips",
      "Reducing revolving credit (credit cards, store accounts)",
      "Home loan pre-approval before you house hunt",
    ],
    avoids: [
      "Large vehicle upgrades or new car finance (increases debt-to-income ratio)",
      "Excessive lifestyle inflation despite salary increases",
      "Revolving credit card debt (hurts credit score and DTI ratio)",
      "Withdrawing from savings for non-emergencies",
    ],
    tradeoffs: [
      { pro: "Build equity in an appreciating asset", con: "Large capital tied up, less liquidity" },
      { pro: "Transfer duty exemption under R1.1M", con: "Bond registration costs R20k–R40k upfront" },
      { pro: "Stable monthly repayment (prime-linked)", con: "Interest rate risk if prime increases" },
      { pro: "Potential rental income later", con: "Property is illiquid — takes months to sell" },
    ],
    warnings: [
      "Don't buy at your maximum pre-approval amount — banks approve more than is financially comfortable",
      "Factor in levies, rates, insurance, and maintenance (~1.5% of property value per year)",
      "A 1% interest rate increase on a R1.5M bond adds ~R750/month to repayments",
      "Transfer duty on R1.1M–R1.5M properties is 3% — this is cash, not in your bond",
    ],
    milestones: [
      { id: "ef",  year: "Year 1", label: "Emergency Fund",       detail: "3–6 months expenses secured (R30k–R60k)",  color: GRN },
      { id: "dep", year: "Year 2", label: "Deposit Savings",      detail: "R80k–R150k saved towards deposit",          color: ABSA_RED },
      { id: "pre", year: "Year 3", label: "Pre-approval Ready",   detail: "Credit >650, stable income, DTI <35%",      color: AMB },
      { id: "buy", year: "Year 4", label: "Property Purchase",    detail: "First property acquired",                   color: BLU },
    ],
    stats: [
      { label: "Avg deposit needed", value: "R200k" },
      { label: "Target savings rate", value: "25%" },
      { label: "Timeline", value: "4 yrs" },
    ],
    example: {
      name: "Sbu, 27 · Software developer · Johannesburg",
      salary: 52000,
      strategy: "Sbu saves 28% of gross salary (R14 600/month) split between a TFSA and money market account. He has no car finance and manages a credit score of 692. At this rate, he'll have R175 000 saved by Month 30 — enough for a 12% deposit on a R1.45M property in Midrand.",
    },
  },
  {
    id: "balanced",
    icon: "⚖️",
    name: "Balanced Lifestyle",
    tagline: "Invest consistently, live well today",
    color: GRN,
    description: "For professionals who refuse to choose between living well today and building wealth for tomorrow. This track creates systems — automated investments, a lifestyle budget, and retirement foundations — that compound without requiring sacrifice of the things you enjoy.",
    why: "The biggest risk for high-earning young professionals isn't under-earning — it's lifestyle inflation. This track builds wealth systematically while protecting quality of life, using automation and allocation systems so you never have to choose between a holiday and your investment.",
    prioritises: [
      "Automated monthly investments (debit order on salary day)",
      "15–20% monthly savings/investment rate",
      "Retirement Annuity contributions from age 25–30 (compound growth is irreplaceable)",
      "Lifestyle budget: fixed monthly amount guilt-free",
      "ETF portfolio building (Satrix, EasyEquities, Sygnia)",
    ],
    avoids: [
      "Over-saving to the point of burnout and abandoning the plan",
      "Neglecting retirement contributions in your 20s and 30s",
      "Lifestyle debt (personal loans for holidays, furniture on credit)",
      "Comparing your investment journey to others on social media",
    ],
    tradeoffs: [
      { pro: "Sustainable — you're less likely to abandon it", con: "Slower wealth accumulation than aggressive savers" },
      { pro: "Quality of life preserved throughout", con: "Lifestyle spending can creep upward over time" },
      { pro: "Diversified (RA + TFSA + ETFs)", con: "RA money locked until 55 — reduced liquidity" },
      { pro: "Flexibility to adjust allocations", con: "Requires discipline not to raid investment accounts" },
    ],
    warnings: [
      "Lifestyle creep is the silent wealth killer — reassess spending every 6 months",
      "Not contributing to a retirement fund in your 20s costs you decades of compound growth",
      "Define your lifestyle budget in rand terms, not percentages — it stays fixed as salary grows",
      "Emergency fund first — without it, investments get liquidated at the worst times",
    ],
    milestones: [
      { id: "ef",  year: "Year 1", label: "Emergency Fund + RA",     detail: "3 months buffer + RA started",               color: GRN },
      { id: "inv", year: "Year 2", label: "Investment Portfolio",     detail: "R50k invested across ETF + TFSA",            color: GRN },
      { id: "bal", year: "Year 3", label: "Balanced Budget Locked",   detail: "15% invest + lifestyle budget automated",    color: AMB },
      { id: "200", year: "Year 5", label: "R200k Portfolio",         detail: "Diversified portfolio milestone reached",     color: BLU },
    ],
    stats: [
      { label: "Monthly invest target", value: "20%" },
      { label: "Lifestyle budget", value: "30%" },
      { label: "RA contribution", value: "10%" },
    ],
    example: {
      name: "Lerato, 29 · Marketing manager · Cape Town",
      salary: 45000,
      strategy: "Lerato has a R9 000 lifestyle budget (20% of net income) for restaurants, travel, and personal spending. She automates R7 000/month into her ETF portfolio and R3 500 into her RA on the 1st. Her portfolio hit R68 000 in Year 2. She still does two international trips a year.",
    },
  },
  {
    id: "global",
    icon: "🌍",
    name: "Global Investor",
    tagline: "Build wealth across international markets",
    color: BLU,
    description: "For tech professionals, globally mobile workers, and those who understand that rand weakness is a permanent feature of the SA economy. This track prioritises international diversification, currency hedging through ETFs, and building a portfolio that performs regardless of what happens locally.",
    why: "The rand has lost over 70% of its value against the dollar in the last 20 years. A portfolio entirely in SA assets suffers this depreciation in purchasing power. Offshore exposure — even 30–40% — protects wealth and gives access to the world's best companies: Apple, Microsoft, NVIDIA, and thousands more.",
    prioritises: [
      "Offshore ETF allocation (S&P 500, MSCI World, Nasdaq 100)",
      "Using your R1M Single Discretionary Allowance annually",
      "Global portfolio diversification across currencies and markets",
      "Long-term compound growth (10+ year horizon)",
      "Currency hedging — your portfolio rises as the rand weakens",
    ],
    avoids: [
      "Over-concentration in JSE-only assets",
      "Single stock speculation (especially in high-risk markets)",
      "Short-term trading based on news or market timing",
      "Ignoring SA tax compliance for offshore investments",
    ],
    tradeoffs: [
      { pro: "Protection against rand depreciation", con: "Currency gains taxed as capital gains in SA" },
      { pro: "Access to world's top growth companies", con: "More complex to set up and manage" },
      { pro: "True portfolio diversification", con: "Forex conversion fees can erode returns" },
      { pro: "Higher long-term return potential", con: "Short-term rand strengthening creates paper losses" },
    ],
    warnings: [
      "All offshore investment income must be declared to SARS — non-compliance penalties are severe",
      "Forex conversion costs 0.5–2% — account for this in your return calculations",
      "Don't exceed R1M offshore without a SARS Tax Compliance Status certificate",
      "Rand appreciation years will make your offshore portfolio look underperforming — stay the course",
    ],
    milestones: [
      { id: "ef",  year: "Year 1", label: "SA Foundation",            detail: "Emergency fund + local ETF + RA started",   color: GRN },
      { id: "off", year: "Year 2", label: "First Offshore Investment", detail: "Open offshore account via EasyEquities USD", color: BLU },
      { id: "div", year: "Year 3", label: "Diversified Portfolio",     detail: "30–40% offshore allocation reached",         color: AMB },
      { id: "500", year: "Year 5", label: "R500k Portfolio",           detail: "Global diversified portfolio milestone",     color: BLU },
    ],
    stats: [
      { label: "Offshore target", value: "40%" },
      { label: "ETF focus", value: "S&P 500" },
      { label: "Timeline", value: "5 yrs" },
    ],
    example: {
      name: "Kagiso, 31 · Senior engineer · Remote (USD salary)",
      salary: 80000,
      strategy: "Kagiso earns in USD and converts via Wise. He invests $500/month into a VOO (S&P 500) ETF and R8 000/month locally into a Satrix MSCI World. His portfolio is now 55% offshore. In Year 3, his offshore portfolio is valued at R280 000 despite the rand strengthening 4%.",
    },
  },
];

const CIRC = 314.2;

// ── Visual timeline component ─────────────────────────────────────────────────
function Timeline({ milestones, doneSet, onToggle, color }) {
  return (
    <div className="st-timeline">
      {milestones.map((m, i) => {
        const done = doneSet.has(m.id);
        return (
          <div key={m.id} className={`st-tl-step ${done ? "done" : ""}`}>
            <div className="st-tl-connector">
              <button
                className="st-tl-dot"
                style={{
                  borderColor: done ? m.color : "rgba(255,255,255,0.2)",
                  background: done ? m.color : "transparent",
                }}
                onClick={() => onToggle(m.id)}
                title="Click to mark complete"
              >
                {done ? "✓" : i + 1}
              </button>
              {i < milestones.length - 1 && (
                <div className="st-tl-line" style={{ background: done ? m.color : "rgba(255,255,255,0.1)" }} />
              )}
            </div>
            <div className="st-tl-body">
              <span className="st-tl-year" style={{ color: m.color }}>{m.year}</span>
              <p className="st-tl-label">{m.label}</p>
              <p className="st-tl-detail">{m.detail}</p>
              {done && <span className="st-tl-done-tag" style={{ color: m.color }}>✓ Completed</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tradeoffs component ───────────────────────────────────────────────────────
function Tradeoffs({ items }) {
  return (
    <div className="st-tradeoffs">
      {items.map((item, i) => (
        <div key={i} className="st-tradeoff-row">
          <div className="st-tradeoff-pro">
            <span className="st-tradeoff-icon" style={{ color: GRN }}>✓</span>
            <span>{item.pro}</span>
          </div>
          <div className="st-tradeoff-con">
            <span className="st-tradeoff-icon" style={{ color: ABSA_RED }}>⚠</span>
            <span>{item.con}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StrategyTracks() {
  const [selected,  setSelected]  = useState(null);
  const [mounted,   setMounted]   = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  // milestone done sets per track, persisted
  const [milestoneStates, setMilestoneStates] = useState({});

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    // Load all tracks' milestone states
    const initial = {};
    tracks.forEach(t => {
      const saved = getMilestoneState(t.id);
      initial[t.id] = new Set(saved ?? t.milestones.filter(m => m.id === "ef").map(m => m.id));
    });
    setMilestoneStates(initial);
  }, []);

  const user = getUser();
  const track = tracks.find(t => t.id === selected);

  // Sync selected track from profile
  useEffect(() => {
    const trackRaw = user.track || "";
    if (!selected) {
      if (trackRaw.includes("property") || trackRaw.includes("Property")) setSelected("property");
      else if (trackRaw.includes("Balance") || trackRaw.includes("lifestyle")) setSelected("balanced");
      else if (trackRaw.includes("global") || trackRaw.includes("Global")) setSelected("global");
    }
  }, []);

  const doneSet = track ? (milestoneStates[track.id] || new Set()) : new Set();
  const progress = track
    ? Math.round((doneSet.size / track.milestones.length) * 100)
    : 0;

  const toggleMilestone = (milestoneId) => {
    if (!track) return;
    const current = new Set(milestoneStates[track.id] || []);
    if (current.has(milestoneId)) current.delete(milestoneId);
    else current.add(milestoneId);
    const updated = { ...milestoneStates, [track.id]: current };
    setMilestoneStates(updated);
    saveMilestoneState(track.id, [...current]);
  };

  const tabs = ["overview", "milestones", "priorities", "tradeoffs", "education"];

  return (
    <main className={`st-main ${mounted ? "st-in" : ""}`}>

      {/* ── HERO ── */}
      <div className="st-hero">
        <div>
          <p className="st-eyebrow">First Five Years</p>
          <h1 className="st-title">Strategy <span>Tracks</span></h1>
          <p className="st-subline">Choose the financial path that matches your goals — progress saves automatically</p>
        </div>
        {selected && track && (
          <div className="st-score-wrap">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="#f0efeb" strokeWidth="8" opacity={0.08} />
              <circle cx="44" cy="44" r="36" fill="none" stroke={track.color} strokeWidth="8"
                strokeDasharray={`${(progress / 100) * CIRC} ${CIRC}`}
                strokeLinecap="round" transform="rotate(-90 44 44)"
                style={{ transition: "stroke-dasharray 1.2s ease .3s" }}
              />
              <text x="44" y="49" textAnchor="middle" fontSize="16" fontWeight="700" fill={track.color}>{progress}%</text>
            </svg>
            <div>
              <span className="st-badge" style={{ background: track.color + "22", color: track.color, borderColor: track.color + "44" }}>
                {track.name}
              </span>
              <span className="st-score-sub">{doneSet.size} of {track.milestones.length} milestones</span>
            </div>
          </div>
        )}
      </div>

      {/* ── TRACK SELECTOR CARDS ── */}
      <div className="st-track-grid">
        {tracks.map((t) => {
          const tDone = milestoneStates[t.id] || new Set();
          const tProgress = Math.round((tDone.size / t.milestones.length) * 100);
          return (
            <div
              key={t.id}
              className={`st-track-card ${selected === t.id ? "st-track-active" : ""}`}
              style={{ "--track-color": t.color }}
              onClick={() => { setSelected(selected === t.id ? null : t.id); setActiveTab("overview"); }}
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
              {/* Mini progress bar */}
              <div className="st-track-prog-bar">
                <div className="st-track-prog-fill" style={{ width: `${tProgress}%`, background: t.color }} />
              </div>
              <div className="st-track-prog-label" style={{ color: t.color }}>{tProgress}% complete</div>
              <button className="st-choose-btn"
                style={{ background: selected === t.id ? t.color : "transparent", color: selected === t.id ? "#fff" : t.color, borderColor: t.color }}>
                {selected === t.id ? "✓ Selected" : "Choose track"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── EXPANDED DETAIL ── */}
      {track && (
        <div className="st-detail st-fade" style={{ "--track-color": track.color }}>
          <div className="st-detail-hero" style={{ borderLeft: `4px solid ${track.color}` }}>
            <h2 className="st-detail-title">{track.icon} {track.name}</h2>
            <p className="st-detail-desc">{track.description}</p>
          </div>

          {/* Tabs */}
          <div className="st-detail-tabs">
            {tabs.map(t => (
              <button key={t} className={`st-detail-tab ${activeTab === t ? "active" : ""}`}
                style={{ "--tc": track.color }} onClick={() => setActiveTab(t)}>
                {t === "overview" ? "Overview" : t === "milestones" ? "Milestones" : t === "priorities" ? "Priorities" : t === "tradeoffs" ? "Trade-offs" : "Education"}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">Track snapshot</p>
                  {track.stats.map(s => (
                    <div key={s.label} className="st-overview-stat">
                      <span className="st-overview-val" style={{ color: track.color }}>{s.value}</span>
                      <span className="st-overview-label">{s.label}</span>
                    </div>
                  ))}
                  <div className="st-progress-ring-wrap" style={{ marginTop: 20 }}>
                    <svg width="100" height="100" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke={track.color} strokeWidth="10"
                        strokeDasharray={`${(progress / 100) * 314.2} 314.2`}
                        strokeLinecap="round" transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dasharray 1.2s ease" }}
                      />
                      <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill={track.color}>{progress}%</text>
                    </svg>
                    <p className="st-ring-label">{doneSet.size} of {track.milestones.length} milestones complete</p>
                  </div>
                </div>
                <div className="st-card">
                  <p className="st-card-label">Real example</p>
                  <div className="st-example">
                    <p className="st-example-name">{track.example.name}</p>
                    <p className="st-example-income">Gross income: {fmt(track.example.salary)}/month</p>
                    <p className="st-example-body">{track.example.strategy}</p>
                  </div>
                </div>
              </div>
              {/* Warnings */}
              <div className="st-card" style={{ marginTop: 14 }}>
                <p className="st-card-label">⚠️ Know before you commit</p>
                {track.warnings.map((w, i) => (
                  <div key={i} className="st-warning-row">
                    <span className="st-warning-dot" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MILESTONES ── */}
          {activeTab === "milestones" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">Visual timeline — click to mark complete</p>
                  <Timeline
                    milestones={track.milestones}
                    doneSet={doneSet}
                    onToggle={toggleMilestone}
                    color={track.color}
                  />
                </div>
                <div className="st-card">
                  <p className="st-card-label">Progress tracker</p>
                  <div className="st-progress-ring-wrap">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke={track.color} strokeWidth="10"
                        strokeDasharray={`${(progress / 100) * 314.2} 314.2`}
                        strokeLinecap="round" transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dasharray 1.2s ease" }}
                      />
                      <text x="60" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill={track.color}>{progress}%</text>
                    </svg>
                    <p className="st-ring-label">{doneSet.size} of {track.milestones.length} milestones complete</p>
                  </div>
                  <div className="st-milestone-summary">
                    {track.milestones.map(m => {
                      const done = doneSet.has(m.id);
                      return (
                        <div key={m.id} className="st-ms-row" onClick={() => toggleMilestone(m.id)} style={{ cursor: "pointer" }}>
                          <div className="st-ms-dot" style={{ background: done ? m.color : "rgba(255,255,255,0.15)" }} />
                          <span className={`st-ms-text ${done ? "done" : ""}`}>{m.label}</span>
                          {done && <span className="st-ms-check" style={{ color: m.color }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="st-milestone-hint">Progress saves automatically to your device</p>
                </div>
              </div>
            </div>
          )}

          {/* ── PRIORITIES ── */}
          {activeTab === "priorities" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">This track prioritises</p>
                  {track.prioritises.map((p, i) => (
                    <div key={i} className="st-priority-row">
                      <div className="st-priority-dot" style={{ background: track.color }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <div className="st-card">
                  <p className="st-card-label">This track avoids</p>
                  {track.avoids.map((a, i) => (
                    <div key={i} className="st-priority-row">
                      <div className="st-priority-dot" style={{ background: ABSA_RED }} />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TRADEOFFS ── */}
          {activeTab === "tradeoffs" && (
            <div className="st-detail-body st-fade">
              <div className="st-card">
                <p className="st-card-label">Trade-offs — benefits vs costs</p>
                <Tradeoffs items={track.tradeoffs} />
              </div>
              <div className="st-card" style={{ marginTop: 14 }}>
                <p className="st-card-label">⚠️ Important warnings</p>
                {track.warnings.map((w, i) => (
                  <div key={i} className="st-warning-row">
                    <span className="st-warning-dot" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === "education" && (
            <div className="st-detail-body st-fade">
              <div className="st-card">
                <p className="st-card-label">Why this track?</p>
                <p className="st-edu-why">{track.why}</p>
              </div>
              <div className="st-tips-grid" style={{ marginTop: 14 }}>
                {[
                  { icon: "", tip: "Automate your savings on salary day so you never have the chance to spend it first." },
                  { icon: "", tip: "Review your budget monthly — small adjustments early prevent big problems later." },
                  { icon: "", tip: "A TFSA lets you invest R36 000/year with zero tax on returns. Max it before anything else." },
                  { icon: "", tip: "ETFs are the lowest-cost way to invest in a diversified portfolio — typical fee under 0.5%." },
                  { icon: "", tip: "Your emergency fund should cover 3–6 months of expenses before you invest aggressively." },
                  { icon: "", tip: "Keeping credit utilisation below 30% significantly improves your credit score for bond approval." },
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
          <p>Select a track above to see your personalised milestones, priorities, trade-offs, and financial education.</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>Your progress saves automatically — you can come back anytime.</p>
        </div>
      )}
    </main>
  );
}