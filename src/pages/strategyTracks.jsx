import { useState, useEffect, useMemo } from "react";
import { useToast } from "../components/Toast";
import "../styles/strategytracks.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const R   = "#C8102E";
const GRN = "#1D9E75";
const AMB = "#EF9F27";
const BLU = "#378ADD";
const CIRC = 314.2;

// ── Safe storage helpers ──────────────────────────────────────────────────────
function storageGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const getUser            = ()      => storageGet("nw_user", {});
const getMilestones      = (id)    => storageGet(`nw_milestones_${id}`, null);
const saveMilestones     = (id, d) => storageSet(`nw_milestones_${id}`, d);
const getSelectedTrack   = ()      => storageGet("nw_selected_track", null);
const saveSelectedTrack  = (id)    => storageSet("nw_selected_track", id);

const fmt  = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct  = (a, b) => b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0;

// ── SA tax (simplified — mirrors saTax.js) ────────────────────────────────────
function netSalary(gross) {
  const annual = gross * 12;
  const brackets = [
    [0,237100,0,0.18],[237101,370500,42678,0.26],[370501,512800,77362,0.31],
    [512801,673000,121475,0.36],[673001,857900,179147,0.39],[857901,1817000,251258,0.41],[1817001,Infinity,644489,0.45],
  ];
  const b = brackets.find(b => annual <= b[1]);
  const tax = b ? Math.max(0, b[2] + (annual - b[0]) * b[3] - 17235) : 0;
  const uif  = Math.min(gross, 17712) * 0.01;
  return Math.round(gross - tax / 12 - uif);
}

