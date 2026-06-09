import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import "../styles/knowyourMoney.css";

const ABSA_RED  = "#C8102E";
const GRN = "#1D9E75";
const AMB = "#EF9F27";
const BLU = "#378ADD";
const PUR = "#7C3AED";
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");

// ── Shared sub-components ─────────────────────────────────────────────────────
const DarkTip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="sim-tip">
    <div className="sim-tip-label">{label}</div>
    {payload.map((p, i) => (
      <div key={i} className="sim-tip-row">
        <div className="sim-tip-dot" style={{ background: p.color }} />
        <span>{p.name}: <strong>{fmt(p.value)}</strong></span>
      </div>
    ))}
  </div>
) : null;

function Slider({ label, min, max, step, value, onChange, formatVal }) {
  return (
    <div className="sim-field">
      <div className="sim-field-head">
        <label>{label}</label>
        <span className="sim-field-val">{formatVal ? formatVal(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} />
      <div className="sim-field-range">
        <span>{formatVal ? formatVal(min) : min}</span>
        <span>{formatVal ? formatVal(max) : max}</span>
      </div>
    </div>
  );
}

// Collapsible education section
function EduPanel({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sim-edu-panel">
      <button
        className="sim-edu-toggle"
        data-open={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="sim-edu-label-text">{title}</span>
        <span className="sim-edu-chevron">▼</span>
      </button>
      {open && <div className="sim-edu-body">{children}</div>}
    </div>
  );
}

function EduRow({ icon, label, text }) {
  return (
    <div className="sim-edu-row">
      <span className="sim-edu-icon">{icon}</span>
      <div>
        <p className="sim-edu-label">{label}</p>
        <p className="sim-edu-text">{text}</p>
      </div>
    </div>
  );
}

// Studio verdict card
function Verdict({ type, children }) {
  const cls = type === "buy" ? "sim-verdict-buy" : type === "invest" ? "sim-verdict-rent" : type === "warn" ? "sim-verdict-warn" : "sim-verdict-tie";
  return <div className={`sim-verdict ${cls}`}>{children}</div>;
}

// ── STUDIO 1: Property vs Renting ─────────────────────────────────────────────
function PropertySim() {
  const user = getUser();
  const [propPrice,    setPropPrice]    = useState(1500000);
  const [deposit,      setDeposit]      = useState(Number(user.savings) || 150000);
  const [interest,     setInterest]     = useState(11.75);
  const [rent,         setRent]         = useState(Number(user.rent) || 12000);
  const [rentIncrease, setRentIncrease] = useState(8);
  const [investReturn, setInvestReturn] = useState(10);
  const [years,        setYears]        = useState(5);
  const [propGrowth,   setPropGrowth]   = useState(6);

  const { data, bond, winner, transferDuty, regCosts, totalUpfront, finalBuy, finalRent } = useMemo(() => {
    const loan = propPrice - deposit;
    const mr   = interest / 100 / 12;
    const months = 20 * 12;
    const bond = mr === 0 ? loan / months : (loan * mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1);

    // SA transfer duty (2024 SARS table)
    let transferDuty = 0;
    if (propPrice > 1100000 && propPrice <= 1512500) transferDuty = (propPrice - 1100000) * 0.03;
    else if (propPrice > 1512500 && propPrice <= 2117500) transferDuty = 12375 + (propPrice - 1512500) * 0.06;
    else if (propPrice > 2117500 && propPrice <= 2722500) transferDuty = 48675 + (propPrice - 2117500) * 0.08;
    else if (propPrice > 2722500 && propPrice <= 12100000) transferDuty = 97475 + (propPrice - 2722500) * 0.11;
    else if (propPrice > 12100000) transferDuty = 1128600 + (propPrice - 12100000) * 0.13;

    const regCosts    = Math.round(propPrice * 0.018);   // ~1.8% bond registration
    const totalUpfront = deposit + Math.round(transferDuty) + regCosts;

    let propVal = propPrice, outstanding = loan;
    let investVal = deposit, currentRent = rent;
    const pg = propGrowth / 100 / 12;
    const data = [{ year: "Now", "Buy: equity": Math.round(propVal - outstanding), "Rent: portfolio": Math.round(investVal) }];

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        const intPay  = outstanding * mr;
        const prinPay = bond - intPay;
        outstanding  -= prinPay;
        propVal      *= 1 + pg;
        const diff    = bond - currentRent;
        if (diff > 0) investVal += diff;
        investVal *= 1 + investReturn / 100 / 12;
      }
      currentRent *= 1 + rentIncrease / 100;
      data.push({
        year: `Yr ${y}`,
        "Buy: equity":    Math.round(propVal - Math.max(outstanding, 0)),
        "Rent: portfolio": Math.round(investVal),
      });
    }

    const finalBuy  = data[data.length - 1]["Buy: equity"];
    const finalRent = data[data.length - 1]["Rent: portfolio"];
    const winner    = finalBuy > finalRent * 1.05 ? "buy" : finalRent > finalBuy * 1.05 ? "rent" : "tie";
    return { data, bond, winner, transferDuty: Math.round(transferDuty), regCosts, totalUpfront, finalBuy, finalRent };
  }, [propPrice, deposit, interest, rent, rentIncrease, investReturn, years, propGrowth]);

  const verdictMsg = winner === "buy"
    ? `🏆 Buying wins over ${years} years by ${fmt(finalBuy - finalRent)} — mainly driven by property growth at ${propGrowth}%/year and rising rent costs.`
    : winner === "rent"
      ? `🏆 Renting + investing wins by ${fmt(finalRent - finalBuy)} over ${years} years — your investment returns (${investReturn}%) outpace property appreciation.`
      : `⚖️ Both paths deliver similar outcomes over ${years} years (within 5% of each other). Choose based on lifestyle: stability vs flexibility.`;

  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Property price"          min={500000}  max={5000000} step={50000}  value={propPrice}    onChange={setPropPrice}    formatVal={fmt} />
        <Slider label="Deposit saved"           min={50000}   max={800000}  step={10000}  value={deposit}      onChange={setDeposit}      formatVal={fmt} />
        <Slider label="Interest rate (%)"       min={8}       max={15}      step={0.25}   value={interest}     onChange={setInterest}     formatVal={v => `${v}%`} />
        <Slider label="Property growth (%/yr)"  min={3}       max={12}      step={0.5}    value={propGrowth}   onChange={setPropGrowth}   formatVal={v => `${v}%`} />
        <Slider label="Monthly rent"            min={5000}    max={30000}   step={500}    value={rent}         onChange={setRent}         formatVal={fmt} />
        <Slider label="Annual rent increase (%)" min={3}      max={15}      step={0.5}    value={rentIncrease} onChange={setRentIncrease} formatVal={v => `${v}%`} />
        <Slider label="Investment return (%)"   min={5}       max={18}      step={0.5}    value={investReturn} onChange={setInvestReturn} formatVal={v => `${v}%`} />
        <Slider label="Time horizon (years)"    min={1}       max={10}      step={1}      value={years}        onChange={setYears}        formatVal={v => `${v} yrs`} />
        <div className="sim-bond-box">
          <span>Estimated bond repayment</span>
          <strong>{fmt(bond)}/month</strong>
        </div>
        <div className="sim-upfront-box">
          <p className="sim-upfront-title">Total upfront cash needed</p>
          <div className="sim-upfront-row"><span>Deposit</span><strong>{fmt(deposit)}</strong></div>
          <div className="sim-upfront-row"><span>Transfer duty (SARS)</span><strong>{fmt(transferDuty)}</strong></div>
          <div className="sim-upfront-row"><span>Bond registration (~1.8%)</span><strong>{fmt(regCosts)}</strong></div>
          <div className="sim-upfront-total"><span>Total</span><strong style={{ color: ABSA_RED }}>{fmt(totalUpfront)}</strong></div>
        </div>
      </div>

      <div className="sim-outputs">
        <div className="sim-result-row">
          <div className="sim-result-card" style={{ borderTop: `3px solid ${ABSA_RED}` }}>
            <p className="sim-result-label">Buy — equity after {years} yrs</p>
            <p className="sim-result-val" style={{ color: ABSA_RED }}>{fmt(finalBuy)}</p>
            <p className="sim-result-note">Property equity (value − outstanding loan)</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: `3px solid ${BLU}` }}>
            <p className="sim-result-label">Rent + invest — portfolio after {years} yrs</p>
            <p className="sim-result-val" style={{ color: BLU }}>{fmt(finalRent)}</p>
            <p className="sim-result-note">Investment portfolio value</p>
          </div>
        </div>

        <Verdict type={winner === "buy" ? "buy" : winner === "rent" ? "invest" : "tie"}>
          {verdictMsg}
        </Verdict>

        <div className="sim-chart-card">
          <p className="sim-chart-title">Wealth comparison over {years} years</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v / 1000)}k`} tick={{ fontSize: 10, fill: "#bbb" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<DarkTip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line type="monotone" dataKey="Buy: equity"     stroke={ABSA_RED} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Rent: portfolio" stroke={BLU}      strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <EduPanel title="How this simulation works — assumptions and methodology">
          <EduRow label="Bond calculation" text="Uses a 20-year amortisation schedule. Monthly payment = (loan × rate × (1+rate)^n) / ((1+rate)^n - 1). Interest portion decreases monthly as principal is paid down." />
          <EduRow label="Transfer duty" text="Based on 2024 SARS table. Properties under R1.1M are exempt (first-time buyer benefit). Above this, duty ranges from 3% to 13% of purchase price." />
          <EduRow label="Bond registration" text="Approximately 1.8% of loan value covers bond registration attorney fees, deeds office charges, and VAT. This cash is needed upfront — it cannot be included in the bond." />
          <EduRow label="Property growth" text="SA residential property has averaged 6–8% annual capital appreciation over the long term, though this varies significantly by area. Cape Town Waterfront vs North West province are completely different markets." />
          <EduRow label="The real comparison" text="When renting, the assumption is you invest the difference between bond repayment and rent (plus your deposit) in the market. This is the true opportunity cost of buying." />
        </EduPanel>
      </div>
    </div>
  );
}

// ── STUDIO 2: Car vs Invest ────────────────────────────────────────────────────
function CarSim() {
  const user = getUser();
  const [carPrice,     setCarPrice]     = useState(450000);
  const [repayment,    setRepayment]    = useState(Number(user.carFinance) || 8000);
  const [balloonPct,   setBalloonPct]   = useState(20);
  const [term,         setTerm]         = useState(60);
  const [investReturn, setInvestReturn] = useState(10);
  const [depreciation, setDepreciation] = useState(15);
  const [years,        setYears]        = useState(5);

  const { data, oppCost, carFinalVal, investFinalVal, winner } = useMemo(() => {
    let carVal = carPrice, investVal = 0;
    const depRate = 1 - Math.pow(1 - depreciation / 100, 1 / 12);
    const data = [{ year: "Now", "Car value": carPrice, "Investment": 0 }];

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        carVal  *= (1 - depRate);
        investVal = (investVal + repayment) * (1 + investReturn / 100 / 12);
      }
      data.push({ year: `Yr ${y}`, "Car value": Math.round(carVal), "Investment": Math.round(investVal) });
    }

    const carFinalVal   = Math.round(carVal);
    const investFinalVal = Math.round(investVal);
    const oppCost       = investFinalVal - carFinalVal;
    const winner        = oppCost > 0 ? "invest" : "car";
    return { data, oppCost, carFinalVal, investFinalVal, winner };
  }, [carPrice, repayment, term, investReturn, depreciation, years]);

  const totalPaid   = repayment * years * 12;
  const balloonAmt  = carPrice * (balloonPct / 100);

  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Vehicle price"           min={100000} max={1500000} step={10000} value={carPrice}     onChange={setCarPrice}     formatVal={fmt} />
        <Slider label="Monthly repayment"       min={2000}   max={25000}   step={500}   value={repayment}    onChange={setRepayment}    formatVal={fmt} />
        <Slider label="Balloon payment (%)"     min={0}      max={35}      step={5}     value={balloonPct}   onChange={setBalloonPct}   formatVal={v => `${v}%`} />
        <Slider label="Annual depreciation (%)" min={8}      max={25}      step={1}     value={depreciation} onChange={setDepreciation} formatVal={v => `${v}%`} />
        <Slider label="Investment return (%)"   min={5}      max={18}      step={0.5}   value={investReturn} onChange={setInvestReturn} formatVal={v => `${v}%`} />
        <Slider label="Time horizon (years)"    min={1}      max={10}      step={1}     value={years}        onChange={setYears}        formatVal={v => `${v} yrs`} />
        <div className="sim-bond-box">
          <span>Balloon payment due (end of term)</span>
          <strong style={{ color: AMB }}>{fmt(balloonAmt)}</strong>
        </div>
        <div className="sim-bond-box">
          <span>Total paid over {years} yrs</span>
          <strong style={{ color: ABSA_RED }}>{fmt(totalPaid)}</strong>
        </div>
      </div>

      <div className="sim-outputs">
        <div className="sim-result-row">
          <div className="sim-result-card" style={{ borderTop: `3px solid ${ABSA_RED}` }}>
            <p className="sim-result-label">Car value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: ABSA_RED }}>{fmt(carFinalVal)}</p>
            <p className="sim-result-note">{depreciation}% annual depreciation</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: `3px solid ${GRN}` }}>
            <p className="sim-result-label">Investment value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: GRN }}>{fmt(investFinalVal)}</p>
            <p className="sim-result-note">{fmt(repayment)}/month invested at {investReturn}%</p>
          </div>
        </div>

        <Verdict type={winner === "invest" ? "invest" : "tie"}>
          {winner === "invest"
            ? `Investing the ${fmt(repayment)}/month instead builds ${fmt(oppCost)} more wealth over ${years} years than owning this vehicle (after depreciation).`
            : ` In this scenario the vehicle retains relatively more value — but remember to factor in insurance, fuel, and maintenance costs not modelled here.`}
        </Verdict>

        <div className="sim-result-card" style={{ borderTop: `3px solid ${AMB}`, gridColumn: "span 2" }}>
          <p className="sim-result-label">Opportunity cost of vehicle ownership</p>
          <p className="sim-result-val" style={{ color: AMB }}>{fmt(Math.abs(oppCost))}</p>
          <p className="sim-result-note">What you give up in wealth-building by choosing the vehicle over investing</p>
        </div>

        <div className="sim-chart-card">
          <p className="sim-chart-title">Car value vs investment growth over {years} years</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ABSA_RED} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={ABSA_RED} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRN} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={GRN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v / 1000)}k`} tick={{ fontSize: 10, fill: "#bbb" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<DarkTip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="Car value"  stroke={ABSA_RED} fill="url(#carGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Investment" stroke={GRN}      fill="url(#invGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <EduPanel title="Understanding vehicle financing in South Africa">
          <EduRow  label="How SA vehicle finance works" text="Most dealerships offer 72-month finance (6 years). A balloon payment (typically 20–30% of vehicle value) is due at term end — this is NOT included in monthly repayments and requires cash or a new finance agreement." />
          <EduRow  label="Depreciation reality" text="New vehicles lose 15–20% of value in Year 1 alone. After 5 years, most vehicles are worth 35–50% of purchase price. Luxury brands often depreciate faster." />
          <EduRow  label="The 10/20 rule" text="Financial advisors suggest your total vehicle costs (repayment, insurance, fuel, maintenance) should not exceed 20% of take-home pay. In SA, the average exceeds this significantly." />
          <EduRow  label="Hidden costs not modelled" text="This simulation excludes insurance (R800–R3 000/month), fuel (R1 500–R4 000/month), and maintenance. These add 40–60% to your true vehicle cost." />
        </EduPanel>
      </div>
    </div>
  );
}

