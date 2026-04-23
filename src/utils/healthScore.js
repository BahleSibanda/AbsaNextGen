export function calculateHealthScore(data) {
  const { salary, rent, carFinance, studentLoan, savings, investments, emergencyFund } = data;
  let score = 0;

  const salaryValue = Number(salary) || 1;
  const savingsRate = Number(savings) / salaryValue;
  if (savingsRate >= 0.2) score += 25;
  else if (savingsRate >= 0.15) score += 18;
  else if (savingsRate >= 0.1) score += 12;
  else score += 5;

  const debtRatio = (Number(carFinance) + Number(studentLoan)) / salaryValue;
  if (debtRatio < 0.15) score += 25;
  else if (debtRatio < 0.25) score += 18;
  else if (debtRatio < 0.35) score += 10;
  else score += 3;

  const expenses = Number(rent) + Number(carFinance) + Number(studentLoan);
  const months = Number(emergencyFund) / (expenses || 1);
  if (months >= 6) score += 25;
  else if (months >= 3) score += 18;
  else if (months >= 1) score += 10;

  const investRate = Number(investments) / salaryValue;
  if (investRate >= 0.15) score += 25;
  else if (investRate >= 0.1) score += 18;
  else if (investRate >= 0.05) score += 10;
  else score += 2;

  return Math.min(score, 100);
}

export function scoreLabel(score) {
  if (score >= 80) return { label: "Excellent", color: "#1D9E75" };
  if (score >= 65) return { label: "Good", color: "#378ADD" };
  if (score >= 45) return { label: "Fair", color: "#EF9F27" };
  return { label: "Needs work", color: "#C8102E" };
}
