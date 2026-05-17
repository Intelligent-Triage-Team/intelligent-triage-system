import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import API from "./api/api";

import { FaBell } from "react-icons/fa";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import PatientForm from "./pages/PatientForm";
import VoiceChatbot from "./components/VoiceChatbot";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResultPage from "./pages/patientdb/ResultPage";
import HistoryPage from "./pages/patientdb/HistoryPage";
import AddDoctor from "./pages/doctor/AddDoctor";
import EditDoctor from "./pages/doctor/EditDoctor";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [scrolled, setScrolled] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined") return null;
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setNotifications([]);
    setShowNotif(false);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    if (localStorage.getItem("token") && user) {
      fetchNotifications();
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [user]);

  return (
    <div>
      <VoiceChatbot />
      <ToastContainer />

      {/* ================= NAVBAR ================= */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>

        {/* LEFT NAV */}
        <div className="nav-left">
            {/* LOGO */}
  <Link to="/" className="logo-link">
    <img src={logo} alt="Logo" className="logo" />
  </Link>
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/contact" className="nav-link">CONTACT</Link>
          <Link to="/services" className="nav-link">SERVICES</Link>

          {user?.role === "patient" && (
            <>
              <Link to="/predict" className="nav-link">NEW CHECK</Link>
              <Link to="/result" className="nav-link">RESULT</Link>
              <Link to="/history" className="nav-link">HISTORY</Link>
            </>
          )}

          {user?.role === "doctor" && (
            <Link to="/doctor" className="nav-link">DOCTOR DASHBOARD</Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="nav-link">ADMIN DASHBOARD</Link>
          )}
        </div>

        {/* RIGHT NAV */}
        <div className="nav-right">

          {!user && (
            <>
              <Link to="/login" className="nav-link">LOGIN</Link>
              <Link to="/signup" className="nav-link">SIGNUP</Link>
            </>
          )}

          {user && (
            <>
              {/* NOTIFICATIONS */}
              <div className="notif-wrapper">

                <div
                  className="notif-icon"
                  onClick={() => {
                    fetchNotifications();
                    setShowNotif(!showNotif);
                  }}
                >
                  <FaBell />

                  {notifications.length > 0 && (
                    <span className="notif-badge">
                      {notifications.length}
                    </span>
                  )}
                </div>

                {showNotif && (
                  <div className="notif-dropdown">
                    {notifications.length === 0 ? (
                      <p className="empty">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${n.is_read ? "" : "unread"}`}
                          onClick={async () => {
                            const token = localStorage.getItem("token");

                            await API.put(
                              `/notifications/read/${n.id}`,
                              {},
                              { headers: { Authorization: `Bearer ${token}` } }
                            );

                            setNotifications((prev) =>
                              prev.map((item) =>
                                item.id === n.id
                                  ? { ...item, is_read: true }
                                  : item
                              )
                            );
                          }}
                        >
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button className="logout-btn" onClick={logout}>
                LOGOUT
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ================= TITLE ================= */}
      <h1 className="page-title">Patient Triage System</h1>

      {/* ================= ROUTES ================= */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/predict" element={<ProtectedRoute role="patient"><PatientForm /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="/result" element={<ProtectedRoute role="patient"><ResultPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute role="patient"><HistoryPage /></ProtectedRoute>} />

        <Route path="/add-doctor" element={<ProtectedRoute role="admin"><AddDoctor /></ProtectedRoute>} />
        <Route path="/edit-doctor/:id" element={<ProtectedRoute role="admin"><EditDoctor /></ProtectedRoute>} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;