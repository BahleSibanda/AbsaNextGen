import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import "../styles/moneySnapshot.css";
import heroPlaceholder from "../assets/hero-placeholder.jpg";
 
const R   = "#C8102E";
const GRN = "#1D9E75";
const BLU = "#2563EB";
const AMB = "#EF9F27";
const PUR = "#7C3AED";
 
const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct  = (c, t) => Math.round((c / t) * 100);
 
const wealthHistory = [
  { m:"Nov", v:28000 },{ m:"Dec", v:31000 },{ m:"Jan", v:34500 },
  { m:"Feb", v:38000 },{ m:"Mar", v:42000 },{ m:"Apr", v:47200 },
];
 
function CountUp({ end, pre="R", suf="", dur=1000 }) {
  const [v,setV]=useState(0); const raf=useRef(); const t0=useRef();
  useEffect(()=>{
    t0.current = null;
    const step=ts=>{
      if(!t0.current) t0.current=ts;
      const p=Math.min((ts-t0.current)/dur,1);
      setV(Math.round((1-Math.pow(1-p,3))*end));
      if(p<1) raf.current=requestAnimationFrame(step);
    };
    raf.current=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(raf.current);
  },[end,dur]);
  return <>{pre}{v.toLocaleString("en-ZA")}{suf}</>;
}
 
function GoalBar({ name, current, target, color, icon, delay=0 }) {
  const [w,setW]=useState(0); const p=pct(current,target);
  useEffect(()=>{ const t=setTimeout(()=>setW(p),delay+300); return ()=>clearTimeout(t); },[p,delay]);
  return (
    <div className="ms-goal">
      <div className="ms-goal-row">
        <span className="ms-goal-icon">{icon}</span>
        <span className="ms-goal-name">{name}</span>
        <span className="ms-goal-pct" style={{color}}>{p}%</span>
      </div>
      <div className="ms-goal-track">
        <div className="ms-goal-fill" style={{width:`${w}%`,background:color,transition:`width 0.9s cubic-bezier(.4,0,.2,1) ${delay}ms`}}/>
      </div>
      <span className="ms-goal-amounts">{fmt(current)} <em>of {fmt(target)}</em></span>
    </div>
  );
}
 
function Nudge({ type, dot, text, i }) {
  const [gone,setGone]=useState(false);
  if(gone) return null;
  return (
    <div className={`ms-nudge ms-nudge-${type}`} style={{animationDelay:`${i*0.1}s`}}>
      <div className="ms-nudge-dot" style={{background:dot}}/>
      <p>{text}</p>
      <button onClick={()=>setGone(true)}>✕</button>
    </div>
  );
}
 
const Tip = ({ active, payload, label }) => active&&payload?.length ? (
  <div className="ms-tip"><div className="ms-tip-l">{label??payload[0].name}</div><div className="ms-tip-v">{fmt(payload[0].value)}</div></div>
) : null;
 
