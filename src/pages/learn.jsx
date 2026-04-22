import { useState, useEffect } from "react";
import "../styles/learn.css";
 
const ABSA_RED = "#C8102E";

const topics = [
  {
    category: "Fundamentals",
    color: "#378ADD",
    icon: "📚",
    articles: [
      {
        title: "How to read your payslip",
        time: "4 min",
        difficulty: "Beginner",
        summary: "Understanding gross vs net pay, UIF, PAYE, and medical aid deductions so you know exactly where your money goes before it reaches your account.",
        keyPoints: [
          "Gross salary is what you earn BEFORE tax. Net salary is what lands in your account.",
          "PAYE (Pay As You Earn) is income tax deducted monthly by your employer on SARS's behalf.",
          "UIF (Unemployment Insurance Fund) is 1% of your salary — it protects you if you lose your job.",
          "Medical aid and retirement fund contributions reduce your taxable income, which can lower your tax bracket.",
          "Always check your payslip monthly — errors are more common than you think.",
        ],
        glossary: [{ term: "PAYE", def: "Pay As You Earn — income tax collected by your employer monthly and paid to SARS." }, { term: "UIF", def: "Unemployment Insurance Fund — 1% of salary contributed monthly for employment protection." }],
      },
      {
        title: "The 50/30/20 rule explained",
        time: "3 min",
        difficulty: "Beginner",
        summary: "A simple budgeting framework: 50% needs, 30% wants, 20% savings and investments. Here's how to apply it to a South African income.",
        keyPoints: [
          "50% of take-home pay covers needs: rent, food, transport, insurance, loan repayments.",
          "30% covers wants: restaurants, streaming, travel, clothing beyond basics.",
          "20% goes to savings, investments, and debt repayment beyond minimums.",
          "In South Africa, rent can eat 30%+ of income in cities like Cape Town — adjust the ratios accordingly.",
          "This is a starting framework, not a strict rule. The key is having a plan.",
        ],
        glossary: [{ term: "Take-home pay", def: "Your salary after all deductions — what actually arrives in your bank account." }],
      },
      {
        title: "Emergency funds: why and how much",
        time: "5 min",
        difficulty: "Beginner",
        summary: "An emergency fund is the foundation of every financial plan. Here's how much you need and where to keep it in South Africa.",
        keyPoints: [
          "An emergency fund should cover 3–6 months of essential living expenses.",
          "Keep it in a money market account or 32-day notice account — accessible but earning interest.",
          "Do not invest your emergency fund in equities. You need it liquid (accessible immediately).",
          "Build it before aggressively investing elsewhere — without it, one emergency wipes out all progress.",
          "A good starting target: 1 month of expenses. Grow from there before anything else.",
        ],
        glossary: [{ term: "Liquid", def: "Money you can access quickly without penalty or waiting periods." }, { term: "Money market", def: "A savings account that earns higher interest than a standard account while staying accessible." }],
      },
    ],
  },
  {
    category: "Tax",
    color: "#EF9F27",
    icon: "🧾",
    articles: [
      {
        title: "How income tax works in South Africa",
        time: "6 min",
        difficulty: "Intermediate",
        summary: "South Africa uses a progressive tax system — the more you earn, the higher your rate. But the brackets work in bands, not all-or-nothing.",
        keyPoints: [
          "Tax is calculated in bands: you pay 18% on the first R237 100, 26% on the next portion, up to 45% on income above R1.8 million.",
          "The tax rebate (R17 235 for under-65s in 2025/26) reduces your tax bill — it's not a deduction from income, it's deducted from the tax amount.",
          "Your 'effective tax rate' is your total tax divided by your income — it's always lower than your 'marginal rate' (the rate on your last rand).",
          "SARS (South African Revenue Service) expects you to file a tax return annually if you earn above certain thresholds.",
          "Retirement Annuity and TFSA contributions can reduce your taxable income significantly.",
        ],
        glossary: [{ term: "Marginal rate", def: "The tax rate applied to your last (highest) portion of income." }, { term: "Effective rate", def: "Your total tax as a percentage of total income — always lower than the marginal rate." }, { term: "SARS", def: "South African Revenue Service — the tax authority." }],
      },
      {
        title: "Tax-Free Savings Accounts (TFSA) explained",
        time: "5 min",
        difficulty: "Intermediate",
        summary: "The TFSA is one of South Africa's best savings tools. You can invest R36 000 per year (R500 000 lifetime) with zero tax on returns, interest, or dividends.",
        keyPoints: [
          "Annual limit: R36 000. Lifetime limit: R500 000. Exceeding these attracts a 40% tax penalty — don't do it.",
          "Zero tax on interest, dividends, or capital gains inside the account — your returns compound tax-free.",
          "You can open a TFSA at most banks and investment platforms (Sygnia, EasyEquities, Old Mutual).",
          "Best used for long-term investing — the longer it stays, the more the tax saving compounds.",
          "You can withdraw at any time, but withdrawn amounts don't restore your contribution limit.",
        ],
        glossary: [{ term: "Capital gains", def: "Profit made when you sell an asset for more than you paid for it." }, { term: "Compound", def: "Earning returns on your returns — the snowball effect of reinvesting." }],
      },
    ],
  },
  {
    category: "Investing",
    color: "#1D9E75",
    icon: "📈",
    articles: [
      {
        title: "What is an ETF and why does everyone recommend them?",
        time: "5 min",
        difficulty: "Beginner",
        summary: "ETFs (Exchange Traded Funds) are the most recommended investment for young professionals. Here's what they are and why they work.",
        keyPoints: [
          "An ETF is a basket of many shares — buying one ETF gives you a small piece of hundreds of companies.",
          "They're passively managed, which means lower fees. Index ETFs typically charge 0.1–0.5% per year vs 1.5–2.5% for actively managed funds.",
          "The S&P 500 ETF tracks 500 of the largest US companies. Historically it has returned ~10% per year on average.",
          "In South Africa you can invest in ETFs through platforms like EasyEquities, Sygnia, or your bank's investment platform.",
          "Dollar-cost averaging (investing a fixed amount monthly) is the most effective strategy for most people.",
        ],
        glossary: [{ term: "Index fund", def: "A fund that tracks a specific market index like the JSE Top 40 or S&P 500." }, { term: "Dollar-cost averaging", def: "Investing a fixed amount regularly regardless of price — reduces the impact of market timing." }, { term: "TER", def: "Total Expense Ratio — the annual fee charged by a fund, expressed as a percentage." }],
      },
      {
        title: "Retirement Annuities (RA) in South Africa",
        time: "6 min",
        difficulty: "Intermediate",
        summary: "An RA is a retirement savings vehicle with significant tax advantages. The earlier you start, the more powerful compound growth becomes.",
        keyPoints: [
          "RA contributions are tax-deductible up to 27.5% of taxable income (max R350 000/year) — this directly reduces your tax bill.",
          "The money grows tax-free inside the RA — no capital gains tax, income tax, or dividends tax.",
          "You cannot access the money before age 55, except in certain circumstances — this is by design, to protect your retirement.",
          "At retirement, the first R550 000 lump sum is tax-free.",
          "Good SA RA providers include Allan Gray, Sygnia, 10X Investments, and Coronation.",
        ],
        glossary: [{ term: "RA", def: "Retirement Annuity — a long-term savings vehicle for retirement with tax benefits." }, { term: "Tax-deductible", def: "An expense or contribution that reduces your taxable income, lowering your tax bill." }],
      },
      {
        title: "Offshore investing from South Africa",
        time: "7 min",
        difficulty: "Intermediate",
        summary: "Investing globally protects you from rand weakness and gives you exposure to the world's best companies. Here's how to do it legally from SA.",
        keyPoints: [
          "Every South African has a Single Discretionary Allowance of R1 million per year to invest offshore — no SARS approval needed.",
          "An additional R10 million per year is available with a SARS Tax Compliance Status (TCS) certificate.",
          "The simplest route: buy a global ETF in rands through EasyEquities or Sygnia (they handle the forex conversion).",
          "Popular choices: Satrix MSCI World ETF, Sygnia Itrix S&P 500 ETF, Ashburton Global 1200.",
          "Offshore investing also hedges against rand depreciation — your investment grows in dollars or pounds.",
        ],
        glossary: [{ term: "SDA", def: "Single Discretionary Allowance — R1 million per year you can send offshore without SARS approval." }, { term: "Forex", def: "Foreign exchange — converting rands to dollars, euros, or other currencies." }, { term: "Hedge", def: "A strategy to reduce risk — investing offshore hedges against rand weakening." }],
      },
    ],
  },
  {
    category: "Property",
    color: ABSA_RED,
    icon: "🏠",
    articles: [
      {
        title: "How home loans work in South Africa",
        time: "7 min",
        difficulty: "Intermediate",
        summary: "Everything you need to know about applying for a bond: deposits, credit scores, pre-approval, and what banks actually look at.",
        keyPoints: [
          "Banks typically require a 10–20% deposit. A bigger deposit means lower monthly repayments and less interest paid overall.",
          "Your credit score (from TransUnion or Experian) must be healthy — check it for free annually. Aim for 650+ before applying.",
          "Pre-approval tells you how much a bank will lend you. Get this before property hunting — it sets your budget.",
          "Your debt-to-income ratio matters: banks want your total debt repayments to be below 30–35% of gross income.",
          "The prime interest rate (currently ~11.75%) is the benchmark — most home loans are prime minus or plus a percentage.",
        ],
        glossary: [{ term: "Bond", def: "South African term for a home loan — the bank lends you money to buy property." }, { term: "Prime rate", def: "The interest rate set by the Reserve Bank that other rates are based on." }, { term: "LTV", def: "Loan-to-Value ratio — the loan amount as a percentage of the property value." }],
      },
    ],
  },
];
 

 
function ArticleCard({ article, color, onClick }) {
  return (
    <div className="ln-article-card" onClick={() => onClick(article, color)}>
      <div className="ln-article-top">
        <span className="ln-article-diff" style={{ color, background: color + "18" }}>{article.difficulty}</span>
        <span className="ln-article-time">{article.time} read</span>
      </div>
      <h3 className="ln-article-title">{article.title}</h3>
      <p className="ln-article-summary">{article.summary}</p>
      <button className="ln-article-btn" style={{ color }}>Read article →</button>
    </div>
  );
}
 
