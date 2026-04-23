import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import "../styles/moneySnapshot.css";
import heroPlaceholder from "../assets/hero-placeholder.jpg";

export default function MoneySnapshot() {
  return <div style={{ padding: 40, fontSize: 32 }}>MoneySnapshot works ✅</div>;
}

const R   = "#C8102E";
const GRN = "#1D9E75";
const BLU = "#2563EB";
const AMB = "#EF9F27";

const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");

const wealthHistory = [
  { m:"Nov", v:28000 },{ m:"Dec", v:31000 },{ m:"Jan", v:34500 },
  { m:"Feb", v:38000 },{ m:"Mar", v:42000 },{ m:"Apr", v:47200 },
];
const spendData = [
  { name:"Rent/Bond", value:12000, color:R,   pct:32 },
  { name:"Car",       value:6500,  color:AMB,  pct:17 },
  { name:"Living",    value:8000,  color:BLU,  pct:21 },
  { name:"Loan",      value:2500,  color:"#7C3AED", pct:7 },
  { name:"Savings",   value:8800,  color:GRN,  pct:23 },
];
const goals = [
  { name:"Emergency fund",  current:18000, target:24000,  color:GRN, icon:"🛡" },
  { name:"Property deposit", current:32000, target:200000, color:R,   icon:"🏠" },
  { name:"Investments",      current:20000, target:100000, color:BLU, icon:"📈" },
];
const nudges = [
  { type:"success", dot:GRN, text:"Emergency fund 75% complete! Keep adding R2 000/month." },
  { type:"warn",    dot:AMB, text:"Savings rate below 20% — redirect R500 from entertainment." },
  { type:"info",    dot:BLU, text:"Property Builder — 2 months in. Review deposit milestone." },
];
const activity = [
  { label:"Salary deposit",    amount:"+R48 000", date:"01 Apr", pos:true },
  { label:"Discovery Medical", amount:"-R2 800",  date:"02 Apr", pos:false },
  { label:"FNB Car Finance",   amount:"-R6 500",  date:"03 Apr", pos:false },
  { label:"ETF Investment",    amount:"-R4 000",  date:"05 Apr", pos:false },
  { label:"Freelance income",  amount:"+R5 000",  date:"08 Apr", pos:true },
];
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;
const pct  = (c,t) => Math.round((c/t)*100);

function CountUp({ end, pre="R", suf="", dur=1000 }) {
  const [v,setV]=useState(0); const raf=useRef(); const t0=useRef();
  useEffect(()=>{
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
  const user=getUser();
  const name=user.name||"there";
  const salary=Number(user.salary)||48000;
  useEffect(()=>{ setTimeout(()=>setOn(true),80); },[]);

  return (
    <main className={`ms-main ${on?"ms-on":""}`}>

      {/* ══ HERO with image ══ */}
      <div className="ms-hero">
        <div className="ms-hero-content">
          <span className="ms-eyebrow">April 2026</span>
          <h1 className="ms-hello">Good evening, <span>{name}</span></h1>
          <p className="ms-sub">Property Builder track · here's your financial snapshot</p>
          <div className="ms-hero-pills">
            <span className="ms-pill ms-pill-red">Property Builder</span>
            <span className="ms-pill ms-pill-green">● Active</span>
            <span className="ms-pill ms-pill-grey">Year 1 of 5</span>
          </div>
          <div className="ms-hero-score">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke={R} strokeWidth="7"
                strokeDasharray={`${(72/100)*175.9} 175.9`} strokeLinecap="round"
                transform="rotate(-90 36 36)" style={{transition:"stroke-dasharray 1.2s ease .3s"}}/>
              <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1a1612" fontFamily="Syne">72</text>
            </svg>
            <div>
              <span className="ms-score-label">Good</span>
              <span className="ms-score-sub">health score</span>
            </div>
          </div>
        </div>

        {/* ── Hero image slot ── */}
        <div className="ms-hero-img-slot">
          <img src={heroPlaceholder} alt="hero" className="ms-hero-img" />
        </div>
      </div>

      {/* ══ STAT CARDS ══ */}
      <div className="ms-stats">
        {[
          { label:"Monthly income",    end:salary, pre:"R", suf:"",  tag:"gross",           tc:"neutral", delay:0 },
          { label:"Disposable income", end:10200,  pre:"R", suf:"",  tag:"+R800 vs last mo", tc:"pos",    delay:80 },
          { label:"Savings rate",      end:15,     pre:"",  suf:"%", tag:"target is 20%",   tc:"neg",    delay:160 },
          { label:"Net worth",         end:47200,  pre:"R", suf:"",  tag:"↑ +R19 200 YTD",  tc:"pos",    delay:240 },
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
              <div className="ms-card-head"><span className="ms-card-title">Net worth growth</span><span className="ms-badge ms-badge-green">+R19 200 YTD</span></div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={wealthHistory} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={R} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={R} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                  <XAxis dataKey="m" tick={{fontSize:11,fill:"#9e9892"}} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v=>`R${v/1000}k`} tick={{fontSize:10,fill:"#9e9892"}} axisLine={false} tickLine={false} width={44}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="v" stroke={R} strokeWidth={2.5} fill="url(#ag)" dot={{r:4,fill:R,strokeWidth:0}} activeDot={{r:5}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="ms-g-half ms-card">
              <div className="ms-card-head"><span className="ms-card-title">Monthly spend</span></div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={[{m:"Nov",v:34200},{m:"Dec",v:39800},{m:"Jan",v:36100},{m:"Feb",v:37500},{m:"Mar",v:35900},{m:"Apr",v:37800}]} barSize={16} margin={{top:4,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="m" tick={{fontSize:10,fill:"#9e9892"}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="v" radius={[5,5,0,0]}>
                    {[0,1,2,3,4,5].map(i=><Cell key={i} fill={i===5?R:"#e8e5e1"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="ms-card-foot">Apr: <strong style={{color:R}}>R37 800</strong> — similar to last month</p>
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
                    <p style={{fontSize:11,color:"#9e9892"}}>{spendData[sl].name}</p>
                  </> : <>
                    <p style={{fontSize:14,fontWeight:700,color:"#1a1612"}}>R37 800</p>
                    <p style={{fontSize:11,color:"#9e9892"}}>total spend</p>
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
              <div className="ms-card-head"><span className="ms-card-title">Financial goals — Property Builder</span></div>
              <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:18}}>
                {goals.map((g,i)=><GoalBar key={g.name} {...g} delay={i*150}/>)}
              </div>
              <div className="ms-callout">On the <strong>Property Builder</strong> track — on track for a property purchase by <strong>Year 4</strong>.</div>
            </div>
            {[
              {label:"Emergency fund",  v:"75%",sub:"R18 000 of R24 000", note:"3 months to complete",  c:GRN},
              {label:"Property deposit",v:"16%",sub:"R32 000 of R200 000",note:"On track for Year 4",   c:R},
              {label:"Investments",     v:"20%",sub:"R20 000 of R100 000",note:"+R1 200 this month",    c:BLU},
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