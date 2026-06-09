import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a logging service
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px 24px",
        textAlign: "center",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f0ebe8",
      }}>
        <div style={{
          background: "rgba(200,16,46,0.08)",
          border: "0.5px solid rgba(200,16,46,0.3)",
          borderRadius: 20,
          padding: "40px 48px",
          maxWidth: 480,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#f0ebe8",
            marginBottom: 10,
          }}>
            Something went wrong
          </h2>
          <p style={{
            fontSize: 14,
            color: "rgba(240,235,232,0.55)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}>
            This section encountered an error and couldn't load.
            Your data is safe — try refreshing or resetting this view.
          </p>
          {this.state.error && (
            <p style={{
              fontSize: 11,
              color: "rgba(200,16,46,0.7)",
              fontFamily: "monospace",
              background: "rgba(200,16,46,0.06)",
              padding: "8px 12px",
              borderRadius: 8,
              marginBottom: 24,
              wordBreak: "break-word",
            }}>
              {this.state.error.message}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={this.handleReset}
              style={{
                background: "#C8102E",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => { localStorage.removeItem("nw_user"); window.location.href = "/"; }}
              style={{
                background: "transparent",
                color: "rgba(240,235,232,0.55)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Reset & go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}