// ── Track definitions (data-driven, targets computed from user inputs) ─────────
function buildTracks(user) {
  const salary     = Number(user.salary)        || 0;
  const savings    = Number(user.savings)        || 0;
  const emergency  = Number(user.emergencyFund)  || 0;
  const invest     = Number(user.investments)    || 0;
  const carFin     = Number(user.carFinance)     || 0;
  const studLoan   = Number(user.studentLoan)    || 0;
  const rent       = Number(user.rent)           || 0;
  const net        = netSalary(salary);

  // Derived targets from user's real numbers
  const monthlyExpenses   = rent + carFin + studLoan + (net - invest - rent - carFin - studLoan) * 0.5;
  const efTarget          = Math.max(monthlyExpenses * 3, salary * 2.5);
  const depositTarget     = Math.max(200000, salary * 4);
  const investPortTarget  = invest > 0 ? invest * 24 : salary * 1.5; // 2-yr run rate
  const globalPortTarget  = invest > 0 ? invest * 36 : salary * 2.5;
  const debtTotal         = carFin + studLoan;
  const dti               = salary > 0 ? (debtTotal / salary) * 100 : 0;
  const savingsRate       = salary > 0 ? (invest / salary) * 100 : 0;

  return [
    {
      id: "property",
      name: "Property Builder",
      tagline: "Own your first home within 5 years",
      color: R,
      description: "Designed for SA professionals who want to purchase property within 3–5 years. Every decision is optimised toward building a deposit, protecting your credit profile, and maintaining the stable income history banks require for bond approval.",
      why: "Property is one of the most powerful wealth-building tools in South Africa — forced savings, leverage, and long-term capital appreciation. For first-time buyers, transfer duty exemptions on properties under R1.1M make entry more accessible. Your current financial position has been assessed against what banks typically require.",
      // Personalised readiness signals based on user data
      readiness: [
        { label: "Emergency fund",     yours: emergency, target: efTarget,      unit: "rand",  goodIfAbove: true },
        { label: "Deposit saved",      yours: savings,   target: depositTarget, unit: "rand",  goodIfAbove: true },
        { label: "Monthly investment", yours: invest,    target: salary * 0.2,  unit: "rand",  goodIfAbove: true },
        { label: "Debt-to-income",     yours: dti,       target: 35,            unit: "pct",   goodIfAbove: false },
        { label: "Savings rate",       yours: savingsRate, target: 20,          unit: "pct",   goodIfAbove: true },
      ],
      milestones: [
        {
          id: "ef", year: "Year 1", label: "Emergency Fund",
          detail: "3–6 months expenses secured",
          yours: emergency, target: efTarget,
          hint: emergency >= efTarget
            ? `✓ You have ${fmt(emergency)} — target met`
            : `You have ${fmt(emergency)} — need ${fmt(efTarget - emergency)} more`,
          status: emergency >= efTarget ? "on-track" : emergency >= efTarget * 0.5 ? "at-risk" : "behind",
          color: GRN,
        },
        {
          id: "dep", year: "Year 2", label: "Deposit Savings",
          detail: "10–20% of target property value",
          yours: savings, target: depositTarget,
          hint: savings >= depositTarget
            ? `✓ You have ${fmt(savings)} — deposit target met`
            : `${fmt(savings)} saved — ${fmt(depositTarget - savings)} to go`,
          status: savings >= depositTarget ? "on-track" : savings >= depositTarget * 0.4 ? "at-risk" : "behind",
          color: R,
        },
        {
          id: "pre", year: "Year 3", label: "Pre-approval Ready",
          detail: "Credit >650, stable income, DTI <35%",
          yours: dti, target: 35,
          hint: dti <= 35
            ? `✓ DTI ${dti.toFixed(1)}% — within bank requirements`
            : `DTI ${dti.toFixed(1)}% — reduce debt by ${fmt(debtTotal - salary * 0.35)}/month`,
          status: dti <= 35 ? "on-track" : dti <= 45 ? "at-risk" : "behind",
          color: AMB,
        },
        {
          id: "buy", year: "Year 4", label: "Property Purchase",
          detail: "First property acquired",
          yours: null, target: null,
          hint: "Complete milestones above to be ready",
          status: emergency >= efTarget && savings >= depositTarget && dti <= 35 ? "on-track" : "behind",
          color: BLU,
        },
      ],
      prioritises: [
        `Build a 10–20% deposit — your target is ${fmt(depositTarget)} based on your income`,
        "Credit score above 650 — check free at TransUnion or Experian",
        `Your current savings rate is ${savingsRate.toFixed(1)}% — aim for 25%+ on this track`,
        "Reduce revolving credit before applying for a bond",
        "Home loan pre-approval before house hunting",
      ],
      avoids: [
        "Large vehicle upgrades or new car finance — increases DTI",
        "Lifestyle inflation despite salary increases",
        "Revolving credit card debt — damages credit score",
        "Withdrawing from savings for non-emergencies",
      ],
      tradeoffs: [
        { pro: "Build equity in an appreciating asset", con: "Large capital tied up, less liquidity" },
        { pro: "Transfer duty exemption under R1.1M", con: "Bond registration costs R20k–R40k upfront" },
        { pro: "Stable monthly repayment (prime-linked)", con: "Interest rate risk if prime increases" },
        { pro: "Potential rental income later", con: "Property is illiquid — takes months to sell" },
      ],
      warnings: [
        "Don't buy at your maximum pre-approval — banks approve more than is comfortable",
        "Factor in levies, rates, insurance, maintenance (~1.5% of value/year)",
        "A 1% rate increase on a R1.5M bond adds ~R750/month",
        "Transfer duty on R1.1M–R1.5M is 3% cash — not in your bond",
      ],
      stats: [
        { label: "Deposit target",    value: fmt(depositTarget) },
        { label: "Target savings",    value: "25%" },
        { label: "Timeline",          value: "4 yrs" },
      ],
      example: {
        name: "Sbu, 27 · Software developer · Johannesburg",
        salary: 52000,
        strategy: "Sbu saves 28% of gross (R14 600/month) across TFSA and money market. No car finance, credit score 692. At this rate he'll have R175 000 saved by month 30 — a 12% deposit on a R1.45M property in Midrand.",
      },
    },
    {
      id: "balanced",
      name: "Balanced Lifestyle",
      tagline: "Invest consistently, live well today",
      color: GRN,
      description: "For professionals who refuse to choose between living well and building wealth. This track creates automated systems — investments, a lifestyle budget, and retirement foundations — that compound without sacrificing the things you enjoy.",
      why: "The biggest risk for high-earning young professionals isn't under-earning — it's lifestyle inflation. This track builds wealth systematically while protecting quality of life, using automation so you never choose between a holiday and your investment.",
      readiness: [
        { label: "Emergency fund",     yours: emergency,   target: efTarget,     unit: "rand", goodIfAbove: true },
        { label: "Monthly investment", yours: invest,      target: salary * 0.15, unit: "rand", goodIfAbove: true },
        { label: "Savings rate",       yours: savingsRate, target: 15,           unit: "pct",  goodIfAbove: true },
        { label: "Lifestyle budget",   yours: Math.max(0, net - invest - rent - carFin - studLoan), target: net * 0.3, unit: "rand", goodIfAbove: false },
        { label: "Debt-to-income",     yours: dti,         target: 30,           unit: "pct",  goodIfAbove: false },
      ],
      milestones: [
        {
          id: "ef", year: "Year 1", label: "Emergency Fund + RA",
          detail: "3 months buffer + retirement annuity started",
          yours: emergency, target: efTarget,
          hint: emergency >= efTarget ? `✓ ${fmt(emergency)} — buffer secured` : `${fmt(emergency)} of ${fmt(efTarget)} — ${fmt(efTarget - emergency)} to go`,
          status: emergency >= efTarget ? "on-track" : emergency >= efTarget * 0.5 ? "at-risk" : "behind",
          color: GRN,
        },
        {
          id: "inv", year: "Year 2", label: "Investment Portfolio",
          detail: `${fmt(investPortTarget)} invested across ETF + TFSA`,
          yours: invest * 12, target: investPortTarget,
          hint: invest > 0 ? `At ${fmt(invest)}/month you'll reach ${fmt(investPortTarget)} in ~${Math.ceil(investPortTarget / invest)} months` : "Start monthly investments to hit this milestone",
          status: invest >= salary * 0.15 ? "on-track" : invest > 0 ? "at-risk" : "behind",
          color: GRN,
        },
        {
          id: "bal", year: "Year 3", label: "Balanced Budget Locked",
          detail: "15% invest + lifestyle budget automated",
          yours: savingsRate, target: 15,
          hint: savingsRate >= 15 ? `✓ Saving ${savingsRate.toFixed(1)}% — on track` : `Currently ${savingsRate.toFixed(1)}% — increase by ${fmt((15 - savingsRate) / 100 * salary)}/month`,
          status: savingsRate >= 15 ? "on-track" : savingsRate >= 10 ? "at-risk" : "behind",
          color: AMB,
        },
        {
          id: "200", year: "Year 5", label: `${fmt(investPortTarget * 2)} Portfolio`,
          detail: "Diversified milestone reached",
          yours: invest * 24, target: investPortTarget * 2,
          hint: invest > 0 ? `Projecting ${fmt(invest * 24)} in contributions alone over 24 months` : "Set a monthly investment amount to project this",
          status: invest >= salary * 0.2 ? "on-track" : invest > 0 ? "at-risk" : "behind",
          color: BLU,
        },
      ],
      prioritises: [
        `Automate ${fmt(invest || Math.round(salary * 0.15))}/month on salary day`,
        `15–20% savings rate — you're currently at ${savingsRate.toFixed(1)}%`,
        "Retirement Annuity from age 25–30 — compound growth is irreplaceable",
        `Lifestyle budget: ${fmt(Math.max(0, net * 0.3))} guilt-free per month`,
        "ETF portfolio building (Satrix, EasyEquities, Sygnia)",
      ],
      avoids: [
        "Over-saving to the point of burnout and abandoning the plan",
        "Neglecting retirement contributions in your 20s",
        "Lifestyle debt — personal loans for holidays or furniture",
        "Comparing your journey to others online",
      ],
      tradeoffs: [
        { pro: "Sustainable — you're less likely to abandon it", con: "Slower accumulation than aggressive savers" },
        { pro: "Quality of life preserved throughout", con: "Lifestyle spending can creep up over time" },
        { pro: "Diversified (RA + TFSA + ETFs)", con: "RA locked until 55 — reduced liquidity" },
        { pro: "Flexibility to adjust allocations", con: "Requires discipline not to raid investments" },
      ],
      warnings: [
        "Lifestyle creep is the silent wealth killer — reassess every 6 months",
        "Not contributing to a retirement fund in your 20s costs decades of compound growth",
        "Define your lifestyle budget in rand — not percentages — so it stays fixed as income grows",
        "Emergency fund first — without it, investments get liquidated at the worst times",
      ],
      stats: [
        { label: "Invest target",   value: "20%" },
        { label: "Lifestyle cap",   value: fmt(Math.round(net * 0.3)) },
        { label: "RA contribution", value: "10%" },
      ],
      example: {
        name: "Lerato, 29 · Marketing manager · Cape Town",
        salary: 45000,
        strategy: "Lerato has a R9 000 lifestyle budget for restaurants, travel, and personal spending. She automates R7 000/month into her ETF and R3 500 into her RA on the 1st. Portfolio hit R68 000 in Year 2. She still takes two international trips a year.",
      },
    },
    {
      id: "global",
      name: "Global Investor",
      tagline: "Build wealth across international markets",
      color: BLU,
      description: "For tech professionals and globally mobile workers who understand that rand weakness is a permanent feature of the SA economy. Prioritises offshore ETF exposure, currency diversification, and a portfolio that performs regardless of local conditions.",
      why: "The rand has lost over 70% of its value against the dollar in 20 years. A portfolio entirely in SA assets suffers this in purchasing power. Even 30–40% offshore exposure protects wealth and gives access to the world's best companies — Apple, Microsoft, NVIDIA, and thousands more.",
      readiness: [
        { label: "Emergency fund",     yours: emergency,   target: efTarget,     unit: "rand", goodIfAbove: true },
        { label: "Monthly investment", yours: invest,      target: salary * 0.2,  unit: "rand", goodIfAbove: true },
        { label: "Savings rate",       yours: savingsRate, target: 20,           unit: "pct",  goodIfAbove: true },
        { label: "Debt-to-income",     yours: dti,         target: 25,           unit: "pct",  goodIfAbove: false },
        { label: "Offshore runway",    yours: savings,     target: globalPortTarget * 0.1, unit: "rand", goodIfAbove: true },
      ],
      milestones: [
        {
          id: "ef", year: "Year 1", label: "SA Foundation",
          detail: "Emergency fund + local ETF + RA started",
          yours: emergency, target: efTarget,
          hint: emergency >= efTarget ? `✓ ${fmt(emergency)} secured` : `${fmt(emergency)} of ${fmt(efTarget)} — ${fmt(efTarget - emergency)} to go`,
          status: emergency >= efTarget ? "on-track" : emergency >= efTarget * 0.5 ? "at-risk" : "behind",
          color: GRN,
        },
        {
          id: "off", year: "Year 2", label: "First Offshore Investment",
          detail: "Open offshore account via EasyEquities USD or Sygnia Itrix",
          yours: invest * 6, target: invest * 6,
          hint: invest > 0 ? `${fmt(invest)}/month → open offshore once local base is set` : "Set a monthly investment to begin offshore journey",
          status: invest >= salary * 0.1 ? "on-track" : invest > 0 ? "at-risk" : "behind",
          color: BLU,
        },
        {
          id: "div", year: "Year 3", label: "Diversified Portfolio",
          detail: "30–40% offshore allocation reached",
          yours: invest * 12, target: globalPortTarget * 0.5,
          hint: invest > 0 ? `At ${fmt(invest)}/month you'll reach ${fmt(invest * 18)} by Year 1.5` : "Start investing to model this milestone",
          status: invest >= salary * 0.2 ? "on-track" : invest > 0 ? "at-risk" : "behind",
          color: AMB,
        },
        {
          id: "500", year: "Year 5", label: `${fmt(globalPortTarget)} Portfolio`,
          detail: "Global diversified portfolio milestone",
          yours: invest * 24, target: globalPortTarget,
          hint: invest > 0 ? `${fmt(invest)}/month over 5 years = ${fmt(invest * 60)} contributions` : "Set investment amount to project this",
          status: invest * 60 >= globalPortTarget ? "on-track" : invest * 60 >= globalPortTarget * 0.5 ? "at-risk" : "behind",
          color: BLU,
        },
      ],
      prioritises: [
        "Offshore ETF allocation (S&P 500, MSCI World, Nasdaq 100)",
        "Using your R1M Single Discretionary Allowance annually",
        "Global portfolio diversification across currencies and markets",
        `Long-term horizon — your ${fmt(invest)}/month needs 10+ years to compound`,
        "Currency hedging — portfolio rises as rand weakens",
      ],
      avoids: [
        "Over-concentration in JSE-only assets",
        "Single stock speculation in high-risk markets",
        "Short-term trading based on news or market timing",
        "Ignoring SARS compliance for offshore investments",
      ],
      tradeoffs: [
        { pro: "Protection against rand depreciation", con: "Currency gains taxed as capital gains in SA" },
        { pro: "Access to world's top growth companies", con: "More complex to set up and manage" },
        { pro: "True portfolio diversification", con: "Forex conversion fees 0.5–2%" },
        { pro: "Higher long-term return potential", con: "Rand strength years create paper losses" },
      ],
      warnings: [
        "All offshore income must be declared to SARS — non-compliance penalties are severe",
        "Forex conversion costs 0.5–2% — factor this into return calculations",
        "Don't exceed R1M offshore without a SARS Tax Compliance Status certificate",
        "Rand appreciation years will make offshore look underperforming — stay the course",
      ],
      stats: [
        { label: "Offshore target",  value: "40%" },
        { label: "ETF focus",        value: "S&P 500" },
        { label: "5-yr projection",  value: fmt(invest * 60) },
      ],
      example: {
        name: "Kagiso, 31 · Senior engineer · Remote (USD salary)",
        salary: 80000,
        strategy: "Kagiso invests $500/month into VOO (S&P 500) and R8 000/month into Satrix MSCI World. Portfolio is 55% offshore. In Year 3, offshore value hit R280 000 despite rand strengthening 4%.",
      },
    },
  ];
}

