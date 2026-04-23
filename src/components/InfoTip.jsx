import { useState } from "react";

export default function InfoTip({ term, definition }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 3, cursor: "default" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {term}
      <span style={{ fontSize: 11, color: "#C8102E", cursor: "help" }}>ⓘ</span>
      {visible && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f1923",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 10,
            width: 220,
            fontSize: 12,
            lineHeight: 1.5,
            zIndex: 50,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <strong style={{ display: "block", marginBottom: 4, color: "#EF9F27" }}>{term}</strong>
          {definition}
        </div>
      )}
    </span>
  );
}
