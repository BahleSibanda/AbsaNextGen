import { useEffect, useState } from "react";
import "../styles/profile.css";

const getUser = () => JSON.parse(localStorage.getItem("nw_user") || "{}");

export default function Profile() {
  const [user, setUser] = useState(getUser());
  const [form, setForm] = useState({ ...getUser() });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setForm(getUser());
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveProfile = () => {
    localStorage.setItem("nw_user", JSON.stringify(form));
    setUser(form);
    setSaved(true);
  };

  const clearProfile = () => {
    localStorage.removeItem("nw_user");
    setUser({});
    setForm({});
    setSaved(false);
  };

  const displayValue = (key, fallback) => user[key] || fallback;

  return (
    <main className="page-main page-in profile-page">
      <div className="profile-header">
        <div>
          <span className="eyebrow">Profile</span>
          <h1 className="page-title">Welcome back, {displayValue("name", "friend")}</h1>
          <p className="page-subtitle">Manage the information we use to personalise your experience.</p>
        </div>
        <div className="profile-actions">
          <button onClick={saveProfile} className="btn btn-primary">Save changes</button>
          <button onClick={clearProfile} className="btn btn-secondary">Reset profile</button>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card profile-summary">
          <h2>Snapshot</h2>
          <div className="summary-row">
            <span>Name</span>
            <strong>{displayValue("name", "Not set")}</strong>
          </div>
          <div className="summary-row">
            <span>Salary</span>
            <strong>{displayValue("salary", "R0")}</strong>
          </div>
          <div className="summary-row">
            <span>Rent</span>
            <strong>{displayValue("rent", "R0")}</strong>
          </div>
          <div className="summary-row">
            <span>Track</span>
            <strong>{displayValue("track", "Not selected")}</strong>
          </div>
        </section>

        <section className="profile-card profile-form">
          <h2>Your settings</h2>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your first name" />
          </div>
          <div className="form-row">
            <label htmlFor="salary">Monthly salary</label>
            <input id="salary" type="number" value={form.salary || ""} onChange={(e) => handleChange("salary", e.target.value)} placeholder="48000" />
          </div>
          <div className="form-row">
            <label htmlFor="rent">Monthly rent</label>
            <input id="rent" type="number" value={form.rent || ""} onChange={(e) => handleChange("rent", e.target.value)} placeholder="12000" />
          </div>
          <div className="form-row">
            <label htmlFor="savings">Current savings</label>
            <input id="savings" type="number" value={form.savings || ""} onChange={(e) => handleChange("savings", e.target.value)} placeholder="20000" />
          </div>
          <div className="form-row">
            <label htmlFor="emergencyFund">Emergency fund</label>
            <input id="emergencyFund" type="number" value={form.emergencyFund || ""} onChange={(e) => handleChange("emergencyFund", e.target.value)} placeholder="18000" />
          </div>
          <div className="form-row">
            <label htmlFor="carFinance">Car finance</label>
            <input id="carFinance" type="number" value={form.carFinance || ""} onChange={(e) => handleChange("carFinance", e.target.value)} placeholder="6500" />
          </div>
          <div className="form-row">
            <label htmlFor="studentLoan">Student loan</label>
            <input id="studentLoan" type="number" value={form.studentLoan || ""} onChange={(e) => handleChange("studentLoan", e.target.value)} placeholder="2500" />
          </div>
          <div className="form-row">
            <label htmlFor="investments">Monthly investments</label>
            <input id="investments" type="number" value={form.investments || ""} onChange={(e) => handleChange("investments", e.target.value)} placeholder="4000" />
          </div>
          <div className="form-row">
            <label htmlFor="track">Financial track</label>
            <select id="track" value={form.track || ""} onChange={(e) => handleChange("track", e.target.value)}>
              <option value="">Select a track</option>
              <option value="Buy property within 5 years">Buy property within 5 years</option>
              <option value="Balance lifestyle and investing">Balance lifestyle and investing</option>
              <option value="Build a global investment portfolio">Build a global investment portfolio</option>
            </select>
          </div>
          {saved && <p className="profile-saved">Changes saved!</p>}
        </section>
      </div>
    </main>
  );
}
