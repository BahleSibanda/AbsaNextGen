import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import "../styles/knowyourMoney.css";
 
const ABSA_RED  = "#C8102E";
const DARK_NAVY = "#0f1923";
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
 
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
 
const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");
 
/* ── Simulation 1: Property vs Renting ── */
function PropertySim() {
  const user = getUser();
  const [salary,       setSalary]       = useState(Number(user.salary) || 48000);
  const [propPrice,    setPropPrice]    = useState(1500000);
  const [deposit,      setDeposit]      = useState(Number(user.savings) || 150000);
  const [interest,     setInterest]     = useState(11.75);
  const [rent,         setRent]         = useState(Number(user.rent) || 12000);
  const [rentIncrease, setRentIncrease] = useState(8);
  const [investReturn, setInvestReturn] = useState(10);
  const [years,        setYears]        = useState(5);
 
  const { data, bond, winner } = useMemo(() => {
    const loan = propPrice - deposit;
    const mr = interest / 100 / 12;
    const months = 20 * 12;
    const bond = mr === 0 ? loan / months : (loan * mr * Math.pow(1+mr,months)) / (Math.pow(1+mr,months)-1);
 
    let propVal = propPrice, outstanding = loan;
    let investVal = deposit, currentRent = rent;
    const data = [{ year: "Now", "Buy: equity": Math.round(propVal - outstanding), "Rent: portfolio": Math.round(investVal) }];
 
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        const intPay = outstanding * mr;
        const prinPay = bond - intPay;
        outstanding -= prinPay;
        propVal *= 1 + 0.06/12;
        const diff = bond - currentRent;
        if (diff > 0) investVal += diff;
        investVal *= 1 + investReturn/100/12;
      }
      currentRent *= 1 + rentIncrease/100;
      data.push({ year: `Yr ${y}`, "Buy: equity": Math.round(propVal - Math.max(outstanding, 0)), "Rent: portfolio": Math.round(investVal) });
    }
 
    const buyFinal = data[data.length-1]["Buy: equity"];
    const rentFinal = data[data.length-1]["Rent: portfolio"];
    const winner = buyFinal > rentFinal * 1.05 ? "buy" : rentFinal > buyFinal * 1.05 ? "rent" : "tie";
    return { data, bond, winner };
  }, [propPrice, deposit, interest, rent, rentIncrease, investReturn, years]);
 
  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Property price" min={500000} max={5000000} step={50000} value={propPrice} onChange={setPropPrice} formatVal={fmt} />
        <Slider label="Deposit saved" min={50000} max={500000} step={10000} value={deposit} onChange={setDeposit} formatVal={fmt} />
        <Slider label="Interest rate (%)" min={8} max={15} step={0.25} value={interest} onChange={setInterest} formatVal={v => `${v}%`} />
        <Slider label="Monthly rent" min={5000} max={30000} step={500} value={rent} onChange={setRent} formatVal={fmt} />
        <Slider label="Annual rent increase (%)" min={3} max={15} step={0.5} value={rentIncrease} onChange={setRentIncrease} formatVal={v => `${v}%`} />
        <Slider label="Investment return (%)" min={5} max={18} step={0.5} value={investReturn} onChange={setInvestReturn} formatVal={v => `${v}%`} />
        <Slider label="Time horizon (years)" min={1} max={10} step={1} value={years} onChange={setYears} formatVal={v => `${v} yrs`} />
        <div className="sim-bond-box">
          <span>Estimated bond repayment</span>
          <strong>{fmt(bond)}/month</strong>
        </div>
      </div>
      <div className="sim-outputs">
        <div className="sim-result-row">
          <div className="sim-result-card" style={{ borderTop: `3px solid ${ABSA_RED}` }}>
            <p className="sim-result-label">Buy — equity after {years} yrs</p>
            <p className="sim-result-val" style={{ color: ABSA_RED }}>{fmt(data[data.length-1]["Buy: equity"])}</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: "3px solid #378ADD" }}>
            <p className="sim-result-label">Rent + invest — portfolio after {years} yrs</p>
            <p className="sim-result-val" style={{ color: "#378ADD" }}>{fmt(data[data.length-1]["Rent: portfolio"])}</p>
          </div>
        </div>
        <div className={`sim-verdict sim-verdict-${winner}`}>
          {winner === "buy"  && ` Buying wins over ${years} years by ${fmt(data[data.length-1]["Buy: equity"] - data[data.length-1]["Rent: portfolio"])}`}
          {winner === "rent" && ` Renting + investing wins by ${fmt(data[data.length-1]["Rent: portfolio"] - data[data.length-1]["Buy: equity"])}`}
          {winner === "tie"  && " Both paths deliver similar outcomes — lifestyle preference wins here"}
        </div>
        <div className="sim-chart-card">
          <p className="sim-chart-title">Wealth comparison over {years} years</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top:4, right:8, bottom:0, left:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0efeb" />
              <XAxis dataKey="year" tick={{ fontSize:11, fill:"#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v/1000)}k`} tick={{ fontSize:10, fill:"#bbb" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<DarkTip />} />
              <Legend wrapperStyle={{ fontSize:12, paddingTop:12 }} />
              <Line type="monotone" dataKey="Buy: equity" stroke={ABSA_RED} strokeWidth={2.5} dot={false} activeDot={{ r:4 }} />
              <Line type="monotone" dataKey="Rent: portfolio" stroke="#378ADD" strokeWidth={2.5} dot={false} activeDot={{ r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
 
/* ── Simulation 2: Car vs Invest ── */
function CarSim() {
  const user = getUser();
  const [carPrice,     setCarPrice]     = useState(450000);
  const [repayment,    setRepayment]    = useState(Number(user.carFinance) || 8000);
  const [term,         setTerm]         = useState(60);
  const [investReturn, setInvestReturn] = useState(10);
  const [years,        setYears]        = useState(5);
 
  const { data, oppCost } = useMemo(() => {
    let carVal = carPrice, investVal = 0;
    const data = [{ year: "Now", "Car value": carPrice, "Investment": 0 }];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        carVal *= 0.985;
        investVal = (investVal + repayment) * (1 + investReturn/100/12);
      }
      data.push({ year: `Yr ${y}`, "Car value": Math.round(carVal), "Investment": Math.round(investVal) });
    }
    const oppCost = data[data.length-1]["Investment"] - data[data.length-1]["Car value"];
    return { data, oppCost };
  }, [carPrice, repayment, investReturn, years]);
 
  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Car price" min={100000} max={1000000} step={25000} value={carPrice} onChange={setCarPrice} formatVal={fmt} />
        <Slider label="Monthly repayment" min={2000} max={20000} step={500} value={repayment} onChange={setRepayment} formatVal={fmt} />
        <Slider label="Finance term (months)" min={24} max={72} step={12} value={term} onChange={setTerm} formatVal={v => `${v} mo`} />
        <Slider label="Investment return (%)" min={5} max={18} step={0.5} value={investReturn} onChange={setInvestReturn} formatVal={v => `${v}%`} />
        <Slider label="Comparison period (years)" min={1} max={10} step={1} value={years} onChange={setYears} formatVal={v => `${v} yrs`} />
        <div className="sim-bond-box">
          <span>Total car cost over {Math.round(term/12)} yrs</span>
          <strong>{fmt(repayment * term)}</strong>
        </div>
      </div>
      <div className="sim-outputs">
        <div className="sim-result-row">
          <div className="sim-result-card" style={{ borderTop: `3px solid ${ABSA_RED}` }}>
            <p className="sim-result-label">Car value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: ABSA_RED }}>{fmt(data[data.length-1]["Car value"])}</p>
            <p className="sim-result-note">Cars depreciate ~18% per year</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: "3px solid #1D9E75" }}>
            <p className="sim-result-label">Investment value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: "#1D9E75" }}>{fmt(data[data.length-1]["Investment"])}</p>
            <p className="sim-result-note">Same monthly amount invested</p>
          </div>
        </div>
        <div className={`sim-verdict ${oppCost > 0 ? "sim-verdict-rent" : "sim-verdict-buy"}`}>
          {oppCost > 0
            ? ` Investing the repayment instead would leave you ${fmt(oppCost)} richer`
            : ` The car retains more value in this scenario`}
        </div>
        <div className="sim-chart-card">
          <p className="sim-chart-title">Car value vs investment growth</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top:4, right:8, bottom:0, left:8 }}>
              <defs>
                <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ABSA_RED} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={ABSA_RED} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0efeb" />
              <XAxis dataKey="year" tick={{ fontSize:11, fill:"#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v/1000)}k`} tick={{ fontSize:10, fill:"#bbb" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<DarkTip />} />
              <Legend wrapperStyle={{ fontSize:12, paddingTop:12 }} />
              <Area type="monotone" dataKey="Car value" stroke={ABSA_RED} fill="url(#carGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Investment" stroke="#1D9E75" fill="url(#invGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
 
/* ── Simulation 3: Investment Growth ── */
function InvestSim() {
  const user = getUser();
  const [monthly,      setMonthly]      = useState(Number(user.investments) || 4000);
  const [lumpSum,      setLumpSum]      = useState(Number(user.savings) || 20000);
  const [saAlloc,      setSaAlloc]      = useState(60);
  const [saReturn,     setSaReturn]     = useState(10);
  const [globalReturn, setGlobalReturn] = useState(13);
  const [years,        setYears]        = useState(5);
 
  const { data, final } = useMemo(() => {
    const offAlloc = 100 - saAlloc;
    const blendedRate = (saAlloc/100 * saReturn + offAlloc/100 * globalReturn) / 100 / 12;
    let total = lumpSum;
    const data = [{ year: "Now", "Portfolio": lumpSum }];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) { total = (total + monthly) * (1 + blendedRate); }
      data.push({ year: `Yr ${y}`, "Portfolio": Math.round(total) });
    }
    return { data, final: Math.round(total) };
  }, [monthly, lumpSum, saAlloc, saReturn, globalReturn, years]);
 
  const totalContributed = lumpSum + monthly * years * 12;
  const growth = final - totalContributed;
 
  return (
    <div className="sim-layout">
      <div className="sim-inputs">
        <p className="sim-inputs-title">Input variables</p>
        <Slider label="Monthly investment" min={500} max={20000} step={500} value={monthly} onChange={setMonthly} formatVal={fmt} />
        <Slider label="Starting lump sum" min={0} max={200000} step={5000} value={lumpSum} onChange={setLumpSum} formatVal={fmt} />
        <Slider label="SA allocation (%)" min={0} max={100} step={5} value={saAlloc} onChange={setSaAlloc} formatVal={v => `${v}% SA / ${100-v}% Global`} />
        <Slider label="SA market return (%)" min={5} max={18} step={0.5} value={saReturn} onChange={setSaReturn} formatVal={v => `${v}%`} />
        <Slider label="Global market return (%)" min={5} max={20} step={0.5} value={globalReturn} onChange={setGlobalReturn} formatVal={v => `${v}%`} />
        <Slider label="Time horizon (years)" min={1} max={20} step={1} value={years} onChange={setYears} formatVal={v => `${v} yrs`} />
      </div>
      <div className="sim-outputs">
        <div className="sim-result-row three">
          <div className="sim-result-card" style={{ borderTop: "3px solid #378ADD" }}>
            <p className="sim-result-label">Portfolio value after {years} yrs</p>
            <p className="sim-result-val" style={{ color: "#378ADD" }}>{fmt(final)}</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: "3px solid #EF9F27" }}>
            <p className="sim-result-label">Total contributed</p>
            <p className="sim-result-val" style={{ color: "#EF9F27" }}>{fmt(totalContributed)}</p>
          </div>
          <div className="sim-result-card" style={{ borderTop: "3px solid #1D9E75" }}>
            <p className="sim-result-label">Investment growth</p>
            <p className="sim-result-val" style={{ color: "#1D9E75" }}>{fmt(growth)}</p>
          </div>
        </div>
        <div className="sim-verdict sim-verdict-rent">
          🌱 Compound interest adds {fmt(growth)} on top of your {fmt(totalContributed)} contributed — that's {Math.round((growth/totalContributed)*100)}% extra
        </div>
        <div className="sim-chart-card">
          <p className="sim-chart-title">Portfolio growth over {years} years</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top:4, right:8, bottom:0, left:8 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#378ADD" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0efeb" />
              <XAxis dataKey="year" tick={{ fontSize:11, fill:"#bbb" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `R${Math.round(v/1000)}k`} tick={{ fontSize:10, fill:"#bbb" }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<DarkTip />} />
              <Area type="monotone" dataKey="Portfolio" stroke="#378ADD" fill="url(#portGrad)" strokeWidth={2.5} dot={false} activeDot={{ r:4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
 
const simulations = [
  { id: "property", icon: "", title: "Property vs Renting", desc: "Compare buying a home versus renting and investing the difference over time." },
  { id: "car",      icon: "", title: "Car vs Invest",       desc: "See how much wealth you give up by buying a luxury car instead of investing." },
  { id: "invest",   icon: "", title: "Investment Growth",   desc: "Model your portfolio growth with different allocations between SA and global markets." },
];
 
export default function KnowYourMoney() {
  const [active,   setActive]  = useState("property");
  const [mounted,  setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
 
  return (
    <main className={`sim-main ${mounted ? "sim-in" : ""}`}>
 
      <div className="sim-hero">
        <div>
          <p className="sim-eyebrow">Simulation Lab</p>
          <h1 className="sim-title">Know Your <span>Money</span></h1>
          <p className="sim-subline">Experiment with real financial scenarios and see your future outcomes</p>
        </div>
      </div>
 
      <div className="sim-picker">
        {simulations.map(s => (
          <div key={s.id} className={`sim-pick-card ${active === s.id ? "active" : ""}`} onClick={() => setActive(s.id)}>
            <span className="sim-pick-icon">{s.icon}</span>
            <div>
              <p className="sim-pick-title">{s.title}</p>
              <p className="sim-pick-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
 
      <div className="sim-body sim-fade">
        {active === "property" && <PropertySim />}
        {active === "car"      && <CarSim />}
        {active === "invest"   && <InvestSim />}
      </div>
 
    </main>
  );
}
 