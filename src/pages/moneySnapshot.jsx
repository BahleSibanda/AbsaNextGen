import { useState, useEffect, useRef } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import "../styles/moneySnapshot.css";
 
const ABSA_RED = "#C8102E";
 
const spendingData = [
  { name: "Rent / bond",   value: 12000, color: ABSA_RED },
  { name: "Car payments",  value: 6500,  color: "#5DCAA5" },
  { name: "Living costs",  value: 8000,  color: "#EF9F27" },
  { name: "Student loan",  value: 2500,  color: "#B4B2A9" },
  { name: "Savings",       value: 8800,  color: "#378ADD" },
];
 
const goals = [
  { name: "Emergency fund",       current: 18000, target: 24000,  color: "#1D9E75", icon: "🛡" },
  { name: "Property deposit",     current: 32000, target: 200000, color: ABSA_RED,  icon: "🏠" },
  { name: "Investment portfolio", current: 20000, target: 100000, color: "#378ADD", icon: "📈" },
];
 
const insights = [
  { text: "Savings rate is 15% — slightly below the recommended 20% for your income level.", color: ABSA_RED,  label: "Savings" },
  { text: "Car expenses are 28% of take-home pay. Paying it down faster frees up R2 000/month.", color: "#EF9F27", label: "Transport" },
  { text: "No revolving credit card debt — strong foundation for your credit score.", color: "#1D9E75", label: "Credit" },
  { text: "On track for a property deposit by Year 3 at your current savings rate.", color: "#378ADD", label: "Property" },
];
 
const nudges = [
  { type: "success", iconColor: "#1D9E75", text: "Emergency fund is 75% complete! Keep adding R2 000/month to finish in 3 months." },
  { type: "warn",    iconColor: "#EF9F27", text: "Savings rate dropped below 20% this month. Consider redirecting R500 from entertainment." },
  { type: "info",    iconColor: "#378ADD", text: "You have been on the Property Builder track for 2 months — review your deposit milestone." },
];
 
const wealthHistory = [
  { month: "Nov", netWorth: 28000 },
  { month: "Dec", netWorth: 31000 },
  { month: "Jan", netWorth: 34500 },
  { month: "Feb", netWorth: 38000 },
  { month: "Mar", netWorth: 42000 },
  { month: "Apr", netWorth: 47200 },
];
 
const metrics = [
  { label: "Monthly income",    value: "R48 000", sub: "gross salary",       subClass: "muted", trend: null },
  { label: "Disposable income", value: "R10 200", sub: "after all expenses", subClass: "good",  trend: "+R800 vs last month" },
  { label: "Savings rate",      value: "15%",     sub: "below 20% target",  subClass: "warn",  trend: "-2% vs last month" },
  { label: "Investments",       value: "R20 000", sub: "RA + ETF",          subClass: "muted", trend: "+R1 200 growth" },
];
 
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct = (c, t) => Math.round((c / t) * 100);
 
