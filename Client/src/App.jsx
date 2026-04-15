import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./context/authContext";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import Signin from "./Pages/Signin";
import ProfilePage from "./Pages/ProfilePage";
import AssistancePage from "./Pages/AssistancePage";
import Layout from "./layout/Layout";

const App = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/signin"} replace />}
      />
      <Route
        path="/signup"
        element={!isLoggedIn ? <Signup /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/signin"
        element={!isLoggedIn ? <Signin /> : <Navigate to="/dashboard" replace />}
      />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assistance" element={<AssistancePage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/signin"} replace />}
      />
    </Routes>
  );
};

export default App;