// ── STUDIO 3: Investment Growth ────────────────────────────────────────────────
function InvestSim() {
  const user = getUser();
  const [monthly,      setMonthly]      = useState(Number(user.investments) || 4000);
  const [lumpSum,      setLumpSum]      = useState(Number(user.savings) || 20000);
  const [saAlloc,      setSaAlloc]      = useState(60);
  const [saReturn,     setSaReturn]     = useState(10);
  const [globalReturn, setGlobalReturn] = useState(13);
  const [years,        setYears]        = useState(5);
  const [tfsa,         setTfsa]         = useState(true);

  const { data, final, tfsaSaving } = useMemo(() => {
    const offAlloc    = 100 - saAlloc;
    const blendedRate = (saAlloc / 100 * saReturn + offAlloc / 100 * globalReturn) / 100 / 12;
    let total = lumpSum;
    const taxRate     = 0.18; // simplified CGT / dividends tax estimate
    const data = [{ year: "Now", "Portfolio": lumpSum }];

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        total = (total + monthly) * (1 + blendedRate);
      }
      data.push({ year: `Yr ${y}`, "Portfolio": Math.round(total) });
    }

    const totalContributed = lumpSum + monthly * years * 12;
    const growth    = total - totalContributed;
    const tfsaSaving = tfsa ? Math.round(growth * taxRate) : 0;

    return { data, final: Math.round(total), tfsaSaving };
  }, [monthly, lumpSum, saAlloc, saReturn, globalReturn, years, tfsa]);

  const totalContributed = lumpSum + monthly * years * 12;
  const growth = final - totalContributed;

  const verdictRating = growth / totalContributed;
  const verdictMsg = verdictRating > 0.5
    ? ` Exceptional — compound growth adds ${fmt(growth)} on top of your ${fmt(totalContributed)} contributed (${Math.round(verdictRating * 100)}% extra). Continue increasing monthly contributions as salary grows.`
    : verdictRating > 0.2
      ? `Solid progress — ${fmt(growth)} in investment growth over ${years} years. Consider increasing monthly contributions by 1% of salary annually.`
      : ` Limited compound growth at this horizon. Compound interest is most powerful beyond 10 years — stay consistent and extend your timeline.`;

  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Monthly investment"     min={500}   max={20000}  step={500}  value={monthly}      onChange={setMonthly}      formatVal={fmt} />
        <Slider label="Starting lump sum"      min={0}     max={200000} step={5000} value={lumpSum}      onChange={setLumpSum}      formatVal={fmt} />
        <Slider label="SA allocation (%)"      min={0}     max={100}    step={5}    value={saAlloc}      onChange={setSaAlloc}      formatVal={v => `${v}% SA / ${100 - v}% Global`} />
        <Slider label="SA market return (%)"   min={5}     max={18}     step={0.5}  value={saReturn}     onChange={setSaReturn}     formatVal={v => `${v}%`} />
        <Slider label="Global market return (%)" min={5}  max={20}     step={0.5}  value={globalReturn} onChange={setGlobalReturn} formatVal={v => `${v}%`} />
        <Slider label="Time horizon (years)"   min={1}    max={20}     step={1}    value={years}        onChange={setYears}        formatVal={v => `${v} yrs`} />
        <div className="sim-toggle-field">
          <span>Using TFSA (tax-free account)?</span>
          <button className={`sim-toggle-btn ${tfsa ? "on" : ""}`} onClick={() => setTfsa(v => !v)}>
            {tfsa ? "Yes — tax-free ✓" : "No — taxable account"}
          </button>
        </div>
        {tfsa && (
          <div className="sim-bond-box">
            <span>Estimated tax saving (TFSA)</span>
            <strong style={{ color: GRN }}>+{fmt(tfsaSaving)}</strong>
          </div>
        )}
      </div>

      <div className="sim-outputs">
        <div className="sim-result-row three">
          <div className="sim-result-card" style={{ borderTop: `3px solid ${BLU}` }}>
            <p className="sim-result-label">Portfolio value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: BLU }}>{fmt(final)}</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: `3px solid ${AMB}` }}>
            <p className="sim-result-label">Total contributed</p>
            <p className="sim-result-val" style={{ color: AMB }}>{fmt(totalContributed)}</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: `3px solid ${GRN}` }}>
            <p className="sim-result-label">Compound growth</p>
            <p className="sim-result-val" style={{ color: GRN }}>{fmt(growth)}</p>
            <p className="sim-result-note">{Math.round((growth / totalContributed) * 100)}% return on contributions</p>
          </div>
        </div>

        <Verdict type="invest">{verdictMsg}</Verdict>

        <div className="sim-chart-card">
          <p className="sim-chart-title">Portfolio growth over {years} years</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLU} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BLU} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v / 1000)}k`} tick={{ fontSize: 10, fill: "#bbb" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<DarkTip />} />
              <Area type="monotone" dataKey="Portfolio" stroke={BLU} fill="url(#portGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <EduPanel title="How this simulation works — methodology and SA context">
          <EduRow label="Compound interest formula" text="Each month: portfolio × (1 + monthly rate) + contribution. This is the standard future value of a growing annuity. The blended rate uses your SA/Global allocation to weight returns." />
          <EduRow label="SA market returns" text="JSE All Share Index has returned ~10–11% annually over 30 years in nominal terms (6–7% real after inflation). Periods of underperformance (2015–2019) are common — diversification helps." />
          <EduRow label="Global market returns" text="S&P 500 has returned ~13% annually in rand terms over 20 years — boosted by USD appreciation. This can't be assumed to continue, but offshore allocation remains important for SA investors." />
          <EduRow label="TFSA tax benefit" text="Inside a TFSA, dividends (normally 20% tax) and capital gains (normally 18% effective rate) are completely tax-free. Over 20 years at R36k/year, this can add R200k+ to your outcome." />
          <EduRow label="Inflation note" text="All values are nominal (before inflation). Real returns = nominal - inflation (SA inflation ~5%). A portfolio showing R200k in 5 years is worth ~R157k in today's purchasing power." />
        </EduPanel>
      </div>
    </div>
  );
}

// ── STUDIO 4: TFSA Maximiser ──────────────────────────────────────────────────
function TfsaSim() {
  const user = getUser();
  const [annual,      setAnnual]      = useState(36000);
  const [lumpSum,     setLumpSum]     = useState(Number(user.savings) || 10000);
  const [returnRate,  setReturnRate]  = useState(10);
  const [years,       setYears]       = useState(10);
  const [startAge,    setStartAge]    = useState(27);

  const LIFETIME_LIMIT = 500000;
  const ANNUAL_LIMIT   = 36000;

  const { data, final, taxSaving, yearsToLimit, contributed } = useMemo(() => {
    let portfolio = lumpSum, totalContrib = Math.min(lumpSum, LIFETIME_LIMIT);
    let taxablePortfolio = lumpSum;
    const TAX = 0.18;
    const monthlyRate = returnRate / 100 / 12;
    const monthly = annual / 12;

    const data = [{ year: "Now", "TFSA (tax-free)": lumpSum, "Taxable account": lumpSum }];
    let yearsToLimit = null;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        const canContrib = Math.min(monthly, Math.max(0, LIFETIME_LIMIT - totalContrib));
        portfolio        = (portfolio + canContrib) * (1 + monthlyRate);
        totalContrib    += canContrib;
        // Taxable equivalent: same contributions but returns taxed
        taxablePortfolio = (taxablePortfolio + canContrib) * (1 + monthlyRate * (1 - TAX));
      }
      if (!yearsToLimit && totalContrib >= LIFETIME_LIMIT) yearsToLimit = y;
      data.push({
        year: `Yr ${y}`,
        "TFSA (tax-free)":  Math.round(portfolio),
        "Taxable account":  Math.round(taxablePortfolio),
      });
    }

    const taxSaving = portfolio - taxablePortfolio;
    return { data, final: Math.round(portfolio), taxSaving: Math.round(taxSaving), yearsToLimit, contributed: Math.round(totalContrib) };
  }, [annual, lumpSum, returnRate, years, startAge]);

  const retirementAge = startAge + years;
  const overLimit = annual > ANNUAL_LIMIT;

  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Annual contribution"      min={5000}  max={36000} step={1000} value={annual}     onChange={setAnnual}     formatVal={fmt} />
        <Slider label="Starting lump sum"        min={0}     max={100000} step={5000} value={lumpSum}   onChange={setLumpSum}    formatVal={fmt} />
        <Slider label="Expected return (%/yr)"   min={5}     max={20}    step={0.5}  value={returnRate} onChange={setReturnRate} formatVal={v => `${v}%`} />
        <Slider label="Investment horizon (yrs)" min={3}     max={20}    step={1}    value={years}      onChange={setYears}      formatVal={v => `${v} yrs`} />
        <Slider label="Your current age"         min={18}    max={50}    step={1}    value={startAge}   onChange={setStartAge}   formatVal={v => `Age ${v}`} />

        {overLimit && (
          <div className="sim-warn-box">
            ⚠️ SARS annual limit is R36 000. Exceeding this attracts a 40% penalty on the excess. Set to R36 000 to maximise benefit.
          </div>
        )}
        <div className="sim-bond-box">
          <span>Lifetime limit remaining</span>
          <strong style={{ color: contributed >= LIFETIME_LIMIT ? ABSA_RED : GRN }}>
            {fmt(Math.max(0, LIFETIME_LIMIT - contributed))}
          </strong>
        </div>
        <div className="sim-bond-box">
          <span>You'll be age {retirementAge} at year {years}</span>
          <strong>{yearsToLimit ? `Limit hit in Year ${yearsToLimit}` : "Limit not reached"}</strong>
        </div>
      </div>

      <div className="sim-outputs">
        <div className="sim-result-row three">
          <div className="sim-result-card" style={{ borderTop: `3px solid ${GRN}` }}>
            <p className="sim-result-label">TFSA value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: GRN }}>{fmt(final)}</p>
            <p className="sim-result-note">100% tax-free</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: `3px solid ${AMB}` }}>
            <p className="sim-result-label">Total contributed</p>
            <p className="sim-result-val" style={{ color: AMB }}>{fmt(contributed)}</p>
            <p className="sim-result-note">Of R500k lifetime limit</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: `3px solid ${PUR}` }}>
            <p className="sim-result-label">Tax saving vs taxable account</p>
            <p className="sim-result-val" style={{ color: PUR }}>{fmt(taxSaving)}</p>
            <p className="sim-result-note">Estimated tax benefit</p>
          </div>
        </div>

        <Verdict type="invest">
          {taxSaving > 50000
            ? ` Excellent — your TFSA saves you ${fmt(taxSaving)} in tax compared to a standard account over ${years} years. Start as early as possible; every year earlier multiplies the benefit.`
            : taxSaving > 10000
              ? ` Solid tax benefit of ${fmt(taxSaving)} over ${years} years. Maximise your annual R36k contribution to compound this benefit further.`
              : ` Smaller benefit at this horizon. The TFSA is most powerful over 15+ years — commit to keeping contributions in for the long term.`}
        </Verdict>

        <div className="sim-chart-card">
          <p className="sim-chart-title">TFSA vs taxable account — tax impact over time</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="tfsaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GRN} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={GRN} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AMB} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={AMB} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v / 1000)}k`} tick={{ fontSize: 10, fill: "#bbb" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<DarkTip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="TFSA (tax-free)"  stroke={GRN} fill="url(#tfsaGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="Taxable account"  stroke={AMB} fill="url(#taxGrad)"  strokeWidth={2}   dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <EduPanel title="TFSA rules, limits, and SA tax context">
          <EduRow icon="📋" label="Annual contribution limit" text="R36 000 per tax year (1 March – 28 February). This cannot be rolled over. If you contribute R20k one year, you cannot 'catch up' with R52k the next." />
          <EduRow icon="🏦" label="Lifetime limit" text="R500 000 total lifetime contributions. Exceeding either limit triggers a 40% SARS penalty on the excess amount — not just the return, but the full excess contribution." />
          <EduRow icon="💸" label="Withdrawals" text="You can withdraw at any time, but withdrawn amounts do NOT restore your contribution room. Withdraw R50k today, you permanently lose R50k of lifetime limit." />
          <EduRow icon="📈" label="Best investments inside TFSA" text="ETFs (equity) generate the highest long-term returns and benefit most from tax-free compounding. Cash in a TFSA earns interest tax-free but at lower rates." />
          <EduRow icon="🏛️" label="Where to open a TFSA" text="EasyEquities (lowest fees), Sygnia, Allan Gray, Old Mutual, Absa. Compare TER (Total Expense Ratio) — even 0.5% difference compounded over 20 years is meaningful." />
        </EduPanel>
      </div>
    </div>
  );
}

// ── Studio registry ───────────────────────────────────────────────────────────
// Images are sourced from Unsplash (free, no auth needed).
// Swap the `img` URLs for local assets if you have them.
const simulations = [
  {
    id: "property",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=420&q=80&auto=format&fit=crop",
    accentColor: "#C8102E",
    label: "Studio 01",
    title: "Property vs Renting",
    desc: "Full SA bond costs, transfer duty, and deposit modelling over 10 years.",
  },
  {
    id: "car",
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=420&q=80&auto=format&fit=crop",
    accentColor: "#EF9F27",
    label: "Studio 02",
    title: "Car vs Invest",
    desc: "Balloon payments, depreciation curves, and the true opportunity cost of vehicle ownership.",
  },
  {
    id: "invest",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=420&q=80&auto=format&fit=crop",
    accentColor: "#378ADD",
    label: "Studio 03",
    title: "Investment Growth",
    desc: "SA/global allocation, compound projections, and TFSA tax benefit modelling.",
  },
  {
    id: "tfsa",
    img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=420&q=80&auto=format&fit=crop",
    accentColor: "#1D9E75",
    label: "Studio 04",
    title: "TFSA Maximiser",
    desc: "Lifetime limit tracking and exact rand tax saving vs a standard taxable account.",
  },
];

// ── Main export ───────────────────────────────────────────────────────────────
export default function KnowYourMoney() {
  const [active,  setActive]  = useState("property");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <main className={`sim-main ${mounted ? "sim-in" : ""}`}>
      <div className="sim-hero">
        <div>
          <p className="sim-eyebrow">Simulation Lab</p>
          <h1 className="sim-title">Know Your <span>Money</span></h1>
          <p className="sim-subline">4 studios — real SA costs, real tax implications, real compound growth</p>
        </div>
      </div>

      <div className="sim-picker">
        {simulations.map(s => (
          <div
            key={s.id}
            className={`sim-pick-card ${active === s.id ? "active" : ""}`}
            style={{ "--card-accent": s.accentColor }}
            onClick={() => setActive(s.id)}
          >
            {/* Background image — fades right into card bg colour */}
            <div
              className="sim-pick-img"
              style={{ backgroundImage: `url(${s.img})` }}
            />
            {/* Gradient overlay: image → card colour, left to right */}
            <div className="sim-pick-fade" />

            {/* Text content sits above both layers */}
            <div className="sim-pick-body">
              <span className="sim-pick-label" style={{ color: s.accentColor }}>{s.label}</span>
              <p className="sim-pick-title">{s.title}</p>
              <p className="sim-pick-desc">{s.desc}</p>
              {active === s.id && (
                <span className="sim-pick-active-dot" style={{ background: s.accentColor }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sim-body sim-fade">
        {active === "property" && <PropertySim />}
        {active === "car"      && <CarSim />}
        {active === "invest"   && <InvestSim />}
        {active === "tfsa"     && <TfsaSim />}
      </div>
    </main>
  );
}