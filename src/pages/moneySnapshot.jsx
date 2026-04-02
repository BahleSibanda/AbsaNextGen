import React from "react";
import { useState } from "react"; /* pulls in React's built -in tool for tracking changing values, like which nav item is selected*/
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "../styles/moneySnapshot.css";

const spendingData = [
    {name: "Rent/ bond", value: 12000, color: "#C8102E"},
    {name: "Car Payments", value: 6500, color: "#5DCAA5"},
    { name: "Living costs", value: 8000, color: "#EF9F27" },
    { name: "Student loan", value: 2500, color: "#B4B2A9" },
    { name: "Savings", value: 8800, color: "#0f1923" },
];

const goals = [
  { name: "Emergency fund", current: 18000, target: 24000, color: "#1D9E75" },
  { name: "Property deposit", current: 32000, target: 200000, color: "#C8102E" },
  { name: "Investment portfolio", current: 20000, target: 100000, color: "#378ADD" },
];

const insights = [
  { text: "Savings rate is 15% — slightly below the recommended 20% for your income level.", color: "#C8102E" },
  { text: "Car expenses are 28% of take-home pay. Paying it down faster frees up R2 000/month.", color: "#EF9F27" },
  { text: "No revolving credit card debt — strong foundation for your credit score.", color: "#1D9E75" },
  { text: "On track for a property deposit by Year 3 at your current savings rate.", color: "#378ADD" },
];


const nudges = [
  { type: "success", iconColor: "#1D9E75", text: "Emergency fund is 75% complete! Keep adding R2 000/month to finish in 3 months." },
  { type: "warn", iconColor: "#EF9F27", text: "Savings rate dropped below 20% this month. Consider redirecting R500 from entertainment." },
  { type: "info", iconColor: "#378ADD", text: "You have been on the Property Builder track for 2 months — review your deposit milestone." },
];

const navItems = [ "Money Snapshot", "Strategy Tracks", "Learn", "Profile", "Login" ];
 
const fmt = (n) => `R${n.toLocaleString("en-ZA")}`;
const pct = (c, t) => Math.round((c / t) * 100);
 

export default function MoneySnapshot() {
    
    const [activeNav, setActiveNav] = useState("Money Snapshot");

 return (
    <>
      <style>{styles}</style>
      <div className="nw-shell">
        <aside className="nw-sidebar">
          <div className="nw-logo">absa <span>|</span> nextgen</div>
          <div className="nw-user-block">
            <div className="nw-user-label">welcome back</div>
            <div className="nw-user-name">Sbu</div>
            <span className="nw-track-pill">Property Builder</span>
          </div>
          {navItems.map((item) => (
            <div
              key={item}
              className={`nw-nav-item${activeNav === item ? " active" : ""}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </div>
          ))}
          <div className="nw-nav-logout">Log out</div>
        </aside>
 
        <main className="nw-main">
          <div className="nw-topbar">
            <div>
              <div className="nw-topbar-title">Money Snapshot</div>
              <div className="nw-topbar-sub">Your financial health at a glance — April 2026</div>
            </div>
            <div className="nw-health-block">
              <div className="nw-health-score">72 <span style={{ fontSize: 14, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>/100</span></div>
              <span className="nw-health-badge">Good</span>
            </div>
          </div>
 
          <div className="nw-metric-row">
            {[
              { label: "Monthly income", value: "R48 000", sub: "gross salary", subClass: "muted" },
              { label: "Disposable income", value: "R10 200", sub: "after all expenses", subClass: "good" },
              { label: "Savings rate", value: "15%", sub: "below 20% target", subClass: "warn" },
              { label: "Investments", value: "R20 000", sub: "RA + ETF", subClass: "muted" },
            ].map((m) => (
              <div className="nw-metric" key={m.label}>
                <div className="nw-metric-label">{m.label}</div>
                <div className="nw-metric-value">{m.value}</div>
                <div className={`nw-metric-sub ${m.subClass}`}>{m.sub}</div>
              </div>
            ))}
          </div>
 
          <div className="nw-mid-grid">
            <div className="nw-card">
              <div className="nw-card-title">Monthly spending</div>
              <div className="nw-spending-inner">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={54}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {spendingData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => fmt(val)}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "0.5px solid #eee" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="nw-legend">
                  {spendingData.map((d) => (
                    <div className="nw-legend-row" key={d.name}>
                      <div className="nw-legend-dot" style={{ background: d.color }} />
                      {d.name}
                      <span className="nw-legend-amount">{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
 
            <div className="nw-card">
              <div className="nw-card-title">Financial insights</div>
              <div className="nw-insight-list">
                {insights.map((ins, i) => (
                  <div className="nw-insight" key={i}>
                    <div className="nw-insight-bar" style={{ background: ins.color }} />
                    {ins.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          <div className="nw-mid-grid">
            <div className="nw-card">
              <div className="nw-card-title">Financial goals</div>
              {goals.map((g) => (
                <div className="nw-goal-item" key={g.name}>
                  <div className="nw-goal-header">
                    <span className="nw-goal-name">{g.name}</span>
                    <span className="nw-goal-progress-text">{fmt(g.current)} / {fmt(g.target)} — {pct(g.current, g.target)}%</span>
                  </div>
                  <div className="nw-goal-track">
                    <div className="nw-goal-fill" style={{ width: `${pct(g.current, g.target)}%`, background: g.color }} />
                  </div>
                </div>
              ))}
            </div>
 
            <div className="nw-card">
              <div className="nw-card-title">Nudges</div>
              {nudges.map((n, i) => (
                <div className={`nw-nudge ${n.type}`} key={i}>
                  <div className="nw-nudge-icon" style={{ background: n.iconColor }} />
                  {n.text}
                </div>
              ))}
            </div>
          </div>
 
          <button className="nw-sim-btn">
            Open Simulation Lab — Property vs Renting →
          </button>
        </main>
      </div>
    </>
  );
}
