import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/onboarding.css";
 
const steps = [
  { key: "name",         q: "What's your first name?",              type: "text",   placeholder: "e.g. Sbu" },
  { key: "salary",       q: "What's your monthly gross salary?",    type: "number", placeholder: "e.g. 48000" },
  { key: "rent",         q: "How much is your monthly rent?",       type: "number", placeholder: "e.g. 12000" },
  { key: "savings",      q: "How much do you currently have saved?",type: "number", placeholder: "e.g. 20000" },
  { key: "emergencyFund",q: "How much is in your emergency fund?",  type: "number", placeholder: "e.g. 18000" },
  { key: "carFinance",   q: "Monthly car finance repayment?",       type: "number", placeholder: "e.g. 6500 (or 0)" },
  { key: "studentLoan",  q: "Monthly student loan repayment?",      type: "number", placeholder: "e.g. 2500 (or 0)" },
  { key: "investments",  q: "Monthly investment contributions?",    type: "number", placeholder: "e.g. 4000" },
  {
    key: "track",
    q: "What's your main financial goal?",
    type: "choice",
    options: [
      " Buy property within 5 years",
      " Balance lifestyle and investing",
      " Build a global investment portfolio",
    ],
  },
];
 
export default function Onboarding() {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});
  const [val,     setVal]     = useState("");
  const navigate = useNavigate();
 
  const current = steps[step];
  const progress = ((step) / steps.length) * 100;
 
  const next = () => {
    if (!val) return;
    const updated = { ...answers, [current.key]: val };
    setAnswers(updated);
    setVal("");
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("nw_user", JSON.stringify(updated));
      navigate("/Snapshot");
    }
  };
 
  const handleKey = (e) => { if (e.key === "Enter") next(); };
 
  return (
    <div className="ob-shell">
      <div className="ob-left">
        <div className="ob-logo">absa <span>|</span> nextgen</div>
        <h2 className="ob-headline">Let's build your financial snapshot</h2>
        <p className="ob-body">Answer {steps.length} quick questions and we'll personalise your entire experience.</p>
        <div className="ob-progress-bar">
          <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="ob-step-label">{step + 1} of {steps.length}</p>
      </div>
 
      <div className="ob-right">
        <div className="ob-card">
          <h3 className="ob-q">{current.q}</h3>
 
          {current.type === "choice" ? (
            <div className="ob-choices">
              {current.options.map(opt => (
                <button key={opt}
                  className={`ob-choice ${val === opt ? "ob-choice-selected" : ""}`}
                  onClick={() => setVal(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="ob-input"
              type={current.type}
              placeholder={current.placeholder}
              value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
          )}
 
          <button className="ob-next" onClick={next} disabled={!val}>
            {step === steps.length - 1 ? "Build my snapshot →" : "Next →"}
          </button>
 
          {step > 0 && (
            <button className="ob-back" onClick={() => { setStep(step - 1); setVal(""); }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 