function ArticleModal({ article, color, onClose }) {
  return (
    <div className="ln-overlay" onClick={onClose}>
      <div className="ln-modal" onClick={e => e.stopPropagation()}>
        <button className="ln-modal-close" onClick={onClose}>✕</button>
        <div className="ln-modal-header" style={{ borderTop: `4px solid ${color}` }}>
          <span className="ln-modal-diff" style={{ color, background: color + "18" }}>{article.difficulty}</span>
          <span className="ln-modal-time">{article.time} read</span>
          <h2 className="ln-modal-title">{article.title}</h2>
          <p className="ln-modal-summary">{article.summary}</p>
        </div>
        <div className="ln-modal-body">
          <p className="ln-section-label">Key points</p>
          {article.keyPoints.map((p, i) => (
            <div key={i} className="ln-key-point">
              <div className="ln-kp-num" style={{ background: color }}>{i + 1}</div>
              <p>{p}</p>
            </div>
          ))}
          {article.glossary?.length > 0 && (
            <>
              <p className="ln-section-label" style={{ marginTop: 24 }}>Key terms</p>
              {article.glossary.map(g => (
                <div key={g.term} className="ln-gloss-row">
                  <span className="ln-gloss-term" style={{ color }}>{g.term}</span>
                  <span className="ln-gloss-def">{g.def}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default function Learn() {
  const [category,    setCategory]   = useState("all");
  const [openArticle, setArticle]    = useState(null);
  const [openColor,   setColor]      = useState(null);
  const [mounted,     setMounted]    = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
 
  const filtered = category === "all" ? topics : topics.filter(t => t.category === category);
  const totalArticles = topics.reduce((sum, t) => sum + t.articles.length, 0);
 
  return (
    <main className={`ln-main ${mounted ? "ln-in" : ""}`}>
 
      <div className="ln-hero">
        <div>
          <p className="ln-eyebrow">Financial Education</p>
          <h1 className="ln-title">Learn <span>Hub</span></h1>
          <p className="ln-subline">{totalArticles} articles covering the financial concepts that matter most in your first five years</p>
        </div>
      </div>
 
      <div className="ln-cat-row">
        {["all", ...topics.map(t => t.category)].map(cat => (
          <button key={cat} className={`ln-cat-btn ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
            {cat === "all" ? `All topics (${totalArticles})` : `${topics.find(t => t.category === cat)?.icon} ${cat}`}
          </button>
        ))}
      </div>
 
      {filtered.map(topic => (
        <div key={topic.category} className="ln-topic-section">
          <div className="ln-topic-header">
            <span className="ln-topic-icon">{topic.icon}</span>
            <div>
              <h2 className="ln-topic-name" style={{ color: topic.color }}>{topic.category}</h2>
              <p className="ln-topic-count">{topic.articles.length} article{topic.articles.length > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="ln-articles-grid">
            {topic.articles.map(a => (
              <ArticleCard key={a.title} article={a} color={topic.color} onClick={(art, col) => { setArticle(art); setColor(col); }} />
            ))}
          </div>
        </div>
      ))}
 
      {openArticle && <ArticleModal article={openArticle} color={openColor} onClose={() => { setArticle(null); setColor(null); }} />}
 
    </main>
  );
}