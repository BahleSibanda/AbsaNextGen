import { NavLink } from 'react-router-dom';
import "../styles/sideBar.css";

const navPages = [
  { label: "Money Snapshot",  to: "/snapshot",    icon: "◈", desc: "Dashboard" },
  { label: "Strategy Tracks", to: "/tracks",      icon: "◎", desc: "Your path" },
  { label: "Know Your Money", to: "/simulation",  icon: "◇", desc: "Simulations" },
  { label: "Learn",           to: "/learn",       icon: "◉", desc: "Education" },
  { label: "Profile",         to: "/profile",     icon: "◐", desc: "Settings" },
];

export default function SideBar() {
  const user    = JSON.parse(localStorage.getItem("nw_user") || "{}");
  const name    = user.name    || "You";
  const initials= name.slice(0,2).toUpperCase();
  const track   = user.track ? user.track.replace(/^[^\s]+\s/,"") : "Property Builder";

  return (
    <aside className="nw-sidebar">
      {/* logo */}
      <div className="nw-logo">
        <div className="nw-logo-mark">A</div>
        <div>
          <span className="nw-logo-name">absa</span>
          <span className="nw-logo-tag">nextgen</span>
        </div>
      </div>

      {/* user card */}
      <div className="nw-user-card">
        <div className="nw-avatar">{initials}</div>
        <div className="nw-user-text">
          <p className="nw-user-name">{name}</p>
          <p className="nw-user-track">{track}</p>
        </div>
        <div className="nw-status" />
      </div>

      {/* nav */}
      <nav className="nw-nav">
        <p className="nw-nav-label">Navigation</p>
        {navPages.map((p) => (
          <NavLink key={p.to} to={p.to}
            className={({ isActive }) => `nw-nav-item${isActive ? " active" : ""}`}>
            <span className="nw-nav-icon">{p.icon}</span>
            <div className="nw-nav-text">
              <span className="nw-nav-main">{p.label}</span>
              <span className="nw-nav-desc">{p.desc}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* footer progress */}
      <div className="nw-sidebar-footer">
        <div className="nw-progress-card">
          <div className="nw-progress-head">
            <span className="nw-progress-title">First Five Years</span>
            <span className="nw-progress-pct">Year 1</span>
          </div>
          <div className="nw-progress-track">
            <div className="nw-progress-fill" style={{ width:"20%" }} />
          </div>
          <p className="nw-progress-sub">4 years remaining on your journey</p>
        </div>
        <NavLink to="/" className="nw-logout">
          <span>⏻</span> Log out
        </NavLink>
      </div>
    </aside>
  );
}