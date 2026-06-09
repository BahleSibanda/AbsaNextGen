import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { calcMetrics, calcSpendBuckets, generateNarratives, getIncomeBand } from "../utils/saTax";
import "../styles/moneySnapshot.css";

// ── Colour palette ────────────────────────────────────────────────────────────
const R   = "#C8102E";
const GRN = "#1D9E75";
const BLU = "#2563EB";
const AMB = "#EF9F27";
const PUR = "#7C3AED";

const getUser  = () => JSON.parse(localStorage.getItem("nw_user") || "{}");
const saveUser = (d) => localStorage.setItem("nw_user", JSON.stringify(d));
const fmt  = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct  = (c, t) => t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;

// ── Sub-components ────────────────────────────────────────────────────────────
function CountUp({ end, pre = "R", suf = "", dur = 1000 }) {
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

function GoalBar({ name, current, target, color, icon, delay = 0 }) {
  const [w, setW] = useState(0);
  const p = pct(current, target);
  useEffect(() => { const t = setTimeout(() => setW(p), delay + 300); return () => clearTimeout(t); }, [p, delay]);
  return (
    <div className="ms-goal">
      <div className="ms-goal-row">
        <span className="ms-goal-icon">{icon}</span>
        <span className="ms-goal-name">{name}</span>
        <span className="ms-goal-pct" style={{ color }}>{p}%</span>
      </div>
      <div className="ms-goal-track">
        <div className="ms-goal-fill" style={{ width: `${w}%`, background: color, transition: `width 0.9s cubic-bezier(.4,0,.2,1) ${delay}ms` }} />
      </div>
      <span className="ms-goal-amounts">{fmt(current)} <em>of {fmt(target)}</em></span>
    </div>
  );
}

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

// Inline edit field for snapshot page
function EditField({ label, field, value, type = "number", onChange }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const ref = useRef();

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
          <input
            ref={ref}
            type={type}
            value={local}
            autoFocus
            onChange={e => setLocal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            className="ms-edit-input"
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
        <span className="ms-edit-val">{type === "number" ? fmt(Number(value) || 0) : value}</span>
        <span className="ms-edit-icon">✏️</span>
      </div>
    </div>
  );
}

// Tax breakdown component
function TaxBreakdown({ metrics }) {
  const rows = [
    { label: "Gross salary",        val: fmt(metrics.gross),       color: GRN,  note: "Before deductions" },
    { label: "PAYE (income tax)",   val: `-${fmt(metrics.monthlyPAYE)}`, color: R, note: `${metrics.effectiveRate}% effective / ${metrics.marginalRate}% marginal` },
    { label: "UIF",                 val: `-${fmt(metrics.uif)}`,   color: AMB,  note: "1% capped at R17 712/month" },
    { label: "Net take-home",       val: fmt(metrics.netSalary),   color: GRN,  note: metrics.taxBracket },
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

// ── Main component ────────────────────────────────────────────────────────────
export default function MoneySnapshot() {
  const [tab, setTab]   = useState("overview");
  const [sl, setSl]     = useState(null);
  const [on, setOn]     = useState(false);
  const [user, setUser] = useState(getUser());
  const navigate        = useNavigate();

  useEffect(() => { setTimeout(() => setOn(true), 80); }, []);

  // Persist edits back to localStorage + re-derive metrics
  const handleEdit = (field, value) => {
    const updated = { ...user, [field]: value };
    setUser(updated);
    saveUser(updated);
  };

  // ── Pull & derive all data ─────────────────────────────────────────────────
  const name       = user.name       || "there";
  const salary     = Number(user.salary)       || 48000;
  const rent       = Number(user.rent)         || 12000;
  const savings    = Number(user.savings)      || 20000;
  const emergency  = Number(user.emergencyFund)|| 18000;
  const carFin     = Number(user.carFinance)   || 6500;
  const studLoan   = Number(user.studentLoan)  || 2500;
  const invest     = Number(user.investments)  || 4000;
  const trackRaw   = (user.track || "Buy property within 5 years").trim();

  const trackLabel = trackRaw.includes("property") || trackRaw.includes("Property")
    ? "Property Builder"
    : trackRaw.includes("Balance") || trackRaw.includes("lifestyle")
      ? "Balanced Investor"
      : "Global Investor";

  // Real SA tax metrics
  const metrics = calcMetrics({ salary, rent, carFinance: carFin, studentLoan: studLoan, investments: invest, savings, emergencyFund: emergency });

  // 5-bucket spend categories (uses net salary)
  const spendBuckets = calcSpendBuckets({ salary, rent, carFinance: carFin, studentLoan: studLoan, investments: invest, netSalary: metrics.netSalary });
  const spendTotal   = spendBuckets.reduce((s, b) => s + b.value, 0);

  // Goals
  const emergencyTarget = salary * 3;
  const depositTarget   = 200000;
  const investTarget    = 100000;
  const goals = [
    { name: "Emergency fund",   current: emergency, target: emergencyTarget, color: GRN, icon: "🛡️" },
    { name: "Property deposit", current: savings,   target: depositTarget,   color: R,   icon: "🏠" },
    { name: "Investments",      current: invest * 6,target: investTarget,    color: BLU, icon: "📈" },
  ];

  // Smart narratives
  const narratives = generateNarratives(metrics, spendBuckets);
  const { band }   = getIncomeBand(salary);

  // Health score (uses real savings rate from invest, not savings balance)
  const savingsRate = salary > 0 ? (invest / salary) * 100 : 0;
  const healthScore = Math.min(100, Math.round(
    (savingsRate >= 20 ? 25 : savingsRate * 1.25) +
    (emergency >= emergencyTarget ? 25 : pct(emergency, emergencyTarget) * 0.25) +
    (metrics.disposable > 0 ? 25 : 0) +
    (metrics.debtToIncome < 15 ? 25 : metrics.debtToIncome < 30 ? 15 : 5)
  ));
  const scoreColor = healthScore >= 75 ? GRN : healthScore >= 50 ? AMB : R;
  const CIRC = 251.3;

  // Net worth history (simulated 6-month trajectory)
  const netWorth = metrics.netWorth;
  const wealthHistory = [
    { m: "Nov", v: Math.round(netWorth * 0.62) },
    { m: "Dec", v: Math.round(netWorth * 0.71) },
    { m: "Jan", v: Math.round(netWorth * 0.80) },
    { m: "Feb", v: Math.round(netWorth * 0.88) },
    { m: "Mar", v: Math.round(netWorth * 0.94) },
    { m: "Apr", v: netWorth },
  ];

  const activity = [
    { label: "Salary deposit",   amount: `+${fmt(metrics.netSalary)}`, date: "01 Apr", pos: true,  note: `After PAYE ${fmt(metrics.monthlyPAYE)} + UIF ${fmt(metrics.uif)}` },
    { label: "Rent / Bond",      amount: `-${fmt(rent)}`,      date: "02 Apr", pos: false, note: `${spendBuckets.find(b=>b.key==="housing")?.pct ?? 0}% of take-home` },
    { label: "Car Finance",      amount: `-${fmt(carFin)}`,    date: "03 Apr", pos: false, note: "Mobility" },
    { label: "ETF Investment",   amount: `-${fmt(invest)}`,    date: "05 Apr", pos: false, note: `${metrics.netSavingsRate}% of net income` },
    { label: "Student Loan",     amount: `-${fmt(studLoan)}`,  date: "06 Apr", pos: false, note: "Debt repayment" },
  ].filter(a => !a.amount.includes("R0"));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Key metrics cards
  const metricCards = [
    {
      label: "Net take-home",
      val: fmt(metrics.netSalary),
      tag: `After ${metrics.effectiveRate}% tax`,
      tagClass: "ms-tag-neutral",
      delay: 0,
    },
    {
      label: "Disposable income",
      val: fmt(Math.max(0, metrics.disposable)),
      tag: metrics.disposable > 3000 ? "Healthy buffer" : metrics.disposable > 0 ? "Tight" : "Over-committed",
      tagClass: metrics.disposable > 3000 ? "ms-tag-pos" : "ms-tag-neg",
      delay: 100,
    },
    {
      label: "Savings rate",
      val: `${metrics.savingsRate}%`,
      tag: metrics.savingsRate >= 20 ? "On target" : "Below 20% goal",
      tagClass: metrics.savingsRate >= 20 ? "ms-tag-pos" : "ms-tag-neg",
      delay: 200,
    },
    {
      label: "Debt-to-income",
      val: `${metrics.debtToIncome}%`,
      tag: metrics.debtToIncome < 20 ? "Low risk" : metrics.debtToIncome < 35 ? "Moderate" : "High",
      tagClass: metrics.debtToIncome < 20 ? "ms-tag-pos" : metrics.debtToIncome < 35 ? "ms-tag-neutral" : "ms-tag-neg",
      delay: 300,
    },
  ];

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
            <p className="ms-stat-val">
              <CountUp end={typeof c.val === "string" && c.val.startsWith("R") ? parseInt(c.val.replace(/\D/g, "")) : 0}
                pre={c.val.startsWith("R") ? "R" : ""} suf={c.val.includes("%") ? "%" : ""} />
              {!c.val.startsWith("R") && !c.val.includes("%") ? c.val : ""}
            </p>
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
          { id: "edit",      label: " Edit" },
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
                <span className="ms-badge ms-badge-green">+{fmt(netWorth * 0.38)} 6-month</span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={wealthHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={R} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={R} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "rgba(240,235,232,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "rgba(240,235,232,0.4)" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="v" stroke={R} strokeWidth={2.5} fill="url(#ag)" dot={{ r: 4, fill: R, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Monthly spend by category</span></div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={[
                  { m: "Nov", v: Math.round(spendTotal * 0.92) }, { m: "Dec", v: Math.round(spendTotal * 1.07) },
                  { m: "Jan", v: Math.round(spendTotal * 0.97) }, { m: "Feb", v: Math.round(spendTotal * 1.01) },
                  { m: "Mar", v: Math.round(spendTotal * 0.96) }, { m: "Apr", v: spendTotal },
                ]} barSize={16} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="m" tick={{ fontSize: 10, fill: "rgba(240,235,232,0.4)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                    {[0, 1, 2, 3, 4, 5].map(i => <Cell key={i} fill={i === 5 ? R : "rgba(255,255,255,0.08)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="ms-card-foot">Apr: <strong style={{ color: R }}>{fmt(spendTotal)}</strong></p>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Insights</span></div>
              {narratives.map((n, i) => (
                <Nudge key={i} type={n.type} dot={n.type === "success" ? GRN : n.type === "warn" ? AMB : BLU} text={n.text} i={i} />
              ))}
            </div>

            <div className="ms-g-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Goal progress</span>
                <button className="ms-link" onClick={() => setTab("goals")}>View all →</button>
              </div>
              {goals.map((g, i) => <GoalBar key={g.name} {...g} delay={i * 120} />)}
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
                      <span className="ms-cat-name">{d.icon} {d.name}</span>
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
              <div className="ms-spend-note">
                <span>Benchmark is typical allocation for {band} earners in SA</span>
              </div>
            </div>

            {/* Narrative for spending */}
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Spending insights — {band}</span></div>
              {generateNarratives(metrics, spendBuckets).map((n, i) => (
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
                You're in the <strong style={{ color: AMB }}>{metrics.taxBracket}</strong>. Your effective rate is{" "}
                <strong style={{ color: GRN }}>{metrics.effectiveRate}%</strong> — meaning you keep{" "}
                <strong style={{ color: GRN }}>{(100 - metrics.effectiveRate).toFixed(1)}%</strong> of every rand earned.
              </div>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Key financial metrics</span></div>
              {[
                { label: "Gross salary",       val: fmt(salary),              note: "Before any deductions" },
                { label: "Monthly PAYE",        val: fmt(metrics.monthlyPAYE), note: `${metrics.effectiveRate}% effective rate`, c: R },
                { label: "UIF contribution",    val: fmt(metrics.uif),         note: "1% capped monthly", c: AMB },
                { label: "Net take-home",       val: fmt(metrics.netSalary),   note: "Actual deposited salary", c: GRN },
                { label: "Disposable income",   val: fmt(Math.max(0, metrics.disposable)), note: "After all commitments", c: metrics.disposable > 0 ? GRN : R },
                { label: "Net worth (liquid)",  val: fmt(metrics.netWorth),    note: "Savings + emergency fund" },
                { label: "Savings rate (gross)",val: `${metrics.savingsRate}%`,note: "Of gross income", c: metrics.savingsRate >= 20 ? GRN : AMB },
                { label: "Debt-to-income",      val: `${metrics.debtToIncome}%`, note: "Debt / gross salary", c: metrics.debtToIncome < 20 ? GRN : metrics.debtToIncome < 35 ? AMB : R },
                { label: "Emergency cover",     val: `${metrics.emergencyMonths} months`, note: "Of essential expenses", c: metrics.emergencyMonths >= 3 ? GRN : AMB },
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
                  { title: "Retirement Annuity (RA)", body: `You can deduct up to 27.5% of your taxable income (max R350k/year) in RA contributions. At your income, contributing R${Math.round(salary * 0.1 * 12).toLocaleString("en-ZA")}/year could save you R${Math.round(salary * 0.1 * 12 * (metrics.marginalRate / 100)).toLocaleString("en-ZA")} in annual tax.` },
                  { title: "Tax-Free Savings Account (TFSA)", body: "Invest up to R36 000/year (R500k lifetime) with zero tax on returns, dividends, or capital gains. Ideal for your medium-term goals." },
                  { title: "Medical Aid Credits", body: "If you contribute to medical aid, you receive a monthly tax credit. Primary member: R364/month. First dependant: R364. Additional: R246 each." },
                ].map((tip, i) => (
                  <div key={i} className="ms-tax-tip">
                    <span className="ms-tax-tip-icon">{tip.icon}</span>
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
              {goals.map((g, i) => <GoalBar key={g.name} {...g} delay={i * 150} />)}
              <div className="ms-callout">
                On the <strong>{trackLabel}</strong> track — based on your net income of {fmt(metrics.netSalary)}/month,
                stay consistent with monthly contributions to hit your milestones.
              </div>
            </div>

            {[
              {
                label: "Emergency fund",
                v: `${pct(emergency, emergencyTarget)}%`,
                sub: `${fmt(emergency)} of ${fmt(emergencyTarget)}`,
                note: emergency >= emergencyTarget
                  ? "Complete! 3 months covered"
                  : `${metrics.emergencyMonths} months covered — target 3`,
                c: GRN,
              },
              {
                label: "Property deposit",
                v: `${pct(savings, depositTarget)}%`,
                sub: `${fmt(savings)} of ${fmt(depositTarget)}`,
                note: "On track for Year 4 milestone",
                c: R,
              },
              {
                label: "Investments",
                v: `${pct(invest * 6, investTarget)}%`,
                sub: `${fmt(invest * 6)} of ${fmt(investTarget)}`,
                note: `+${fmt(invest)}/month invested`,
                c: BLU,
              },
            ].map(x => (
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
                    <span style={{ color: a.pos ? GRN : R }}>{a.pos ? "↑" : "↓"}</span>
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
              <p className="ms-edit-desc">Click any field to edit — changes reflect across the app immediately.</p>
              <div className="ms-edit-grid">
                <EditField label="First name"           field="name"          value={user.name || ""}          type="text"   onChange={handleEdit} />
                <EditField label="Monthly gross salary" field="salary"        value={salary}                                 onChange={handleEdit} />
                <EditField label="Monthly rent / bond"  field="rent"          value={rent}                                   onChange={handleEdit} />
                <EditField label="Car finance"          field="carFinance"    value={carFin}                                 onChange={handleEdit} />
                <EditField label="Student loan"         field="studentLoan"   value={studLoan}                               onChange={handleEdit} />
                <EditField label="Monthly investments"  field="investments"   value={invest}                                 onChange={handleEdit} />
                <EditField label="Current savings"      field="savings"       value={savings}                                onChange={handleEdit} />
                <EditField label="Emergency fund"       field="emergencyFund" value={emergency}                              onChange={handleEdit} />
              </div>
              <div className="ms-callout" style={{ marginTop: 16 }}>
                Changes save instantly to your local profile. All calculations and charts update automatically.
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="ms-cta" onClick={() => navigate("/simulation")}>
        Open Simulation Lab — Property vs Renting →
      </button>
    </main>
  );
}