export default function MoneySnapshot() {
  const [tab,setTab]=useState("overview");
  const [sl,setSl]=useState(null);
  const [on,setOn]=useState(false);
  const user = getUser();
 
  // ── Pull real data from onboarding ──
  const name     = user.name     || "there";
  const salary   = Number(user.salary)       || 48000;
  const rent     = Number(user.rent)         || 12000;
  const savings  = Number(user.savings)      || 20000;
  const emergency= Number(user.emergencyFund)|| 18000;
  const carFin   = Number(user.carFinance)   || 6500;
  const studLoan = Number(user.studentLoan)  || 2500;
  const invest   = Number(user.investments)  || 4000;
  const trackRaw = user.track || " Buy property within 5 years";
  const trackLabel = trackRaw.replace(/^[^\s]+\s/, "").trim();
 
  // ── Derived figures ──
  const totalExpenses  = rent + carFin + studLoan + invest + (salary * 0.17); // living estimate
  const disposable     = salary - totalExpenses;
  const savingsRate    = Math.round((invest / salary) * 100);
  const netWorth       = savings + emergency + (invest * 6);
  const emergencyTarget= salary * 3;
  const depositTarget  = 200000;
  const investTarget   = 100000;
 
  // ── Dynamic spend breakdown ──
  const living = Math.max(salary - rent - carFin - studLoan - invest, 0);
  const spendTotal = rent + carFin + living + studLoan + invest;
  const spendData = [
    { name:"Rent/Bond", value:rent,     color:R,   pct:Math.round((rent/spendTotal)*100) },
    { name:"Car",       value:carFin,   color:AMB, pct:Math.round((carFin/spendTotal)*100) },
    { name:"Living",    value:living,   color:BLU, pct:Math.round((living/spendTotal)*100) },
    { name:"Loan",      value:studLoan, color:PUR, pct:Math.round((studLoan/spendTotal)*100) },
    { name:"Savings",   value:invest,   color:GRN, pct:Math.round((invest/spendTotal)*100) },
  ].filter(d => d.value > 0);
 
  // ── Dynamic goals ──
  const goals = [
    { name:"Emergency fund",   current:emergency, target:emergencyTarget, color:GRN, icon:"" },
    { name:"Property deposit", current:savings,   target:depositTarget,   color:R,   icon:"" },
    { name:"Investments",      current:invest*6,  target:investTarget,    color:BLU, icon:"" },
  ];
 
  // ── Dynamic nudges ──
  const nudges = [];
  if (emergency >= emergencyTarget)
    nudges.push({ type:"success", dot:GRN, text:`Emergency fund complete at ${fmt(emergency)}! Great discipline.` });
  else
    nudges.push({ type:"warn", dot:AMB, text:`Emergency fund is ${pct(emergency,emergencyTarget)}% complete. Target: ${fmt(emergencyTarget)}.` });
  if (savingsRate < 20)
    nudges.push({ type:"warn", dot:AMB, text:`Savings rate is ${savingsRate}% — try redirecting more to hit 20%.` });
  else
    nudges.push({ type:"success", dot:GRN, text:`Great savings rate of ${savingsRate}%! Keep it up.` });
  nudges.push({ type:"info", dot:BLU, text:`${trackLabel} track active — stay consistent with your monthly targets.` });
 
  // ── Activity (use real salary) ──
  const activity = [
    { label:"Salary deposit",    amount:`+${fmt(salary)}`, date:"01 Apr", pos:true },
    { label:"Rent / Bond",       amount:`-${fmt(rent)}`,   date:"02 Apr", pos:false },
    { label:"Car Finance",       amount:`-${fmt(carFin)}`, date:"03 Apr", pos:false },
    { label:"ETF Investment",    amount:`-${fmt(invest)}`, date:"05 Apr", pos:false },
    { label:"Student Loan",      amount:`-${fmt(studLoan)}`,date:"06 Apr",pos:false },
  ].filter(a => !a.amount.includes("R0"));
 
  // ── Health score (simple formula) ──
  const healthScore = Math.min(100, Math.round(
    (savingsRate >= 20 ? 25 : savingsRate * 1.25) +
    (emergency >= emergencyTarget ? 25 : pct(emergency, emergencyTarget) * 0.25) +
    (disposable > 0 ? 25 : 0) +
    (savings > 10000 ? 25 : savings / 400)
  ));
 
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
 
  useEffect(()=>{ setTimeout(()=>setOn(true),80); },[]);
 
  return (
    <main className={`ms-main ${on?"ms-on":""}`}>
 
      {/* ══ HERO ══ */}
      <div className="ms-hero">
        <div className="ms-hero-content">
          <span className="ms-eyebrow">April 2026</span>
          <h1 className="ms-hello">{greeting}, <span>{name}</span></h1>
          <p className="ms-sub">{trackLabel} · here's your financial snapshot</p>
          <div className="ms-hero-pills">
            <span className="ms-pill ms-pill-red">{trackLabel}</span>
            <span className="ms-pill ms-pill-green">● Active</span>
            <span className="ms-pill ms-pill-grey">Year 1 of 5</span>
          </div>
          <div className="ms-hero-score">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke={R} strokeWidth="7"
                strokeDasharray={`${(healthScore/100)*175.9} 175.9`} strokeLinecap="round"
                transform="rotate(-90 36 36)" style={{transition:"stroke-dasharray 1.2s ease .3s"}}/>
              <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="700" fill="#f0ebe8" fontFamily="Syne">{healthScore}</text>
            </svg>
            <div>
              <span className="ms-score-label">{healthScore >= 75 ? "Great" : healthScore >= 50 ? "Good" : "Fair"}</span>
              <span className="ms-score-sub">health score</span>
            </div>
          </div>
        </div>
        <div className="ms-hero-img-slot">
          <img src={heroPlaceholder} alt="hero" className="ms-hero-img" />
        </div>
      </div>
 
      {/* ══ STAT CARDS ══ */}
      <div className="ms-stats">
        {[
          { label:"Monthly income",    end:salary,      pre:"R", suf:"",  tag:"gross salary",          tc:"neutral", delay:0 },
          { label:"Disposable income", end:Math.max(0,disposable), pre:"R", suf:"", tag:disposable>0?`after expenses`:"tight this month", tc:disposable>0?"pos":"neg", delay:80 },
          { label:"Savings rate",      end:savingsRate, pre:"",  suf:"%", tag:savingsRate>=20?"on target":"target is 20%", tc:savingsRate>=20?"pos":"neg", delay:160 },
          { label:"Net worth",         end:netWorth,    pre:"R", suf:"",  tag:"estimated total",       tc:"pos",     delay:240 },
        ].map(s=>(
          <div className="ms-stat" key={s.label} style={{animationDelay:`${s.delay}ms`}}>
            <p className="ms-stat-label">{s.label}</p>
            <p className="ms-stat-val"><CountUp end={s.end} pre={s.pre} suf={s.suf} dur={900}/></p>
            <span className={`ms-stat-tag ms-tag-${s.tc}`}>{s.tag}</span>
          </div>
        ))}
      </div>
 
      {/* ══ TABS ══ */}
      <div className="ms-tabs">
        {["overview","spending","goals","activity"].map(t=>(
          <button key={t} className={`ms-tab${tab===t?" ms-tab-on":""}`} onClick={()=>setTab(t)}>
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
 
      {/* ══ OVERVIEW ══ */}
      {tab==="overview" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Net worth growth</span><span className="ms-badge ms-badge-green">+{fmt(netWorth-28000)} YTD</span></div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={wealthHistory} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={R} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={R} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="m" tick={{fontSize:11,fill:"rgba(240,235,232,0.4)"}} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v=>`R${v/1000}k`} tick={{fontSize:10,fill:"rgba(240,235,232,0.4)"}} axisLine={false} tickLine={false} width={44}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="v" stroke={R} strokeWidth={2.5} fill="url(#ag)" dot={{r:4,fill:R,strokeWidth:0}} activeDot={{r:5}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
 
            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Monthly spend</span></div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={[
                  {m:"Nov",v:Math.round(spendTotal*0.92)},{m:"Dec",v:Math.round(spendTotal*1.07)},
                  {m:"Jan",v:Math.round(spendTotal*0.97)},{m:"Feb",v:Math.round(spendTotal*1.01)},
                  {m:"Mar",v:Math.round(spendTotal*0.96)},{m:"Apr",v:spendTotal}
                ]} barSize={16} margin={{top:4,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="m" tick={{fontSize:10,fill:"rgba(240,235,232,0.4)"}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="v" radius={[5,5,0,0]}>
                    {[0,1,2,3,4,5].map(i=><Cell key={i} fill={i===5?R:"rgba(255,255,255,0.08)"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="ms-card-foot">Apr: <strong style={{color:R}}>{fmt(spendTotal)}</strong></p>
            </div>
 
            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Nudges</span></div>
              {nudges.map((n,i)=><Nudge key={i} {...n} i={i}/>)}
            </div>
 
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head">
                <span className="ms-card-title">Goal progress</span>
                <button className="ms-link" onClick={()=>setTab("goals")}>View all →</button>
              </div>
              {goals.map((g,i)=><GoalBar key={g.name} {...g} delay={i*120}/>)}
            </div>
          </div>
        </div>
      )}
 
      {/* ══ SPENDING ══ */}
      {tab==="spending" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Spending breakdown</span></div>
              <div className="ms-donut">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={spendData} cx="50%" cy="50%" innerRadius={62} outerRadius={90} dataKey="value" strokeWidth={0}
                      onMouseEnter={(_,i)=>setSl(i)} onMouseLeave={()=>setSl(null)}>
                      {spendData.map((e,i)=>(
                        <Cell key={i} fill={e.color} opacity={sl===null||sl===i?1:0.3} style={{cursor:"pointer",transition:"opacity .2s"}}/>
                      ))}
                    </Pie>
                    <Tooltip content={<Tip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="ms-donut-mid">
                  {sl!==null ? <>
                    <p style={{fontSize:14,fontWeight:700,color:spendData[sl].color}}>{fmt(spendData[sl].value)}</p>
                    <p style={{fontSize:11,color:"rgba(240,235,232,0.4)"}}>{spendData[sl].name}</p>
                  </> : <>
                    <p style={{fontSize:14,fontWeight:700,color:"#f0ebe8"}}>{fmt(spendTotal)}</p>
                    <p style={{fontSize:11,color:"rgba(240,235,232,0.4)"}}>total spend</p>
                  </>}
                </div>
              </div>
            </div>
            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Categories</span></div>
              {spendData.map((d,i)=>(
                <div key={d.name} className={`ms-cat-row${sl===i?" ms-cat-on":""}`}
                  onMouseEnter={()=>setSl(i)} onMouseLeave={()=>setSl(null)}>
                  <div className="ms-cat-l">
                    <div className="ms-cat-dot" style={{background:d.color}}/>
                    <span className="ms-cat-name">{d.name}</span>
                  </div>
                  <div className="ms-cat-r">
                    <div className="ms-cat-bg"><div className="ms-cat-fill" style={{width:`${d.pct}%`,background:d.color}}/></div>
                    <span className="ms-cat-pct" style={{color:d.color}}>{d.pct}%</span>
                    <span className="ms-cat-amt">{fmt(d.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      {/* ══ GOALS ══ */}
      {tab==="goals" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Financial goals — {trackLabel}</span></div>
              <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:18}}>
                {goals.map((g,i)=><GoalBar key={g.name} {...g} delay={i*150}/>)}
              </div>
              <div className="ms-callout">On the <strong>{trackLabel}</strong> track — stay consistent with monthly contributions to hit your milestones.</div>
            </div>
            {[
              {label:"Emergency fund",   v:`${pct(emergency,emergencyTarget)}%`, sub:`${fmt(emergency)} of ${fmt(emergencyTarget)}`, note:emergency>=emergencyTarget?"Complete! 🎉":"Keep contributing monthly", c:GRN},
              {label:"Property deposit", v:`${pct(savings,depositTarget)}%`,     sub:`${fmt(savings)} of ${fmt(depositTarget)}`,     note:"On track for Year 4",   c:R},
              {label:"Investments",      v:`${pct(invest*6,investTarget)}%`,     sub:`${fmt(invest*6)} of ${fmt(investTarget)}`,     note:`+${fmt(invest)} this month`, c:BLU},
            ].map(x=>(
              <div key={x.label} className="ms-g-third ms-card ms-summary-card" style={{borderTop:`3px solid ${x.c}`}}>
                <p className="ms-summary-label">{x.label}</p>
                <p className="ms-summary-val" style={{color:x.c}}>{x.v}</p>
                <p className="ms-summary-sub">{x.sub}</p>
                <p className="ms-summary-note">{x.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* ══ ACTIVITY ══ */}
      {tab==="activity" && (
        <div className="ms-content ms-anim">
          <div className="ms-grid">
            <div className="ms-g-wide ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Recent activity</span></div>
              {activity.map((a,i)=>(
                <div key={i} className="ms-act" style={{animationDelay:`${i*0.06}s`}}>
                  <div className="ms-act-av" style={{background:a.pos?"rgba(29,158,117,0.1)":"rgba(200,16,46,0.08)"}}>
                    <span style={{color:a.pos?GRN:R}}>{a.pos?"↑":"↓"}</span>
                  </div>
                  <div className="ms-act-info">
                    <p className="ms-act-name">{a.label}</p>
                    <p className="ms-act-date">{a.date}</p>
                  </div>
                  <span className="ms-act-amt" style={{color:a.pos?GRN:R}}>{a.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
 
      <button className="ms-cta">Open Simulation Lab — Property vs Renting →</button>
    </main>
  );
}