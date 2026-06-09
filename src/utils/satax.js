/**
 * South African Income Tax Calculator — 2024/25 Tax Year
 * SARS progressive brackets, primary rebate, UIF, and net salary.
 */

// Tax brackets for individuals under 65 (2024/25)
const BRACKETS = [
  { min: 0,        max: 237100,  base: 0,      rate: 0.18 },
  { min: 237101,   max: 370500,  base: 42678,  rate: 0.26 },
  { min: 370501,   max: 512800,  base: 77362,  rate: 0.31 },
  { min: 512801,   max: 673000,  base: 121475, rate: 0.36 },
  { min: 673001,   max: 857900,  base: 179147, rate: 0.39 },
  { min: 857901,   max: 1817000, base: 251258, rate: 0.41 },
  { min: 1817001,  max: Infinity,base: 644489, rate: 0.45 },
];

const PRIMARY_REBATE   = 17235;   // Under 65 rebate 2024/25
const UIF_RATE         = 0.01;    // Employee UIF: 1%
const UIF_CEILING      = 17712;   // Monthly UIF earnings ceiling

/**
 * Calculate annual income tax from annual taxable income.
 */
export function calcAnnualTax(annualIncome) {
  const bracket = BRACKETS.find(b => annualIncome <= b.max);
  if (!bracket) return 0;
  const rawTax = bracket.base + (annualIncome - bracket.min) * bracket.rate;
  return Math.max(0, rawTax - PRIMARY_REBATE);
}

/**
 * Full monthly breakdown from gross monthly salary.
 * Returns: { gross, annualIncome, annualTax, monthlyPAYE, uif, netSalary,
 *            effectiveRate, marginalRate, taxBracket }
 */
export function calcMonthlyTax(grossMonthly) {
  const gross = Number(grossMonthly) || 0;
  const annualIncome = gross * 12;
  const annualTax    = calcAnnualTax(annualIncome);
  const monthlyPAYE  = Math.round(annualTax / 12);
  const uif          = Math.round(Math.min(gross, UIF_CEILING) * UIF_RATE);
  const netSalary    = gross - monthlyPAYE - uif;
  const effectiveRate = annualIncome > 0 ? ((annualTax / annualIncome) * 100).toFixed(1) : 0;

  const bracket = BRACKETS.find(b => annualIncome <= b.max);
  const marginalRate = bracket ? (bracket.rate * 100).toFixed(0) : 45;
  const taxBracket   = bracket
    ? `${(bracket.rate * 100).toFixed(0)}% bracket (R${(bracket.min).toLocaleString("en-ZA")}–${bracket.max === Infinity ? "+" : "R" + bracket.max.toLocaleString("en-ZA")})`
    : "Top bracket";

  return {
    gross,
    annualIncome,
    annualTax: Math.round(annualTax),
    monthlyPAYE,
    uif,
    netSalary: Math.round(netSalary),
    effectiveRate: Number(effectiveRate),
    marginalRate: Number(marginalRate),
    taxBracket,
  };
}

/**
 * Spending category buckets from user inputs.
 * Categories: Housing, Mobility, Lifestyle, Debt, Savings
 */
export function calcSpendBuckets({ salary, rent, carFinance, studentLoan, investments, netSalary }) {
  const net  = netSalary || salary;
  const housing   = Number(rent)        || 0;
  const mobility  = Number(carFinance)  || 0;
  const debt      = Number(studentLoan) || 0;
  const savings   = Number(investments) || 0;
  const lifestyle = Math.max(0, net - housing - mobility - debt - savings);

  const total = housing + mobility + lifestyle + debt + savings;
  const pct = (v) => total > 0 ? Math.round((v / total) * 100) : 0;

  return [
    { key: "housing",   name: "Housing",   value: housing,   pct: pct(housing),   color: "#C8102E",  icon: "🏠", benchmark: 30 },
    { key: "mobility",  name: "Mobility",  value: mobility,  pct: pct(mobility),  color: "#EF9F27",  icon: "🚗", benchmark: 15 },
    { key: "lifestyle", name: "Lifestyle", value: lifestyle, pct: pct(lifestyle), color: "#2563EB",  icon: "🌿", benchmark: 30 },
    { key: "debt",      name: "Debt",      value: debt,      pct: pct(debt),      color: "#7C3AED",  icon: "📋", benchmark: 10 },
    { key: "savings",   name: "Savings",   value: savings,   pct: pct(savings),   color: "#1D9E75",  icon: "📈", benchmark: 20 },
  ].filter(b => b.value > 0);
}

