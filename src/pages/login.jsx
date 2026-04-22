import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();           // stops page from refreshing on submit
    navigate("/Onboard");      
  };

  return (
    <div className="login-shell">

      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">absa <span>|</span> nextgen</div>
          <p className="login-tagline">your story matters</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Sign in to your NextGen Wealth Studio</p>

          <form onSubmit={handleLogin}>

            <div className="login-field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" required />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" required />
            </div>

            <p className="login-forgot">Forgot password?</p>

            <button type="submit" className="login-btn">
              Sign in
            </button>

          </form>

          <p className="login-register">
            Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </p>

        </div>
      </div>

    </div>
  );
}