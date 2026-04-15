import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/assistance", label: "Health Assistance" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Navigation</div>
      <nav className="sidebar__nav" aria-label="Sidebar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;