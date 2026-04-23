import { useState } from "react";
import { useNavigate } from "react-router-dom";

const searchIndex = [
  { label: "Money Snapshot", route: "/snapshot", category: "Page" },
  { label: "Strategy Tracks", route: "/tracks", category: "Page" },
  { label: "Simulation Lab", route: "/simulation", category: "Page" },
  { label: "Learning Hub", route: "/learn", category: "Page" },
  { label: "Profile settings", route: "/profile", category: "Page" },
  { label: "Property vs renting", route: "/simulation", category: "Simulation" },
  { label: "Car vs invest", route: "/simulation", category: "Simulation" },
  { label: "Investment growth", route: "/simulation", category: "Simulation" },
  { label: "How income tax works", route: "/learn", category: "Article" },
  { label: "What is an ETF", route: "/learn", category: "Article" },
  { label: "Tax-free savings account", route: "/learn", category: "Article" },
  { label: "How home loans work", route: "/learn", category: "Article" },
  { label: "Emergency funds", route: "/learn", category: "Article" },
  { label: "50/30/20 rule", route: "/learn", category: "Article" },
  { label: "Offshore investing", route: "/learn", category: "Article" },
  { label: "Retirement annuity", route: "/learn", category: "Article" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const results =
    query.length > 1
      ? searchIndex.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
      : [];

  const go = (route) => {
    navigate(route);
    setQuery("");
    setFocused(false);
  };

  return (
    <div style={{ position: "relative", padding: "18px 20px 0 20px", marginBottom: 12 }}>
      <input
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "rgba(255,255,255,0.85)",
          border: "0.5px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          color: "#1a1612",
          fontSize: 14,
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
        placeholder="Search pages, tools, and tips..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />

      {focused && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 20,
            right: 20,
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
            zIndex: 50,
          }}
        >
          {results.map((result) => (
            <div
              key={result.label}
              onClick={() => go(result.route)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 14, color: "#1a1612" }}>{result.label}</span>
              <span style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {result.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
