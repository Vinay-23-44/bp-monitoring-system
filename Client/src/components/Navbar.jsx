import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../context/authContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <nav className="topbar">
      <div className="topbar__inner">
        <div className="topbar__brand">
          <div className="topbar__brand-mark" aria-hidden="true" />
          <div>
            <p className="topbar__eyebrow">Health Monitoring</p>
            <h1 className="topbar__title">HealthApp</h1>
          </div>
        </div>

        <div className="topbar__actions">
          <div className="topbar__nav" aria-label="Primary">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `topbar__nav-link${isActive ? " topbar__nav-link--active" : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/assistance"
              className={({ isActive }) => `topbar__nav-link${isActive ? " topbar__nav-link--active" : ""}`}
            >
              Health Assistance
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `topbar__nav-link${isActive ? " topbar__nav-link--active" : ""}`}
            >
              Profile
            </NavLink>
          </div>
          <div className="topbar__user">
            <span className="topbar__user-label">Signed in as</span>
            <strong>{user?.name || user?.email || "User"}</strong>
          </div>
          <button type="button" onClick={handleLogout} className="topbar__button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;