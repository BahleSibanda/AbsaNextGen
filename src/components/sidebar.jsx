import { NavLink } from 'react-router-dom';
import "../styles/sideBar.css";

const navPages = [
  { label: "Money Snapshot",  to: "/Snapshot"   },
  { label: "Strategy Tracks", to: "/Tracks"      },
  { label: "Know Your Money", to: "/Simulation"  },
  { label: "Learn",           to: "/Learn"       },
  { label: "Profile",         to: "/Profile"     },
];

export default function SideBar() {
  return (
    <aside className="nw-sidebar">

      <div className="nw-logo">absa <span>|</span> nextgen</div>

      <div className="nw-user-block">
        <div className="nw-user-label">welcome back</div>
        <div className="nw-user-name">Sbu</div>
        <span className="nw-track-pill">Property Builder</span>
      </div>

      <nav>
        {navPages.map((page) => (
          <NavLink
            key={page.to}
            to={page.to}
            className={({ isActive }) =>
              isActive ? "nw-nav-item active" : "nw-nav-item"
            }
          >
            {page.label}
          </NavLink>
        ))}
      </nav>

      <div className="nw-nav-logout">Log out</div>

    </aside>
  );
}