// ── Readiness score from user data vs track requirements ─────────────────────
function calcReadiness(readinessItems) {
  if (!readinessItems?.length) return 0;
  let score = 0;
  readinessItems.forEach(item => {
    const p = item.target > 0 ? Math.min(item.yours / item.target, 1) : 1;
    score += item.goodIfAbove ? p : (1 - p);
  });
  return Math.round((score / readinessItems.length) * 100);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReadinessBanner({ track, user }) {
  const score = calcReadiness(track.readiness);
  const color = score >= 70 ? GRN : score >= 40 ? AMB : R;
  const label = score >= 70 ? "On track" : score >= 40 ? "Building momentum" : "Getting started";

  const salary  = Number(user.salary) || 0;
  const net     = netSalary(salary);
  const invest  = Number(user.investments) || 0;
  const dti     = salary > 0 ? ((Number(user.carFinance) + Number(user.studentLoan)) / salary * 100) : 0;
  const savRate = salary > 0 ? (invest / salary * 100) : 0;

  const chips = [
    { text: `Net income ${fmt(net)}/month`,              cls: "st-chip-blue" },
    { text: `Savings rate ${savRate.toFixed(1)}%`,        cls: savRate >= 15 ? "st-chip-green" : "st-chip-amber" },
    { text: `DTI ${dti.toFixed(1)}%`,                    cls: dti < 30 ? "st-chip-green" : "st-chip-red" },
    { text: `Readiness ${score}%`,                       cls: score >= 70 ? "st-chip-green" : score >= 40 ? "st-chip-amber" : "st-chip-red" },
  ].filter(Boolean);

  return (
    <div className="st-readiness">
      <div className="st-readiness-score">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
          <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${(score / 100) * 188.5} 188.5`}
            strokeLinecap="round" transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dasharray 1s ease .3s" }}
          />
          <text x="36" y="41" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{score}%</text>
        </svg>
      </div>
      <div className="st-readiness-text">
        <p className="st-readiness-title">
          {user.name ? `${user.name}'s readiness` : "Your readiness"} — {label}
        </p>
        <p className="st-readiness-sub">
          Based on your current salary of {fmt(salary)}, savings of {fmt(Number(user.savings) || 0)},
          and monthly investments of {fmt(invest)}.
        </p>
        <div className="st-readiness-chips">
          {chips.map((c, i) => <span key={i} className={`st-chip ${c.cls}`}>{c.text}</span>)}
        </div>
      </div>
    </div>
  );
}

function GapTable({ items }) {
  return (
    <div className="st-gap-table">
      {items.map((item, i) => {
        const isPct   = item.unit === "pct";
        const p       = item.target > 0 ? Math.min(100, Math.round((item.yours / item.target) * 100)) : 100;
        const isGood  = item.goodIfAbove ? item.yours >= item.target : item.yours <= item.target;
        const barPct  = item.goodIfAbove ? p : (100 - p);
        const barColor = isGood ? GRN : p > 60 ? AMB : R;

        return (
          <div key={i} className="st-gap-row">
            <div>
              <div className="st-gap-label">{item.label}</div>
              <div className="st-gap-note">{item.goodIfAbove ? `Target: ≥ ${isPct ? item.target + "%" : fmt(item.target)}` : `Target: ≤ ${isPct ? item.target + "%" : fmt(item.target)}`}</div>
            </div>
            <div className="st-gap-yours" style={{ color: isGood ? GRN : AMB }}>
              {isPct ? `${item.yours.toFixed(1)}%` : fmt(item.yours)}
            </div>
            <div className="st-gap-status">{isGood ? "✅" : p > 50 ? "⚠️" : "🔴"}</div>
            <div className="st-gap-bar-wrap">
              <div className="st-gap-bar-track">
                <div className="st-gap-bar-fill" style={{ width: `${Math.min(100, barPct)}%`, background: barColor }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Timeline({ milestones, doneSet, onToggle }) {
  return (
    <div className="st-timeline">
      {milestones.map((m, i) => {
        const done = doneSet.has(m.id);
        return (
          <div key={m.id} className={`st-tl-step ${done ? "done" : ""}`}>
            <div className="st-tl-connector">
              <button
                className="st-tl-dot"
                style={{ borderColor: done ? m.color : "rgba(255,255,255,0.2)", background: done ? m.color : "transparent" }}
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
              {m.hint && (
                <span className={`st-tl-you ${m.status}`}>{m.hint}</span>
              )}
              {done && <span className="st-tl-done-tag" style={{ color: m.color, display: "block", marginTop: 4 }}>✓ Marked complete</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
            <span className="st-tradeoff-icon" style={{ color: R }}>⚠</span>
            <span>{item.con}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectionBox({ user, track }) {
  const invest  = Number(user.investments) || 0;
  const savings = Number(user.savings)     || 0;
  const months  = [12, 24, 36, 60];
  const rate    = track.id === "global" ? 0.13 / 12 : 0.10 / 12;

  const project = (n) => {
    let p = savings;
    for (let i = 0; i < n; i++) p = (p + invest) * (1 + rate);
    return Math.round(p);
  };

  if (!invest && !savings) return null;

  return (
    <div className="st-projection-box">
      <p className="st-projection-title">Projected portfolio — {user.name || "you"}</p>
      {months.map(n => (
        <div key={n} className="st-projection-row">
          <span>{n === 12 ? "1 year" : n === 24 ? "2 years" : n === 36 ? "3 years" : "5 years"}</span>
          <span className="st-projection-val" style={{ color: track.color }}>{fmt(project(n))}</span>
        </div>
      ))}
      <div style={{ fontSize: 10, color: "rgba(240,235,232,0.25)", marginTop: 8 }}>
        Based on {fmt(invest)}/month + {fmt(savings)} lump sum at {track.id === "global" ? "13%" : "10%"}/year
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StrategyTracks() {
  const [selected,        setSelected]        = useState(null);
  const [mounted,         setMounted]         = useState(false);
  const [activeTab,       setActiveTab]       = useState("overview");
  const [milestoneStates, setMilestoneStates] = useState({});
  const { show } = useToast();

  const user   = useMemo(() => getUser(), []);
  const tracks = useMemo(() => buildTracks(user), [user]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 16);

    // Load milestone states
    const initial = {};
    tracks.forEach(t => {
      const saved = getMilestones(t.id);
      initial[t.id] = new Set(saved ?? []);
    });
    setMilestoneStates(initial);

    // Restore previously selected track
    const savedTrack = getSelectedTrack();
    if (savedTrack && tracks.find(t => t.id === savedTrack)) {
      setSelected(savedTrack);
    } else {
      // Auto-select from onboarding answer
      const raw = user.track || "";
      if (raw.toLowerCase().includes("property")) setSelected("property");
      else if (raw.toLowerCase().includes("balance") || raw.toLowerCase().includes("lifestyle")) setSelected("balanced");
      else if (raw.toLowerCase().includes("global")) setSelected("global");
    }
  }, []);

  const track    = tracks.find(t => t.id === selected);
  const doneSet  = track ? (milestoneStates[track.id] || new Set()) : new Set();
  const progress = track ? Math.round((doneSet.size / track.milestones.length) * 100) : 0;

  const handleSelect = (id) => {
    const next = selected === id ? null : id;
    setSelected(next);
    setActiveTab("overview");
    if (next) saveSelectedTrack(next);
  };

  const toggleMilestone = (id) => {
    if (!track) return;
    const current = new Set(milestoneStates[track.id] || []);
    const wasComplete = current.size === track.milestones.length;
    if (current.has(id)) current.delete(id);
    else {
      current.add(id);
      if (current.size === track.milestones.length && !wasComplete) {
        show(` All ${track.name} milestones complete!`, "success");
      }
    }
    const updated = { ...milestoneStates, [track.id]: current };
    setMilestoneStates(updated);
    saveMilestones(track.id, [...current]);
  };

  const tabs = ["overview", "milestones", "gap", "priorities", "tradeoffs", "education"];
  const tabLabels = { overview: "Overview", milestones: "Milestones", gap: "Your Numbers", priorities: "Priorities", tradeoffs: "Trade-offs", education: "Education" };

  return (
    <main className={`st-main ${mounted ? "st-in" : ""}`}>

      {/* ── HERO ── */}
      <div className="st-hero">
        <div>
          <p className="st-eyebrow">First Five Years</p>
          <h1 className="st-title">Strategy <span>Tracks</span></h1>
          <p className="st-subline">
            {user.name ? `Personalised for ${user.name} · ` : ""}
            Choose the financial path that matches your goals — progress saves automatically
          </p>
        </div>
        {selected && track && (
          <div className="st-score-wrap">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
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
          const tDone     = milestoneStates[t.id] || new Set();
          const tProgress = Math.round((tDone.size / t.milestones.length) * 100);
          const readiness = calcReadiness(t.readiness);
          return (
            <div
              key={t.id}
              className={`st-track-card ${selected === t.id ? "st-track-active" : ""}`}
              style={{ "--track-color": t.color }}
              onClick={() => handleSelect(t.id)}
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
              <div className="st-track-prog-bar">
                <div className="st-track-prog-fill" style={{ width: `${tProgress}%`, background: t.color }} />
              </div>
              <div className="st-track-prog-label" style={{ color: t.color }}>
                {tProgress}% milestones · {readiness}% readiness
              </div>
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

          {/* Personalised readiness banner */}
          <ReadinessBanner track={track} user={user} />

          <div className="st-detail-hero" style={{ borderLeft: `4px solid ${track.color}` }}>
            <h2 className="st-detail-title">{track.icon} {track.name}</h2>
            <p className="st-detail-desc">{track.description}</p>
          </div>

          {/* Tabs */}
          <div className="st-detail-tabs">
            {tabs.map(t => (
              <button key={t} className={`st-detail-tab ${activeTab === t ? "active" : ""}`}
                style={{ "--tc": track.color }} onClick={() => setActiveTab(t)}>
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">Track stats</p>
                  {track.stats.map(s => (
                    <div key={s.label} className="st-overview-stat">
                      <span className="st-overview-label">{s.label}</span>
                      <span className="st-overview-val" style={{ color: track.color }}>{s.value}</span>
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
                  <ProjectionBox user={user} track={track} />
                </div>
                <div className="st-card">
                  <p className="st-card-label">Real example</p>
                  <div className="st-example">
                    <p className="st-example-name">{track.example.name}</p>
                    <p className="st-example-income">Gross: {fmt(track.example.salary)}/month</p>
                    <p className="st-example-body">{track.example.strategy}</p>
                  </div>
                  <div className="st-card" style={{ marginTop: 14, padding: 14 }}>
                    <p className="st-card-label"> Know before you commit</p>
                    {track.warnings.map((w, i) => (
                      <div key={i} className="st-warning-row">
                        <span className="st-warning-dot" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MILESTONES ── */}
          {activeTab === "milestones" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">Timeline — click any milestone to mark complete</p>
                  <Timeline milestones={track.milestones} doneSet={doneSet} onToggle={toggleMilestone} />
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
                    <p className="st-ring-label">{doneSet.size} of {track.milestones.length} complete</p>
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

          {/* ── YOUR NUMBERS (gap analysis) ── */}
          {activeTab === "gap" && (
            <div className="st-detail-body st-fade">
              <div className="st-two-col">
                <div className="st-card">
                  <p className="st-card-label">Your numbers vs track targets</p>
                  <GapTable items={track.readiness} />
                </div>
                <div className="st-card">
                  <p className="st-card-label">Projected growth — {user.name || "your"} portfolio</p>
                  <ProjectionBox user={user} track={track} />
                  <div style={{ marginTop: 16, fontSize: 12, color: "rgba(240,235,232,0.35)", lineHeight: 1.6 }}>
                    Update your salary, investments, and savings on the{" "}
                    <strong style={{ color: "rgba(240,235,232,0.6)" }}>Money Snapshot → Edit</strong>{" "}
                    tab to recalculate these projections in real time.
                  </div>
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
                      <div className="st-priority-dot" style={{ background: R }} />
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
                <p className="st-card-label">Important warnings</p>
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
                  { tip: "Automate your savings on salary day so you never have the chance to spend it first." },
                  { tip: "Review your budget monthly — small adjustments early prevent big problems later." },
                  { tip: "A TFSA lets you invest R36 000/year tax-free. Max it before anything else." },
                  { tip: "ETFs are the lowest-cost way to invest — typical total expense ratio under 0.5%." },
                  { tip: "Your emergency fund should cover 3–6 months of expenses before investing aggressively." },
                  { tip: "Keeping credit utilisation below 30% significantly improves your credit score for bond approval." },
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
          <p>Select a track above to see your personalised milestones, gap analysis, and projections.</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>Progress saves automatically — come back anytime.</p>
        </div>
      )}
    </main>
  );
}