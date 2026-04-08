import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";   // ADD THIS
import "./App.css";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PatientForm from "./pages/PatientForm";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {

  // ADD HERE
  const [scrolled, setScrolled] = useState(false);
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null); // 🔥 updates navbar instantly
};
  // ADD HERE
  useEffect(() => {

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);
const token = localStorage.getItem("token");
const [user, setUser] = useState(() => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Invalid user in localStorage:", error);
    return null;
  }
});
  // RETURN STARTS HERE
  return (
    <div>

      {/* <nav className={`navbar ${scrolled ? "navbar-scroll" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/login">Login</Link>
        <Link to="/predict">Patient Form</Link>
        <Link to="/doctor">Doctor Dashboard</Link>
        <Link to="/admin">Admin Dashboard</Link>
      </nav> */}
   <nav className={`navbar ${scrolled ? "navbar-scroll" : ""}`}>

  <Link to="/">Home</Link>

  {!user && (
    <>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </>
  )}

  {user?.role === "patient" && (
    <Link to="/predict">Patient Dashboard</Link>
  )}

  {user?.role === "doctor" && (
    <Link to="/doctor">Doctor Dashboard</Link>
  )}

  {user?.role === "admin" && (
    <Link to="/admin">Admin Dashboard</Link>
  )}

  {user && (
    <button onClick={logout}>Logout</button>
  )}

</nav>

      <h1>Patient Triage System</h1>

      <Routes>
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
  path="/predict"
  element={
    <ProtectedRoute role="patient">
      <PatientForm />
    </ProtectedRoute>
  }
/>
       <Route
  path="/doctor"
  element={
    <ProtectedRoute role="doctor">
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>
        <Route
  path="/admin"
  element={
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
      </Routes>

    </div>
  );
}

export default App;