function AnimatedNumber({ target, prefix = "R", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef(null);
  const frame = useRef(null);
 
  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
 
  return <span>{prefix}{display.toLocaleString("en-ZA")}</span>;
}
 
function GoalBar({ name, current, target, color, icon, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const percentage = pct(current, target);
 
  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), delay);
    return () => clearTimeout(t);
  }, [percentage, delay]);
 
  return (
    <div className="ms-goal-item">
      <div className="ms-goal-header">
        <div className="ms-goal-left">
          <span className="ms-goal-icon">{icon}</span>
          <span className="ms-goal-name">{name}</span>
        </div>
        <div className="ms-goal-right">
          <span className="ms-goal-pct" style={{ color }}>{percentage}%</span>
          <span className="ms-goal-amounts">{fmt(current)} / {fmt(target)}</span>
        </div>
      </div>
      <div className="ms-goal-track">
        <div
          className="ms-goal-fill"
          style={{ width: `${width}%`, background: color, transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}ms` }}
        />
      </div>
    </div>
  );
}
 
function NudgeCard({ type, iconColor, text, index }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className={`ms-nudge ms-nudge-${type}`} style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="ms-nudge-icon" style={{ background: iconColor }} />
      <p className="ms-nudge-text">{text}</p>
      <button className="ms-nudge-dismiss" onClick={() => setDismissed(true)}>✕</button>
    </div>
  );
}
 
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="ms-tooltip">
        <p className="ms-tooltip-label">{payload[0].name}</p>
        <p className="ms-tooltip-value">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};
 
const AreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="ms-tooltip">
        <p className="ms-tooltip-label">{label}</p>
        <p className="ms-tooltip-value">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};
 
export default function MoneySnapshot() {
  const [activeSlice, setActiveSlice] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);
 
  const tabs = ["overview", "spending", "goals", "insights"];
 
  return (
    <main className={`ms-main ${visible ? "ms-visible" : ""}`}>
 
      <div className="ms-topbar">
        <div className="ms-topbar-left">
          <div className="ms-page-label">Money Snapshot</div>
          <h1 className="ms-page-title">Your financial health at a glance</h1>
          <p className="ms-page-sub">April 2026 · Property Builder track</p>
        </div>
        <div className="ms-health-block">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#f0efeb" strokeWidth="7" />
            <circle
              cx="36" cy="36" r="30" fill="none"
              stroke={ABSA_RED} strokeWidth="7"
              strokeDasharray={`${(72 / 100) * 188.4} 188.4`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
              style={{ transition: "stroke-dasharray 1.2s ease" }}
            />
            <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="600" fill="#0f1923">72</text>
          </svg>
          <div className="ms-health-label">
            <span className="ms-health-badge">Good</span>
            <span className="ms-health-sub">out of 100</span>
          </div>
        </div>
      </div>
 
      <div className="ms-metric-row">
        {metrics.map((m, i) => (
          <div className="ms-metric" key={m.label} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="ms-metric-label">{m.label}</div>
            <div className="ms-metric-value">{m.value}</div>
            <div className={`ms-metric-sub ms-${m.subClass}`}>{m.sub}</div>
            {m.trend && <div className="ms-metric-trend">{m.trend}</div>}
          </div>
        ))}
      </div>
 
      <div className="ms-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`ms-tab ${activeTab === tab ? "ms-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
 
      {activeTab === "overview" && (
        <div className="ms-tab-content">
          <div className="ms-grid-2">
            <div className="ms-card">
              <div className="ms-card-title">Net worth growth</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={wealthHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ABSA_RED} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={ABSA_RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efeb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `R${v / 1000}k`} tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip content={<AreaTooltip />} />
                  <Area type="monotone" dataKey="netWorth" stroke={ABSA_RED} strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: ABSA_RED }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="ms-chart-footer">
                <span className="ms-chart-stat good">+R19 200</span>
                <span className="ms-chart-stat-label">growth over 6 months</span>
              </div>
            </div>
 
            <div className="ms-card">
              <div className="ms-card-title">Nudges & insights</div>
              <div className="ms-nudge-list">
                {nudges.map((n, i) => (
                  <NudgeCard key={i} index={i} {...n} />
                ))}
              </div>
            </div>
          </div>
 
          <div className="ms-goals-preview">
            <div className="ms-card">
              <div className="ms-card-title">Goal progress</div>
              {goals.map((g, i) => (
                <GoalBar key={g.name} {...g} delay={i * 150} />
              ))}
            </div>
          </div>
        </div>
      )}
 
      {activeTab === "spending" && (
        <div className="ms-tab-content">
          <div className="ms-grid-2">
            <div className="ms-card ms-chart-card">
              <div className="ms-card-title">Spending breakdown</div>
              <div className="ms-donut-wrap">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      dataKey="value"
                      strokeWidth={0}
                      onMouseEnter={(_, i) => setActiveSlice(i)}
                      onMouseLeave={() => setActiveSlice(null)}
                    >
                      {spendingData.map((entry, i) => (
                        <Cell
                          key={i} fill={entry.color}
                          opacity={activeSlice === null || activeSlice === i ? 1 : 0.4}
                          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ms-donut-center">
                  {activeSlice !== null ? (
                    <>
                      <div className="ms-donut-active-val" style={{ color: spendingData[activeSlice].color }}>
                        {fmt(spendingData[activeSlice].value)}
                      </div>
                      <div className="ms-donut-active-name">{spendingData[activeSlice].name}</div>
                    </>
                  ) : (
                    <>
                      <div className="ms-donut-active-val">R37 800</div>
                      <div className="ms-donut-active-name">total spend</div>
                    </>
                  )}
                </div>
              </div>
            </div>
 
            <div className="ms-card">
              <div className="ms-card-title">Category breakdown</div>
              <div className="ms-legend-list">
                {spendingData.map((d, i) => (
                  <div
                    key={d.name}
                    className={`ms-legend-row ${activeSlice === i ? "ms-legend-active" : ""}`}
                    onMouseEnter={() => setActiveSlice(i)}
                    onMouseLeave={() => setActiveSlice(null)}
                  >
                    <div className="ms-legend-left">
                      <div className="ms-legend-dot" style={{ background: d.color }} />
                      <span className="ms-legend-name">{d.name}</span>
                    </div>
                    <div className="ms-legend-right">
                      <span className="ms-legend-pct" style={{ color: d.color }}>
                        {Math.round((d.value / 37800) * 100)}%
                      </span>
                      <span className="ms-legend-amt">{fmt(d.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ms-spending-tip">
                Hover over a category to highlight it on the chart.
              </div>
            </div>
          </div>
        </div>
      )}
 
      {activeTab === "goals" && (
        <div className="ms-tab-content">
          <div className="ms-card">
            <div className="ms-card-title">Financial goals — Property Builder track</div>
            <div className="ms-goals-full">
              {goals.map((g, i) => (
                <GoalBar key={g.name} {...g} delay={i * 150} />
              ))}
            </div>
            <div className="ms-goals-tip">
              You are on the <strong>Property Builder</strong> track. Focus on growing your deposit savings and keeping debt low.
            </div>
          </div>
        </div>
      )}
 
      {activeTab === "insights" && (
        <div className="ms-tab-content">
          <div className="ms-insights-grid">
            {insights.map((ins, i) => (
              <div className="ms-insight-card" key={i} style={{ animationDelay: `${i * 0.1}s`, borderTop: `3px solid ${ins.color}` }}>
                <div className="ms-insight-label" style={{ color: ins.color }}>{ins.label}</div>
                <p className="ms-insight-text">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
 
      <button className="ms-sim-btn">
        Open Simulation Lab — Property vs Renting →
      </button>
 
    </main>
  );
}