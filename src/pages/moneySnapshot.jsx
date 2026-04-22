import { useState, useEffect, useRef } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import "../styles/moneySnapshot.css";

const ABSA_RED = "#C8102E";
const ACCENT   = "#ff6b35";
const BLUE     = "#378ADD";

/* ── read user from onboarding ── */
const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");

const wealthHistory = [
  { month: "Nov", value: 28000 },
  { month: "Dec", value: 31000 },
  { month: "Jan", value: 34500 },
  { month: "Feb", value: 38000 },
  { month: "Mar", value: 42000 },
  { month: "Apr", value: 47200 },
];

const monthlySpend = [
  { month: "Nov", spend: 34200 },
  { month: "Dec", spend: 39800 },
  { month: "Jan", spend: 36100 },
  { month: "Feb", spend: 37500 },
  { month: "Mar", spend: 35900 },
  { month: "Apr", spend: 37800 },
];

const spendingData = [
  { name: "Rent / bond",  value: 12000, color: ABSA_RED, pct: 32 },
  { name: "Car payments", value: 6500,  color: "#ff6b35", pct: 17 },
  { name: "Living costs", value: 8000,  color: "#EF9F27", pct: 21 },
  { name: "Student loan", value: 2500,  color: "#8B5CF6", pct: 7  },
  { name: "Savings",      value: 8800,  color: BLUE,      pct: 23 },
];

const goals = [
  { name: "Emergency fund",       current: 18000, target: 24000,  color: "#1D9E75", icon: "🛡" },
  { name: "Property deposit",     current: 32000, target: 200000, color: ABSA_RED,  icon: "🏠" },
  { name: "Investment portfolio", current: 20000, target: 100000, color: BLUE,      icon: "📈" },
];

const nudges = [
  { type: "success", iconColor: "#1D9E75", text: "Emergency fund is 75% complete!" },
  { type: "warn",    iconColor: "#EF9F27", text: "Savings rate below 20% — redirect R500." },
  { type: "info",    iconColor: BLUE,      text: "Property Builder — 2 months in." },
];

const recentActivity = [
  { label: "Salary deposit",    amount: "+R48 000", date: "01 Apr", positive: true  },
  { label: "Discovery Medical", amount: "-R2 800",  date: "02 Apr", positive: false },
  { label: "FNB Car Finance",   amount: "-R6 500",  date: "03 Apr", positive: false },
  { label: "ETF Investment",    amount: "-R4 000",  date: "05 Apr", positive: false },
  { label: "Freelance income",  amount: "+R5 000",  date: "08 Apr", positive: true  },
];

const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct  = (c, t) => Math.round((c / t) * 100);

