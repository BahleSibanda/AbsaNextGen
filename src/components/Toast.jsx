import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} />
      <ToastContext.Provider value={{ show }}>{children}</ToastContext.Provider>
    </>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 999 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            animation: "toastIn 0.3s ease",
            background: t.type === "success" ? "#0f1923" : t.type === "warn" ? "#fdf4e7" : "#eaf2fb",
            color: t.type === "success" ? "#fff" : t.type === "warn" ? "#633806" : "#0C447C",
            border: t.type === "success" ? "none" : t.type === "warn" ? "0.5px solid #EF9F27" : "0.5px solid #85b7eb",
          }}
        >
          {t.type === "success" && "✓  "}
          {t.type === "warn" && "⚠  "}
          {t.type === "info" && "ℹ  "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
