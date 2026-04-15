import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuth from "../context/authContext";
import "../styles/navbar.css";

const Layout = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <Navbar />
        <main className="app-shell__page">
          <div className="app-shell__page-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;