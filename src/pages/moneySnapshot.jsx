import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { calcMetrics, calcSpendBuckets, generateNarratives, getIncomeBand } from "../utils/saTax";
import "../styles/moneySnapshot.css";

const R   = "#C8102E";
const GRN = "#1D9E75";
const BLU = "#2563EB";
const AMB = "#EF9F27";

function storageGet(key, fallback = {}) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const getUser  = () => storageGet("nw_user", {});
const saveUser = (d) => storageSet("nw_user", d);
const fmt  = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct  = (c, t) => t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;

// ── Pure SVG icon set — no emojis ────────────────────────────────────────────
const Icon = {
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Home: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Car: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  FileText: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Heart: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Edit: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Globe: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

// ── Goal icon map by track ───────────────────────────────────────────────────
function GoalIcon({ trackLabel, goalKey, color }) {
  const icons = {
    emergency: <Icon.Shield />,
    deposit:   <Icon.Home />,
    invest:    <Icon.TrendingUp />,
    global:    <Icon.Globe />,
  };
  return (
    <span className="ms-goal-icon-wrap" style={{ color }}>
      {icons[goalKey] || <Icon.TrendingUp />}
    </span>
  );
}

// ── CountUp animation ────────────────────────────────────────────────────────
function CountUp({ end, pre = "R", suf = "", dur = 800 }) {
  const [v, setV] = useState(0);
  const raf = useRef(); const t0 = useRef();
  useEffect(() => {
    t0.current = null;
    const step = (ts) => {
      if (!t0.current) t0.current = ts;
      const p = Math.min((ts - t0.current) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, dur]);
  return <>{pre}{v.toLocaleString("en-ZA")}{suf}</>;
}

// ── GoalBar — fully driven by real user data ─────────────────────────────────
function GoalBar({ name, goalKey, current, target, color, monthlyRate, timeToGoal, delay = 0 }) {
  const [w, setW] = useState(0);
  const p = pct(current, target);
  const remaining = Math.max(0, target - current);
  useEffect(() => {
    const t = setTimeout(() => setW(p), delay + 200);
    return () => clearTimeout(t);
  }, [p, delay]);

  return (
    <div className="ms-goal">
      <div className="ms-goal-row">
        <GoalIcon goalKey={goalKey} color={color} />
        <span className="ms-goal-name">{name}</span>
        <span className="ms-goal-pct" style={{ color }}>{p}%</span>
      </div>
      <div className="ms-goal-track">
        <div className="ms-goal-fill" style={{
          width: `${w}%`, background: color,
          transition: `width 0.9s cubic-bezier(.4,0,.2,1) ${delay}ms`
        }} />
      </div>
      <div className="ms-goal-footer">
        <span className="ms-goal-amounts">{fmt(current)} <em>of {fmt(target)}</em></span>
        {p < 100 && remaining > 0 && monthlyRate > 0 && (
          <span className="ms-goal-eta">
            {timeToGoal ? `~${timeToGoal} to go` : `${fmt(remaining)} remaining`}
          </span>
        )}
        {p >= 100 && (
          <span className="ms-goal-complete" style={{ color: GRN }}>Target met</span>
        )}
      </div>
    </div>
  );
}

// ── Nudge ────────────────────────────────────────────────────────────────────
function Nudge({ type, dot, text, i }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className={`ms-nudge ms-nudge-${type}`} style={{ animationDelay: `${i * 0.1}s` }}>
      <div className="ms-nudge-dot" style={{ background: dot }} />
      <p>{text}</p>
      <button onClick={() => setGone(true)}>✕</button>
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="ms-tip">
    <div className="ms-tip-l">{label ?? payload[0].name}</div>
    <div className="ms-tip-v">{fmt(payload[0].value)}</div>
  </div>
) : null;

// ── Inline edit field ─────────────────────────────────────────────────────────
function EditField({ label, field, value, type = "number", onChange }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal]     = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  const commit = () => {
    onChange(field, type === "number" ? Number(local) : local);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="ms-edit-field editing">
        <span className="ms-edit-label">{label}</span>
        <div className="ms-edit-row">
          <input type={type} value={local} autoFocus className="ms-edit-input"
            onChange={e => setLocal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          />
          <button className="ms-edit-save" onClick={commit}>✓</button>
          <button className="ms-edit-cancel" onClick={() => setEditing(false)}>✕</button>
        </div>
      </div>
    );
  }
  return (
    <div className="ms-edit-field" onClick={() => setEditing(true)}>
      <span className="ms-edit-label">{label}</span>
      <div className="ms-edit-row">
        <span className="ms-edit-val">{type === "number" ? fmt(Number(value) || 0) : value || "—"}</span>
        <span className="ms-edit-icon"><Icon.Edit /></span>
      </div>
    </div>
  );
}

// ── Tax breakdown ─────────────────────────────────────────────────────────────
function TaxBreakdown({ metrics }) {
  const rows = [
    { label: "Gross salary",      val: fmt(metrics.gross),            color: GRN, note: "Before deductions" },
    { label: "PAYE (income tax)", val: `-${fmt(metrics.monthlyPAYE)}`,color: R,   note: `${metrics.effectiveRate}% effective / ${metrics.marginalRate}% marginal` },
    { label: "UIF",               val: `-${fmt(metrics.uif)}`,        color: AMB, note: "1% capped at R17 712/month" },
    { label: "Net take-home",     val: fmt(metrics.netSalary),        color: GRN, note: metrics.taxBracket },
  ];
  return (
    <div className="ms-tax-breakdown">
      {rows.map((r, i) => (
        <div key={i} className={`ms-tax-row ${i === rows.length - 1 ? "ms-tax-total" : ""}`}>
          <div>
            <span className="ms-tax-label">{r.label}</span>
            <span className="ms-tax-note">{r.note}</span>
          </div>
          <span className="ms-tax-val" style={{ color: r.color }}>{r.val}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tax tip icon — pure SVG replaces emoji ─────────────────────────────────
function TaxTipIcon({ type }) {
  if (type === "ra")   return <span className="ms-tax-tip-icon-svg" style={{ background: "rgba(200,16,46,0.12)", color: R }}><Icon.FileText /></span>;
  if (type === "tfsa") return <span className="ms-tax-tip-icon-svg" style={{ background: "rgba(29,158,117,0.12)", color: GRN }}><Icon.Briefcase /></span>;
  if (type === "med")  return <span className="ms-tax-tip-icon-svg" style={{ background: "rgba(37,99,235,0.12)", color: BLU }}><Icon.Heart /></span>;
  return null;
}

// ── Compute time-to-goal from monthly savings rate ───────────────────────────
function timeToGoal(current, target, monthlyContrib) {
  if (current >= target || monthlyContrib <= 0) return null;
  const months = Math.ceil((target - current) / monthlyContrib);
  if (months <= 0) return null;
  if (months < 12) return `${months}mo`;
  const yrs = Math.floor(months / 12);
  const mo  = months % 12;
  return mo > 0 ? `${yrs}yr ${mo}mo` : `${yrs}yr`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MoneySnapshot() {
  const [tab,  setTab]  = useState("overview");
  const [sl,   setSl]   = useState(null);
  const [on,   setOn]   = useState(false);
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setOn(true), 16); }, []);

  const handleEdit = (field, value) => {
    const updated = { ...user, [field]: value };
    setUser(updated);
    saveUser(updated);
  };

  // ── Real user data ──────────────────────────────────────────────────────────
  const name      = user.name       || "there";
  const salary    = Number(user.salary)        || 0;
  const rent      = Number(user.rent)          || 0;
  const savings   = Number(user.savings)       || 0;
  const emergency = Number(user.emergencyFund) || 0;
  const carFin    = Number(user.carFinance)    || 0;
  const studLoan  = Number(user.studentLoan)   || 0;
  const invest    = Number(user.investments)   || 0;
  const trackRaw  = (user.track || "").trim();

  const trackLabel =
    trackRaw.toLowerCase().includes("property") ? "Property Builder" :
    trackRaw.toLowerCase().includes("balance") || trackRaw.toLowerCase().includes("lifestyle") ? "Balanced Investor" :
    trackRaw.toLowerCase().includes("global") ? "Global Investor" : "Property Builder";

  const isProperty  = trackLabel === "Property Builder";
  const isBalanced  = trackLabel === "Balanced Investor";
  const isGlobal    = trackLabel === "Global Investor";

  // ── SA tax metrics ──────────────────────────────────────────────────────────
  const metrics = calcMetrics({
    salary, rent, carFinance: carFin,
    studentLoan: studLoan, investments: invest,
    savings, emergencyFund: emergency,
  });

  // ── Spend buckets ───────────────────────────────────────────────────────────
  const spendBuckets = calcSpendBuckets({
    salary, rent, carFinance: carFin,
    studentLoan: studLoan, investments: invest,
    netSalary: metrics.netSalary,
  });
  const spendTotal = spendBuckets.reduce((s, b) => s + b.value, 0);

  // ── Real goal targets derived from user data ────────────────────────────────
  // Emergency fund: 3 months of actual essential expenses
  const monthlyEssentials = rent + carFin + studLoan + Math.max(0, metrics.netSalary - invest - rent - carFin - studLoan) * 0.4;
  const emergencyTarget   = Math.max(monthlyEssentials * 3, salary * 2);

  // Deposit: 10% of a realistic property price for their income band
  // (rule of thumb: ~4–5× annual salary for starter home)
  const realisticPropPrice = salary * 12 * 4.5;
  const depositTarget      = Math.round(realisticPropPrice * 0.1);

  // Investment portfolio: 12-month run rate (meaningful near-term target)
  const investTarget12m    = invest * 12;
  // For balanced/global tracks, use a 24-month target
  const investTarget       = isProperty ? investTarget12m : invest * 24;

  // Global track: offshore runway target
  const globalTarget = invest * 36;

  // ── Goals — track-aware ─────────────────────────────────────────────────────
  const goals = isGlobal ? [
    {
      goalKey: "emergency", name: "Emergency fund",
      current: emergency, target: emergencyTarget, color: GRN,
      monthlyRate: invest * 0.3,
      timeToGoal: timeToGoal(emergency, emergencyTarget, invest * 0.3),
    },
    {
      goalKey: "invest", name: "Local portfolio",
      current: savings + invest * 6, target: investTarget, color: BLU,
      monthlyRate: invest,
      timeToGoal: timeToGoal(savings + invest * 6, investTarget, invest),
    },
    {
      goalKey: "global", name: "Offshore portfolio",
      current: savings * 0.3, target: globalTarget * 0.4, color: "#7C3AED",
      monthlyRate: invest * 0.4,
      timeToGoal: timeToGoal(savings * 0.3, globalTarget * 0.4, invest * 0.4),
    },
  ] : isBalanced ? [
    {
      goalKey: "emergency", name: "Emergency fund",
      current: emergency, target: emergencyTarget, color: GRN,
      monthlyRate: invest * 0.2,
      timeToGoal: timeToGoal(emergency, emergencyTarget, invest * 0.2),
    },
    {
      goalKey: "invest", name: "Investment portfolio",
      current: savings + invest * 6, target: investTarget, color: BLU,
      monthlyRate: invest,
      timeToGoal: timeToGoal(savings + invest * 6, investTarget, invest),
    },
    {
      goalKey: "deposit", name: "Lifestyle reserve",
      current: Math.max(0, savings - emergency), target: salary * 3, color: AMB,
      monthlyRate: Math.max(0, metrics.disposable * 0.3),
      timeToGoal: timeToGoal(Math.max(0, savings - emergency), salary * 3, metrics.disposable * 0.3),
    },
  ] : [
    // Property Builder (default)
    {
      goalKey: "emergency", name: "Emergency fund",
      current: emergency, target: emergencyTarget, color: GRN,
      monthlyRate: invest * 0.2,
      timeToGoal: timeToGoal(emergency, emergencyTarget, invest * 0.2),
    },
    {
      goalKey: "deposit", name: "Property deposit",
      current: savings, target: depositTarget, color: R,
      monthlyRate: invest * 0.6,
      timeToGoal: timeToGoal(savings, depositTarget, invest * 0.6),
    },
    {
      goalKey: "invest", name: "Investment portfolio",
      current: invest * 6, target: investTarget12m || salary, color: BLU,
      monthlyRate: invest,
      timeToGoal: timeToGoal(invest * 6, investTarget12m || salary, invest),
    },
  ];

  // ── Narratives ──────────────────────────────────────────────────────────────
  const narratives = generateNarratives(metrics, spendBuckets);
  const { band }   = getIncomeBand(salary);

  // ── Health score ────────────────────────────────────────────────────────────
  const savingsRate = salary > 0 ? (invest / salary) * 100 : 0;
  const healthScore = Math.min(100, Math.round(
    (savingsRate >= 20 ? 25 : savingsRate * 1.25) +
    (emergency >= emergencyTarget ? 25 : pct(emergency, emergencyTarget) * 0.25) +
    (metrics.disposable > 0 ? 25 : 0) +
    (metrics.debtToIncome < 15 ? 25 : metrics.debtToIncome < 30 ? 15 : 5)
  ));
  const scoreColor  = healthScore >= 75 ? GRN : healthScore >= 50 ? AMB : R;
  const CIRC = 251.3;

  // ── Wealth history (anchored to real net worth) ─────────────────────────────
  const netWorth = metrics.netWorth;
  const wealthHistory = [
    { m: "Nov", v: Math.round(netWorth * 0.62) },
    { m: "Dec", v: Math.round(netWorth * 0.71) },
    { m: "Jan", v: Math.round(netWorth * 0.80) },
    { m: "Feb", v: Math.round(netWorth * 0.88) },
    { m: "Mar", v: Math.round(netWorth * 0.94) },
    { m: "Apr", v: netWorth },
  ];

  // ── Activity (real user figures, skip zero lines) ───────────────────────────
  const activity = [
    { label: "Salary deposit",  amount: `+${fmt(metrics.netSalary)}`, date: "01 Apr", pos: true,  note: `After PAYE ${fmt(metrics.monthlyPAYE)} + UIF ${fmt(metrics.uif)}` },
    rent      ? { label: "Rent / Bond",    amount: `-${fmt(rent)}`,      date: "02 Apr", pos: false, note: `${spendBuckets.find(b=>b.key==="housing")?.pct ?? 0}% of take-home` } : null,
    carFin    ? { label: "Car Finance",    amount: `-${fmt(carFin)}`,    date: "03 Apr", pos: false, note: "Mobility" } : null,
    invest    ? { label: "ETF Investment", amount: `-${fmt(invest)}`,    date: "05 Apr", pos: false, note: `${metrics.netSavingsRate}% of net income` } : null,
    studLoan  ? { label: "Student Loan",   amount: `-${fmt(studLoan)}`,  date: "06 Apr", pos: false, note: "Debt repayment" } : null,
  ].filter(Boolean);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Metric cards ────────────────────────────────────────────────────────────
  const metricCards = [
    { label: "Net take-home",   val: fmt(metrics.netSalary), tag: `After ${metrics.effectiveRate}% tax`, tagClass: "ms-tag-neutral", delay: 0 },
    { label: "Disposable income", val: fmt(Math.max(0, metrics.disposable)), tag: metrics.disposable > 3000 ? "Healthy buffer" : metrics.disposable > 0 ? "Tight" : "Over-committed", tagClass: metrics.disposable > 3000 ? "ms-tag-pos" : "ms-tag-neg", delay: 40 },
    { label: "Savings rate",    val: `${metrics.savingsRate}%`, tag: metrics.savingsRate >= 20 ? "On target" : "Below 20% goal", tagClass: metrics.savingsRate >= 20 ? "ms-tag-pos" : "ms-tag-neg", delay: 80 },
    { label: "Debt-to-income",  val: `${metrics.debtToIncome}%`, tag: metrics.debtToIncome < 20 ? "Low risk" : metrics.debtToIncome < 35 ? "Moderate" : "High", tagClass: metrics.debtToIncome < 20 ? "ms-tag-pos" : metrics.debtToIncome < 35 ? "ms-tag-neutral" : "ms-tag-neg", delay: 120 },
  ];

  // ── Goal summary cards (Goals tab) ─────────────────────────────────────────
  const goalSummaryCards = goals.map(g => ({
    label:  g.name,
    v:      `${pct(g.current, g.target)}%`,
    sub:    `${fmt(g.current)} of ${fmt(g.target)}`,
    note:   g.current >= g.target
              ? "Target met"
              : g.timeToGoal
                ? `~${g.timeToGoal} at current rate`
                : `${fmt(Math.max(0, g.target - g.current))} remaining`,
    c:      g.color,
  }));

  return (
    <main className={`ms-main ${on ? "ms-on" : ""}`}>

      {/* ══ HERO ══ */}
      <div className="ms-hero">
        <div className="ms-hero-content">
          <span className="ms-eyebrow">Money Snapshot</span>
          <h1 className="ms-hello">{greeting}, <span>{name}</span></h1>
          <p className="ms-sub">
            {band} · Net take-home {fmt(metrics.netSalary)}/month · Health score {healthScore}/100
          </p>
          <div className="ms-hero-pills">
            <span className="ms-pill ms-pill-red">{trackLabel}</span>
            <span className="ms-pill ms-pill-green">Savings {metrics.savingsRate}%</span>
            <span className="ms-pill ms-pill-grey">DTI {metrics.debtToIncome}%</span>
          </div>
        </div>
        <div className="ms-hero-score">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
            <circle cx="44" cy="44" r="40" fill="none" stroke={scoreColor} strokeWidth="7"
              strokeDasharray={`${(healthScore / 100) * CIRC} ${CIRC}`}
              strokeLinecap="round" transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dasharray 1.2s ease .3s" }}
            />
            <text x="44" y="49" textAnchor="middle" fontSize="16" fontWeight="700" fill={scoreColor}>{healthScore}</text>
          </svg>
          <div>
            <span className="ms-score-label">Health</span>
            <span className="ms-score-sub">out of 100</span>
          </div>
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="ms-stats">
        {metricCards.map((c, i) => (
          <div key={i} className="ms-stat" style={{ animationDelay: `${c.delay}ms` }}>
            <p className="ms-stat-label">{c.label}</p>
            <p className="ms-stat-val">{c.val}</p>
            <span className={`ms-stat-tag ${c.tagClass}`}>{c.tag}</span>
          </div>
        ))}
      </div>

      {/* ══ TABS ══ */}
      <div className="ms-tabs">
        {[
          { id: "overview",  label: "Overview" },
          { id: "spending",  label: "Spending" },
          { id: "tax",       label: "Tax & Pay" },
          { id: "goals",     label: "Goals" },
          { id: "activity",  label: "Activity" },
          { id: "edit",      label: "Edit" },
        ].map(t => (
          <button key={t.id} className={`ms-tab ${tab === t.id ? "ms-tab-on" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {tab === "overview" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Net worth growth</span>
                <span className="ms-badge ms-badge-green">6-month</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={wealthHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={R} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={R} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "rgba(240,235,232,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `R${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "rgba(240,235,232,0.4)" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="v" stroke={R} strokeWidth={2.5} fill="url(#ag)" dot={{ r: 4, fill: R, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Monthly spend</span></div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={[
                  { m: "Nov", v: Math.round(spendTotal * 0.92) },
                  { m: "Dec", v: Math.round(spendTotal * 1.07) },
                  { m: "Jan", v: Math.round(spendTotal * 0.97) },
                  { m: "Feb", v: Math.round(spendTotal * 1.01) },
                  { m: "Mar", v: Math.round(spendTotal * 0.96) },
                  { m: "Apr", v: spendTotal },
                ]} barSize={16} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "rgba(240,235,232,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                    {[0,1,2,3,4,5].map(i => <Cell key={i} fill={i === 5 ? R : "rgba(255,255,255,0.07)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="ms-card-foot">Apr total: <strong style={{ color: R }}>{fmt(spendTotal)}</strong></p>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Insights</span></div>
              {narratives.length > 0
                ? narratives.map((n, i) => (
                    <Nudge key={i} type={n.type} dot={n.type === "success" ? GRN : n.type === "warn" ? AMB : BLU} text={n.text} i={i} />
                  ))
                : <p style={{ fontSize: 12, color: "rgba(240,235,232,0.3)" }}>Complete your profile to see personalised insights.</p>
              }
            </div>

            <div className="ms-g-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Goal progress — {trackLabel}</span>
                <button className="ms-link" onClick={() => setTab("goals")}>View all</button>
              </div>
              {goals.map((g, i) => (
                <GoalBar key={g.name} {...g} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ SPENDING ══ */}
      {tab === "spending" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Spending breakdown</span></div>
              <div className="ms-donut">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={spendBuckets} cx="50%" cy="50%" innerRadius={62} outerRadius={90}
                      dataKey="value" strokeWidth={0}
                      onMouseEnter={(_, i) => setSl(i)} onMouseLeave={() => setSl(null)}>
                      {spendBuckets.map((e, i) => (
                        <Cell key={i} fill={e.color} opacity={sl === null || sl === i ? 1 : 0.3}
                          style={{ cursor: "pointer", transition: "opacity .2s" }} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ms-donut-mid">
                  {sl !== null ? <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: spendBuckets[sl]?.color }}>{fmt(spendBuckets[sl]?.value)}</p>
                    <p style={{ fontSize: 11, color: "rgba(240,235,232,0.4)" }}>{spendBuckets[sl]?.name}</p>
                  </> : <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#f0ebe8" }}>{fmt(spendTotal)}</p>
                    <p style={{ fontSize: 11, color: "rgba(240,235,232,0.4)" }}>total spend</p>
                  </>}
                </div>
              </div>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Categories vs benchmark</span></div>
              {spendBuckets.map((d, i) => (
                <div key={d.name} className={`ms-cat-row${sl === i ? " ms-cat-on" : ""}`}
                  onMouseEnter={() => setSl(i)} onMouseLeave={() => setSl(null)}>
                  <div className="ms-cat-l">
                    <div className="ms-cat-dot" style={{ background: d.color }} />
                    <div>
                      <span className="ms-cat-name">{d.name}</span>
                      <span className="ms-cat-bench">Bench: {d.benchmark}%</span>
                    </div>
                  </div>
                  <div className="ms-cat-r">
                    <div className="ms-cat-bg">
                      <div className="ms-cat-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                    </div>
                    <span className="ms-cat-pct" style={{ color: d.pct > d.benchmark + 5 ? AMB : d.color }}>{d.pct}%</span>
                    <span className="ms-cat-amt">{fmt(d.value)}</span>
                  </div>
                </div>
              ))}
              <div className="ms-spend-note">Benchmark is typical allocation for {band} earners in SA</div>
            </div>

            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Spending insights — {band}</span></div>
              {narratives.map((n, i) => (
                <Nudge key={i} type={n.type} dot={n.type === "success" ? GRN : n.type === "warn" ? AMB : BLU} text={n.text} i={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAX & PAY ══ */}
      {tab === "tax" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">SARS tax breakdown (2024/25)</span></div>
              <TaxBreakdown metrics={metrics} />
              <div className="ms-callout" style={{ marginTop: 16 }}>
                You're in the <strong style={{ color: AMB }}>{metrics.taxBracket}</strong>. Effective rate{" "}
                <strong style={{ color: GRN }}>{metrics.effectiveRate}%</strong> — you keep{" "}
                <strong style={{ color: GRN }}>{(100 - metrics.effectiveRate).toFixed(1)}%</strong> of every rand.
              </div>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Key financial metrics</span></div>
              {[
                { label: "Gross salary",        val: fmt(salary),                        note: "Before deductions" },
                { label: "Monthly PAYE",         val: fmt(metrics.monthlyPAYE),           note: `${metrics.effectiveRate}% effective`,      c: R },
                { label: "UIF",                  val: fmt(metrics.uif),                   note: "1% capped",                                c: AMB },
                { label: "Net take-home",        val: fmt(metrics.netSalary),             note: "Actual deposited salary",                  c: GRN },
                { label: "Disposable income",    val: fmt(Math.max(0, metrics.disposable)), note: "After all commitments",                  c: metrics.disposable > 0 ? GRN : R },
                { label: "Net worth (liquid)",   val: fmt(metrics.netWorth),              note: "Savings + emergency fund" },
                { label: "Savings rate (gross)", val: `${metrics.savingsRate}%`,          note: "Of gross income",                          c: metrics.savingsRate >= 20 ? GRN : AMB },
                { label: "Debt-to-income",       val: `${metrics.debtToIncome}%`,         note: "Debt / gross salary",                      c: metrics.debtToIncome < 20 ? GRN : metrics.debtToIncome < 35 ? AMB : R },
                { label: "Emergency cover",      val: `${metrics.emergencyMonths} months`,note: "Of essential expenses",                    c: metrics.emergencyMonths >= 3 ? GRN : AMB },
              ].map((r, i) => (
                <div key={i} className="ms-metric-row">
                  <div>
                    <span className="ms-metric-label">{r.label}</span>
                    <span className="ms-metric-note">{r.note}</span>
                  </div>
                  <span className="ms-metric-val" style={{ color: r.c || "var(--text)" }}>{r.val}</span>
                </div>
              ))}
            </div>

            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Tax saving opportunities</span></div>
              <div className="ms-tax-tips">
                {[
                  { type: "ra",   title: "Retirement Annuity (RA)",       body: `Deduct up to 27.5% of taxable income (max R350k/year). At your income, contributing R${Math.round(salary * 0.1 * 12).toLocaleString("en-ZA")}/year saves ~R${Math.round(salary * 0.1 * 12 * (metrics.marginalRate / 100)).toLocaleString("en-ZA")} in tax.` },
                  { type: "tfsa", title: "Tax-Free Savings Account (TFSA)", body: "Invest up to R36 000/year (R500k lifetime) with zero tax on returns, dividends, or capital gains." },
                  { type: "med",  title: "Medical Aid Credits",             body: "Monthly credits: primary member R364, first dependant R364, additional R246 each — deducted directly from your PAYE." },
                ].map((tip, i) => (
                  <div key={i} className="ms-tax-tip">
                    <TaxTipIcon type={tip.type} />
                    <div>
                      <p className="ms-tax-tip-title">{tip.title}</p>
                      <p className="ms-tax-tip-body">{tip.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ GOALS ══ */}
      {tab === "goals" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Financial goals — {trackLabel}</span></div>
              {goals.map((g, i) => (
                <GoalBar key={g.name} {...g} delay={i * 120} />
              ))}
              <div className="ms-callout">
                Goals are calculated from your actual salary of {fmt(salary)}/month, net take-home of {fmt(metrics.netSalary)}/month,
                and monthly investment of {fmt(invest)}.{" "}
                <button className="ms-link" onClick={() => setTab("edit")} style={{ display: "inline" }}>
                  Update your figures
                </button>{" "}
                to recalculate in real time.
              </div>
            </div>

            {goalSummaryCards.map(x => (
              <div key={x.label} className="ms-g-third ms-card ms-summary-card" style={{ borderTop: `3px solid ${x.c}` }}>
                <p className="ms-summary-label">{x.label}</p>
                <p className="ms-summary-val" style={{ color: x.c }}>{x.v}</p>
                <p className="ms-summary-sub">{x.sub}</p>
                <p className="ms-summary-note">{x.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ ACTIVITY ══ */}
      {tab === "activity" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Recent activity</span></div>
              {activity.map((a, i) => (
                <div key={i} className="ms-act" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="ms-act-av" style={{ background: a.pos ? "rgba(29,158,117,0.1)" : "rgba(200,16,46,0.08)" }}>
                    <span style={{ color: a.pos ? GRN : R, fontSize: 16, fontWeight: 700 }}>{a.pos ? "+" : "−"}</span>
                  </div>
                  <div className="ms-act-info">
                    <p className="ms-act-name">{a.label}</p>
                    <p className="ms-act-date">{a.date} · <em>{a.note}</em></p>
                  </div>
                  <span className="ms-act-amt" style={{ color: a.pos ? GRN : R }}>{a.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT ══ */}
      {tab === "edit" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Update your snapshot</span>
                <span className="ms-badge ms-badge-green">Auto-saves instantly</span>
              </div>
              <p className="ms-edit-desc">Click any field to edit. All goals, charts, and metrics recalculate immediately.</p>
              <div className="ms-edit-grid">
                <EditField label="First name"           field="name"          value={user.name || ""}  type="text" onChange={handleEdit} />
                <EditField label="Monthly gross salary" field="salary"        value={salary}                       onChange={handleEdit} />
                <EditField label="Monthly rent / bond"  field="rent"          value={rent}                         onChange={handleEdit} />
                <EditField label="Car finance"          field="carFinance"    value={carFin}                       onChange={handleEdit} />
                <EditField label="Student loan"         field="studentLoan"   value={studLoan}                     onChange={handleEdit} />
                <EditField label="Monthly investments"  field="investments"   value={invest}                       onChange={handleEdit} />
                <EditField label="Current savings"      field="savings"       value={savings}                      onChange={handleEdit} />
                <EditField label="Emergency fund"       field="emergencyFund" value={emergency}                    onChange={handleEdit} />
              </div>
              <div className="ms-callout" style={{ marginTop: 16 }}>
                Changes save instantly. Goal targets update to reflect your real income and spending patterns.
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="ms-cta" onClick={() => navigate("/simulation")}>
        Open Simulation Lab — model your next financial move
      </button>
    </main>
  );
}