function CountUp({ end, prefix = "R", suffix = "", duration = 1000 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  const t0  = useRef(null);
  useEffect(() => {
    const step = (ts) => {
      if (!t0.current) t0.current = ts;
      const p = Math.min((ts - t0.current) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration]);
  return <>{prefix}{val.toLocaleString("en-ZA")}{suffix}</>;
}

function GoalBar({ name, current, target, color, icon, delay = 0 }) {
  const [w, setW] = useState(0);
  const p = pct(current, target);
  useEffect(() => { const t = setTimeout(() => setW(p), delay + 300); return () => clearTimeout(t); }, [p, delay]);
  return (
    <div className="ms-goal">
      <div className="ms-goal-top">
        <span className="ms-goal-icon">{icon}</span>
        <span className="ms-goal-name">{name}</span>
        <span className="ms-goal-pct" style={{ color }}>{p}%</span>
      </div>
      <div className="ms-goal-track">
        <div className="ms-goal-fill" style={{
          width: `${w}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`,
          boxShadow: `0 0 10px ${color}66`,
          transition: `width 0.9s cubic-bezier(.4,0,.2,1) ${delay}ms`
        }} />
      </div>
      <div className="ms-goal-amounts">{fmt(current)} <span>of {fmt(target)}</span></div>
    </div>
  );
}

function Nudge({ type, iconColor, text, delay }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className={`ms-nudge ms-nudge-${type}`} style={{ animationDelay: `${delay}s` }}>
      <div className="ms-nudge-dot" style={{ background: iconColor, boxShadow: `0 0 8px ${iconColor}` }} />
      <p>{text}</p>
      <button onClick={() => setGone(true)}>✕</button>
    </div>
  );
}

const DarkTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="ms-tip">
    <div className="ms-tip-label">{label ?? payload[0].name}</div>
    {payload.map((p, i) => (
      <div key={i} className="ms-tip-val" style={{ color: p.color || "#fff" }}>{fmt(p.value)}</div>
    ))}
  </div>
) : null;

export default function MoneySnapshot() {
  const [tab,     setTab]     = useState("overview");
  const [slice,   setSlice]   = useState(null);
  const [mounted, setMounted] = useState(false);
  const user = getUser();
  const userName = user.name || "there";
  const userSalary = Number(user.salary) || 48000;

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <main className={`ms-main ${mounted ? "ms-in" : ""}`}>

      {/* ambient background glows */}
      <div className="ms-glow ms-glow-1" />
      <div className="ms-glow ms-glow-2" />

      {/* ── HERO ── */}
      <div className="ms-hero">
        <div className="ms-hero-left">
          <p className="ms-eyebrow">April 2026</p>
          <h1 className="ms-hello">Good evening, <span>{userName}</span></h1>
          <p className="ms-subline">Property Builder · Here's your financial snapshot</p>
          <div className="ms-hero-tags">
            <span className="ms-tag">💰 High earner</span>
            <span className="ms-tag">🏠 Track: Property</span>
            <span className="ms-tag ms-tag-live">● Live</span>
          </div>
        </div>

        <div className="ms-hero-right">
          {/* score ring */}
          <div className="ms-score-ring-wrap">
            <div className="ms-score-outer-glow" />
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              <circle cx="55" cy="55" r="46" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="10"
                strokeDasharray={`${(72/100)*289.0} 289.0`}
                strokeLinecap="round" transform="rotate(-90 55 55)"
                style={{ transition: "stroke-dasharray 1.4s ease .3s" }}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C8102E"/>
                  <stop offset="100%" stopColor="#ff6b35"/>
                </linearGradient>
              </defs>
              <text x="55" y="50" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff" fontFamily="Syne">72</text>
              <text x="55" y="65" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="DM Sans">/ 100</text>
            </svg>
            <div className="ms-score-labels">
              <span className="ms-score-badge">Good</span>
              <span className="ms-score-sub">health score</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="ms-stat-row">
        {[
          { label: "Monthly income",    end: userSalary, prefix: "R", suffix: "",  tag: "gross",          tagType: "neutral", icon: "💵" },
          { label: "Disposable income", end: 10200,      prefix: "R", suffix: "",  tag: "+R800 vs last",  tagType: "pos",     icon: "✦"  },
          { label: "Savings rate",      end: 15,         prefix: "",  suffix: "%", tag: "target 20%",     tagType: "neg",     icon: "📊" },
          { label: "Net worth",         end: 47200,      prefix: "R", suffix: "",  tag: "↑ +R19 200 YTD", tagType: "pos",     icon: "🚀" },
        ].map((s, i) => (
          <div className="ms-stat" key={s.label} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="ms-stat-icon">{s.icon}</div>
            <p className="ms-stat-label">{s.label}</p>
            <p className="ms-stat-val">
              <CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} duration={900 + i * 80} />
            </p>
            <span className={`ms-stat-tag ms-tag-${s.tagType}`}>{s.tag}</span>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="ms-tab-bar">
        {["overview", "spending", "goals", "activity"].map((t) => (
          <button key={t}
            className={`ms-tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {tab === t && <span className="ms-tab-glow" />}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="ms-content ms-fade">
          <div className="ms-bento">

            <div className="ms-bento-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Net worth growth</span>
                <span className="ms-pill pos">+R19 200 this year</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={wealthHistory} margin={{ top:4, right:4, bottom:0, left:0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#C8102E" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#C8102E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v => `R${v/1000}k`} tick={{ fontSize:10, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={44}/>
                  <Tooltip content={<DarkTip />}/>
                  <Area type="monotone" dataKey="value" stroke="#C8102E" strokeWidth={2.5} fill="url(#areaGrad)"
                    dot={{ r:4, fill:"#C8102E", strokeWidth:0 }} activeDot={{ r:5, fill:"#ff6b35" }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="ms-bento-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Monthly spend</span></div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={monthlySpend} barSize={16} margin={{ top:4, right:0, bottom:0, left:0 }}>
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip content={<DarkTip />}/>
                  <Bar dataKey="spend" radius={[5,5,0,0]}>
                    {monthlySpend.map((_, i) => (
                      <Cell key={i} fill={i === monthlySpend.length - 1 ? "#C8102E" : "rgba(255,255,255,0.08)"}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="ms-card-foot">Apr: <strong style={{ color:"#C8102E" }}>R37 800</strong></p>
            </div>

            <div className="ms-bento-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Nudges</span></div>
              {nudges.map((n, i) => <Nudge key={i} {...n} delay={i * 0.1}/>)}
            </div>

            <div className="ms-bento-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Goal progress</span>
                <button className="ms-link-btn" onClick={() => setTab("goals")}>View all →</button>
              </div>
              {goals.map((g, i) => <GoalBar key={g.name} {...g} delay={i * 120}/>)}
            </div>

          </div>
        </div>
      )}

      {/* ── SPENDING ── */}
      {tab === "spending" && (
        <div className="ms-content ms-fade">
          <div className="ms-bento">
            <div className="ms-bento-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Spending breakdown</span></div>
              <div className="ms-donut-wrap">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={spendingData} cx="50%" cy="50%" innerRadius={62} outerRadius={90}
                      dataKey="value" strokeWidth={0}
                      onMouseEnter={(_, i) => setSlice(i)} onMouseLeave={() => setSlice(null)}>
                      {spendingData.map((e, i) => (
                        <Cell key={i} fill={e.color}
                          opacity={slice === null || slice === i ? 1 : 0.25}
                          style={{ cursor:"pointer", filter: slice === i ? `drop-shadow(0 0 6px ${e.color})` : "none", transition:"all 0.2s" }}/>
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTip />}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="ms-donut-mid">
                  {slice !== null ? (
                    <>
                      <div style={{ fontSize:15, fontWeight:700, color: spendingData[slice].color }}>{fmt(spendingData[slice].value)}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{spendingData[slice].name}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>R37 800</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>total spend</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="ms-bento-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Categories</span></div>
              {spendingData.map((d, i) => (
                <div key={d.name}
                  className={`ms-cat-row ${slice === i ? "ms-cat-active" : ""}`}
                  onMouseEnter={() => setSlice(i)} onMouseLeave={() => setSlice(null)}>
                  <div className="ms-cat-left">
                    <div className="ms-cat-dot" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}` }}/>
                    <span className="ms-cat-name">{d.name}</span>
                  </div>
                  <div className="ms-cat-right">
                    <div className="ms-cat-bar-bg">
                      <div className="ms-cat-bar-fill" style={{ width:`${d.pct}%`, background: d.color, boxShadow:`0 0 6px ${d.color}55` }}/>
                    </div>
                    <span className="ms-cat-pct" style={{ color: d.color }}>{d.pct}%</span>
                    <span className="ms-cat-amt">{fmt(d.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GOALS ── */}
      {tab === "goals" && (
        <div className="ms-content ms-fade">
          <div className="ms-bento">
            <div className="ms-bento-full ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Financial goals — Property Builder track</span></div>
              <div style={{ display:"flex", flexDirection:"column", gap:20, marginBottom:20 }}>
                {goals.map((g, i) => <GoalBar key={g.name} {...g} delay={i * 150}/>)}
              </div>
              <div className="ms-callout">
                You are on the <strong>Property Builder</strong> track. On track for a property purchase by <strong>Year 4</strong>.
              </div>
            </div>
            {[
              { label:"Emergency fund",  pct:"75%", sub:"R18 000 of R24 000",  note:"3 months to complete",  color:"#1D9E75" },
              { label:"Property deposit",pct:"16%", sub:"R32 000 of R200 000", note:"On track for Year 4",   color:ABSA_RED  },
              { label:"Investments",     pct:"20%", sub:"R20 000 of R100 000", note:"+R1 200 this month",    color:BLUE      },
            ].map(c => (
              <div key={c.label} className="ms-bento-third ms-card ms-summary" style={{ borderTop:`3px solid ${c.color}`, boxShadow:`0 0 20px ${c.color}22` }}>
                <p className="ms-summary-label">{c.label}</p>
                <p className="ms-summary-big" style={{ color: c.color }}>{c.pct}</p>
                <p className="ms-summary-sub">{c.sub}</p>
                <p className="ms-summary-note">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIVITY ── */}
      {tab === "activity" && (
        <div className="ms-content ms-fade">
          <div className="ms-bento">
            <div className="ms-bento-full ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Recent activity</span></div>
              {recentActivity.map((a, i) => (
                <div key={i} className="ms-act-row" style={{ animationDelay:`${i * 0.06}s` }}>
                  <div className="ms-act-avatar" style={{ background: a.positive ? "rgba(29,158,117,0.15)" : "rgba(200,16,46,0.15)", boxShadow: a.positive ? "0 0 10px rgba(29,158,117,0.2)" : "0 0 10px rgba(200,16,46,0.2)" }}>
                    <span style={{ color: a.positive ? "#1D9E75" : "#C8102E" }}>{a.positive ? "↑" : "↓"}</span>
                  </div>
                  <div className="ms-act-info">
                    <p className="ms-act-name">{a.label}</p>
                    <p className="ms-act-date">{a.date}</p>
                  </div>
                  <span className={`ms-act-amt ${a.positive ? "pos" : "neg"}`}
                    style={{ textShadow: a.positive ? "0 0 8px rgba(29,158,117,0.5)" : "0 0 8px rgba(200,16,46,0.5)" }}>
                    {a.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button className="ms-cta">
        Open Simulation Lab — Property vs Renting →
      </button>

    </main>
  );
}
