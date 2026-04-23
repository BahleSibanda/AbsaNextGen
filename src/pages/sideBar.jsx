import { NavLink } from 'react-router-dom';
import Search from "../components/Search";
import "../styles/sideBar.css";

const navPages = [
  { label: "Money Snapshot",  to: "/snapshot",   icon: "◈" },
  { label: "Strategy Tracks", to: "/tracks",      icon: "◎" },
  { label: "Know Your Money", to: "/simulation",  icon: "◇" },
  { label: "Learn",           to: "/learn",       icon: "◉" },
  { label: "Profile",         to: "/profile",     icon: "◐" },
];

export default function SideBar() {
  const user = JSON.parse(localStorage.getItem("nw_user") || "{}");
  const name = user.name || "You";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <aside className="nw-sidebar">
      <div className="nw-sidebar-glow" />

      <div className="nw-logo">
        <div className="nw-logo-icon">A</div>
        <div className="nw-logo-text">
          <span>absa</span>
          <small>nextgen</small>
        </div>
      </div>

      <div className="nw-user-block">
        <div className="nw-avatar">{initials}</div>
        <div className="nw-user-info">
          <p className="nw-user-name">{name}</p>
          <p className="nw-user-track">
            {user.track ? user.track.replace(/^[^\s]+\s/, "") : "Property Builder"}
          </p>
        </div>
        <div className="nw-status-dot" />
      </div>

      <div className="nw-sidebar-search">
        <Search />
      </div>

      <nav className="nw-nav">
        {navPages.map((page) => (
          <NavLink
            key={page.to}
            to={page.to}
            className={({ isActive }) =>
              `nw-nav-item${isActive ? " active" : ""}`
            }
          >
            <span className="nw-nav-icon">{page.icon}</span>
            <span className="nw-nav-label">{page.label}</span>
            <span className="nw-nav-arrow">›</span>
          </NavLink>
        ))}
      </nav>

      <div className="nw-sidebar-footer">
        <div className="nw-footer-card">
          <p className="nw-footer-title">First Five Years</p>
          <p className="nw-footer-sub">Your wealth journey starts here</p>
          <div className="nw-footer-bar">
            <div className="nw-footer-fill" style={{ width: "32%" }} />
          </div>
          <p className="nw-footer-pct">Year 1 of 5</p>
        </div>
        <NavLink to="/" className="nw-logout">
          <span>⏻</span> Log out
        </NavLink>
      </div>
    </aside>
  );
}