/**
 * Key financial metrics derived from user data.
 */
export function calcMetrics({ salary, rent, carFinance, studentLoan, investments, savings, emergencyFund }) {
  const tax = calcMonthlyTax(salary);
  const netSalary      = tax.netSalary;
  const totalDebt      = (Number(carFinance) + Number(studentLoan));
  const debtToIncome   = salary > 0 ? ((totalDebt / salary) * 100).toFixed(1) : 0;
  const savingsRate    = salary > 0 ? ((Number(investments) / salary) * 100).toFixed(1) : 0;
  const netSavingsRate = netSalary > 0 ? ((Number(investments) / netSalary) * 100).toFixed(1) : 0;
  const disposable     = netSalary - Number(rent) - Number(carFinance) - Number(studentLoan) - Number(investments);
  const netWorth       = (Number(savings) || 0) + (Number(emergencyFund) || 0);
  const emergencyMonths = disposable > 0 ? ((Number(emergencyFund)) / (netSalary - Number(investments))).toFixed(1) : 0;

  return {
    ...tax,
    netSalary,
    totalDebt,
    debtToIncome: Number(debtToIncome),
    savingsRate: Number(savingsRate),
    netSavingsRate: Number(netSavingsRate),
    disposable: Math.round(disposable),
    netWorth: Math.round(netWorth),
    emergencyMonths: Number(emergencyMonths),
  };
}

/**
 * Income band narrative — describes spending vs SA peers.
 */
export function getIncomeBand(grossMonthly) {
  if (grossMonthly < 15000)  return { band: "Entry-level", peer: "R8k–R15k/month" };
  if (grossMonthly < 30000)  return { band: "Junior professional", peer: "R15k–R30k/month" };
  if (grossMonthly < 50000)  return { band: "Mid-level professional", peer: "R30k–R50k/month" };
  if (grossMonthly < 80000)  return { band: "Senior professional", peer: "R50k–R80k/month" };
  return                              { band: "Executive", peer: "R80k+/month" };
}

/**
 * Generate smart narrative insights from metrics.
 */
export function generateNarratives(metrics, buckets) {
  const insights = [];
  const { band } = getIncomeBand(metrics.gross);
  const housing = buckets.find(b => b.key === "housing");
  const savings = buckets.find(b => b.key === "savings");
  const debt    = buckets.find(b => b.key === "debt");

  if (housing && housing.pct > 35) {
    insights.push({ type: "warn", text: `Housing takes ${housing.pct}% of your spend — above the 30% guideline for ${band} earners. Consider whether your current rental aligns with your financial goals.` });
  } else if (housing) {
    insights.push({ type: "success", text: `Housing at ${housing.pct}% is within healthy range for ${band} earners. Well managed.` });
  }

  if (savings && savings.pct < 15) {
    insights.push({ type: "warn", text: `Savings allocation is ${savings.pct}% — below the recommended 20% for wealth building. Even an extra R500/month compounds significantly.` });
  } else if (savings) {
    insights.push({ type: "success", text: `You're allocating ${savings.pct}% to savings — above the 15% minimum. ${band} earners at your rate typically build meaningful wealth within 5 years.` });
  }

  if (debt && debt.pct > 15) {
    insights.push({ type: "warn", text: `Debt repayments are ${debt.pct}% of spend (debt-to-income: ${metrics.debtToIncome}%). High debt reduces wealth-building capacity. Prioritise paying this down.` });
  }

  if (metrics.disposable < 0) {
    insights.push({ type: "warn", text: `Your obligations exceed your take-home pay by ${Math.abs(metrics.disposable).toLocaleString("en-ZA")}. This is unsustainable — review your largest expenses urgently.` });
  } else if (metrics.disposable < 2000) {
    insights.push({ type: "warn", text: `Disposable income is very tight at R${metrics.disposable.toLocaleString("en-ZA")}/month. A single unexpected expense could cause financial stress.` });
  }

  if (metrics.effectiveRate < 20) {
    insights.push({ type: "info", text: `Your effective tax rate is ${metrics.effectiveRate}% (marginal: ${metrics.marginalRate}%). RA contributions could reduce this meaningfully.` });
  }

  return insights;
}