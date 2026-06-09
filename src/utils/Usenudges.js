import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "nw_dismissed_nudges";

// Safely read dismissed nudge IDs from localStorage
function loadDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveDismissed(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * useNudges — manages a list of contextual nudges with persistent dismissal.
 *
 * Usage:
 *   const { activeNudges, dismiss } = useNudges(nudgeDefinitions, metrics);
 *
 * nudgeDefinitions: Array<{ id, type, condition(metrics) -> bool, text(metrics) -> string }>
 * metrics: the current financial metrics object
 *
 * Returns:
 *   activeNudges: nudges whose condition is true AND haven't been dismissed
 *   dismiss(id):  marks a nudge as dismissed, persists to localStorage
 *   clearAll():   resets all dismissals (useful on profile reset)
 */
export function useNudges(nudgeDefinitions, metrics) {
  const [dismissed, setDismissed] = useState(loadDismissed);

  // Re-sync if another tab/page updates localStorage
  useEffect(() => {
    const handler = () => setDismissed(loadDismissed());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const dismiss = useCallback((id) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDismissed(new Set());
  }, []);

  // Only show nudges whose condition is met and haven't been dismissed
  const activeNudges = nudgeDefinitions.filter(n => {
    if (dismissed.has(n.id)) return false;
    try { return n.condition(metrics); }
    catch { return false; }
  }).map(n => ({
    ...n,
    text: typeof n.text === "function" ? n.text(metrics) : n.text,
  }));

  return { activeNudges, dismiss, clearAll };
}

/**
 * Central nudge definitions — used across Money Snapshot.
 * Each nudge has a stable `id` so dismissal persists across sessions.
 */
export const NUDGE_DEFINITIONS = [
  {
    id: "housing_high",
    type: "warn",
    condition: (m) => m.housingPct > 35,
    text: (m) => `Housing takes ${m.housingPct}% of your spend — above the 30% guideline. Consider whether your rent aligns with your income band.`,
  },
  {
    id: "housing_good",
    type: "success",
    condition: (m) => m.housingPct > 0 && m.housingPct <= 33,
    text: (m) => `Housing is well-managed at ${m.housingPct}% of spend — within healthy range for your income band.`,
  },
  {
    id: "savings_low",
    type: "warn",
    condition: (m) => m.savingsRate < 15 && m.gross > 0,
    text: (m) => `Savings rate is ${m.savingsRate}% — below the 15% minimum for wealth building. Even an extra R500/month compounds meaningfully over 5 years.`,
  },
  {
    id: "savings_good",
    type: "success",
    condition: (m) => m.savingsRate >= 20,
    text: (m) => `Saving ${m.savingsRate}% of gross income — above the 20% target. You're building wealth at a strong rate.`,
  },
  {
    id: "debt_high",
    type: "warn",
    condition: (m) => m.debtToIncome > 30,
    text: (m) => `Debt-to-income is ${m.debtToIncome}% — above the 30% caution threshold. High debt limits your ability to build wealth and qualify for a home loan.`,
  },
  {
    id: "disposable_tight",
    type: "warn",
    condition: (m) => m.disposable >= 0 && m.disposable < 2000 && m.gross > 0,
    text: (m) => `Disposable income is very tight at R${m.disposable.toLocaleString("en-ZA")}/month. One unexpected expense could cause financial stress.`,
  },
  {
    id: "disposable_negative",
    type: "warn",
    condition: (m) => m.disposable < 0,
    text: (m) => `Your obligations exceed take-home pay by R${Math.abs(m.disposable).toLocaleString("en-ZA")}. This is unsustainable — review your largest expenses urgently.`,
  },
  {
    id: "emergency_complete",
    type: "success",
    condition: (m) => m.emergencyMonths >= 3,
    text: (m) => `Emergency fund covers ${m.emergencyMonths} months of expenses — target met! 🎉 You're protected against unexpected events.`,
  },
  {
    id: "emergency_low",
    type: "warn",
    condition: (m) => m.emergencyMonths < 1 && m.gross > 0,
    text: () => `No meaningful emergency fund detected. Build at least 1 month of expenses before investing aggressively.`,
  },
  {
    id: "tax_bracket",
    type: "info",
    condition: (m) => m.marginalRate >= 31 && m.gross > 0,
    text: (m) => `You're in the ${m.marginalRate}% tax bracket. RA contributions reduce your taxable income — every R1 000 contributed saves you R${Math.round(1000 * m.marginalRate / 100).toLocaleString("en-ZA")} in tax.`,
  },
];