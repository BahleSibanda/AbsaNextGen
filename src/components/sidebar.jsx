import {NavLink} from 'react-router-dom';
import "../styles/sideBar.css";

const navPages = [
    { label: "Login",
        to:"/", 
    },
    { label: "Money Snapshot",
        to:"/Snapshot", 
    },  
    { label: "Strategy Tracks",
        to:"/Tracks", 
    },
    { label: "Know Your Money",
        to:"/Simulation", 
    },  
]

export default function SideBar() {
    return (
        <div className="sidebar">
            <h2>NextGen</h2>
            <nav>
               <ul>
                {navPages.map((page) => (
                    <NavLink 
                        key={page.to}
                        to={page.to}
                        className={({ isActive }) => 
                            isActive ? "nav-link active" : "nav-link"
                    }
                    >
                        {page.label}
                    </NavLink>
                ))}
                </ul>
            </nav>
            </div>
    );
}
            