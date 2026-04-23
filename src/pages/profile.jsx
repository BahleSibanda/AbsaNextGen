import { useEffect, useState, useRef } from "react";
import { useToast } from "../components/Toast";
import InfoTip from "../components/InfoTip";
import { calculateHealthScore, scoreLabel } from "../utils/healthScore";
import "../styles/profile.css";

const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");
const fmt = (n) => `R${Math.round(n).toLocaleString("en-ZA")}`;

export default function Profile() {
  const [form, setForm] = useState(getUser());
  const [lastSaved, setLastSaved] = useState(getUser());
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const { show } = useToast();
  const hasChanges = JSON.stringify(form) !== JSON.stringify(lastSaved);

  // Auto-save with 1.5s debounce
  useEffect(() => {
    if (!hasChanges) return;
    setSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem("nw_user", JSON.stringify(form));
      setLastSaved(form);
      setSaving(false);
    }, 1500);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [form, hasChanges]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearProfile = () => {
    localStorage.removeItem("nw_user");
    setForm({});
    setLastSaved({});
    show("Profile cleared — you can start fresh.", "warn");
  };

  // Calculate metrics
  const salary = Number(form.salary) || 0;
  const rent = Number(form.rent) || 0;
  const carFinance = Number(form.carFinance) || 0;
  const studentLoan = Number(form.studentLoan) || 0;
  const investments = Number(form.investments) || 0;
  const savings = Number(form.savings) || 0;
  const emergencyFund = Number(form.emergencyFund) || 0;
  
  const disposable = Math.max(0, salary - rent - carFinance - studentLoan - investments);
  const savingsRate = salary > 0 ? Math.round((investments / salary) * 100) : 0;
  const netWorth = savings + emergencyFund;
  const monthlyObligations = rent + carFinance + studentLoan + investments;
  const monthlyTax = salary * 0.2; // rough estimate
  const healthScore = calculateHealthScore({ salary, rent, carFinance, studentLoan, savings, investments, emergencyFund });
  const scoreMeta = scoreLabel(healthScore);

  return (
    <main className="page-main page-in profile-page">
      <div className="profile-header">
        <div>
          <span className="eyebrow">Profile Settings</span>
          <h1 className="page-title">Welcome back, <span>{form.name || "friend"}</span></h1>
          <p className="page-subtitle">All changes auto-save — keep your financial data up to date.</p>
        </div>
        <div className="profile-actions">
          <span className={`profile-status ${saving ? "saving" : "saved"}`}>
            {saving ? "Saving..." : "Saved"}
          </span>
          <button onClick={clearProfile} className="btn btn-secondary">Reset profile</button>
        </div>
      </div>

      <div className="profile-grid">
        {/* Summary Cards */}
        <section className="profile-card profile-summary">
          <h2>Financial Snapshot</h2>
          <div className="summary-row">
            <span>Monthly income</span>
            <strong>{fmt(salary)}</strong>
          </div>
          <div className="summary-row">
            <span>Total obligations</span>
            <strong>{fmt(monthlyObligations)}</strong>
          </div>
          <div className="summary-row">
            <span>Disposable income</span>
            <strong style={{ color: disposable > 0 ? "#1D9E75" : "#ff6b6b" }}>{fmt(disposable)}</strong>
          </div>
          <div className="summary-row">
            <span>Savings rate</span>
            <strong style={{ color: savingsRate >= 20 ? "#1D9E75" : "#EF9F27" }}>{savingsRate}%</strong>
          </div>
          <div className="summary-row">
            <span>Estimated tax</span>
            <strong>{fmt(monthlyTax)}</strong>
          </div>
          <div className="summary-row">
            <span>Net worth</span>
            <strong>{fmt(netWorth)}</strong>
          </div>
        </section>

        {/* Metrics Cards */}
        <section className="profile-card profile-metrics">
          <h2>Key Metrics</h2>
          <div className="metric-item">
            <span>Savings</span>
            <strong>{fmt(savings)}</strong>
            <small>Current balance</small>
          </div>
          <div className="metric-item">
            <span>Emergency Fund</span>
            <strong>{fmt(emergencyFund)}</strong>
            <small>Target: {fmt(salary * 3)}</small>
          </div>
          <div className="metric-item">
            <span>Monthly Investments</span>
            <strong>{fmt(investments)}</strong>
            <small>{Math.round((investments / salary) * 100) || 0}% of income</small>
          </div>
          <div className="metric-item">
            <span>
              Health score <InfoTip term="Health score" definition="A score based on savings, debt load, emergency cover and investment momentum." />
            </span>
            <strong style={{ color: scoreMeta.color }}>{healthScore} / 100</strong>
            <small>{scoreMeta.label}</small>
          </div>
        </section>

        {/* Edit Form */}
        <section className="profile-card profile-form" style={{ gridColumn: "1 / -1" }}>
          <h2>Edit Information</h2>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="name">First name</label>
              <input id="name" type="text" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. Sbu" />
            </div>
            <div className="form-row">
              <label htmlFor="salary">Monthly salary (gross)</label>
              <input id="salary" type="number" value={form.salary || ""} onChange={(e) => handleChange("salary", Number(e.target.value))} placeholder="48000" />
            </div>
            <div className="form-row">
              <label htmlFor="rent">Monthly rent/bond</label>
              <input id="rent" type="number" value={form.rent || ""} onChange={(e) => handleChange("rent", Number(e.target.value))} placeholder="12000" />
            </div>
            <div className="form-row">
              <label htmlFor="carFinance">Car finance</label>
              <input id="carFinance" type="number" value={form.carFinance || ""} onChange={(e) => handleChange("carFinance", Number(e.target.value))} placeholder="6500" />
            </div>
            <div className="form-row">
              <label htmlFor="studentLoan">Student loan</label>
              <input id="studentLoan" type="number" value={form.studentLoan || ""} onChange={(e) => handleChange("studentLoan", Number(e.target.value))} placeholder="2500" />
            </div>
            <div className="form-row">
              <label htmlFor="investments">Monthly investments</label>
              <input id="investments" type="number" value={form.investments || ""} onChange={(e) => handleChange("investments", Number(e.target.value))} placeholder="4000" />
            </div>
            <div className="form-row">
              <label htmlFor="savings">Current savings</label>
              <input id="savings" type="number" value={form.savings || ""} onChange={(e) => handleChange("savings", Number(e.target.value))} placeholder="20000" />
            </div>
            <div className="form-row">
              <label htmlFor="emergencyFund">Emergency fund</label>
              <input id="emergencyFund" type="number" value={form.emergencyFund || ""} onChange={(e) => handleChange("emergencyFund", Number(e.target.value))} placeholder="18000" />
            </div>
            <div className="form-row" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="track">Financial track</label>
              <select id="track" value={form.track || ""} onChange={(e) => handleChange("track", e.target.value)}>
                <option value="">Select your main goal</option>
                <option value="Buy property within 5 years">Buy property within 5 years</option>
                <option value="Balance lifestyle and investing">Balance lifestyle and investing</option>
                <option value="Build a global investment portfolio">Build a global investment portfolio</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
