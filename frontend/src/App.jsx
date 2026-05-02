import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
import API from "./api/api";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PatientForm from "./pages/PatientForm";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResultPage from "./pages/patientdb/ResultPage";
import HistoryPage from "./pages/patientdb/HistoryPage";
import AddDoctor from "./pages/doctor/AddDoctor";
import EditDoctor from "./pages/doctor/EditDoctor";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./components/Chatbot";
import ImageAnalysis from "./components/ImageAnalysis";
import Footer from "./components/Footer";
import AIDiagnosis from "./pages/services/AIDiagnosis";
import EmergencyTriage from "./pages/services/EmergencyTriage";
import Telemedicine from "./pages/services/Telemedicine";
import PatientMonitoring from "./pages/services/PatientMonitoring";
import HealthAnalytics from "./pages/services/HealthAnalytics";
import MedicalResearch from "./pages/services/MedicalResearch";
import ServicesPortal from "./pages/ServicesPortal";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined") return null;
      return JSON.parse(storedUser);
    } catch (error) {
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
    navigate("/login");
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.get("/notifications", {
        headers: { Authorization: token }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`, {}, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  return (
    <div className="app-main" >
      <ToastContainer position="top-right" autoClose={3000}  />
      
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-brand">
            <span className="nav-logo-icon">🏥</span>
          ግዕዝ Intelligent Healthcare Triage System
          </Link>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact Us</Link>

          {user?.role === "patient" && (
            <>
              <Link to="/predict">New Check</Link>
              <Link to="/image-analysis">AI Injury Detection</Link>
              <Link to="/result">Result</Link>
              <Link to="/history">History</Link>
            </>
          )}

          {user?.role === "doctor" && <Link to="/doctor">Doctor Dashboard</Link>}
          {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        </div>

        <div className="nav-actions">
          {user && (
            <div className="notification-wrapper" style={{ position: 'relative', marginRight: '15px' }}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', position: 'relative' }}
              >
                🔔
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="notif-badge">{notifications.filter(n => !n.is_read).length}</span>
                )}
              </button>
              
              {showNotif && (
                <div className="notif-dropdown">
                  {notifications.length === 0 ? (
                    <p style={{ padding: '10px', color: '#666' }}>No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notif-item ${n.is_read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {!user ? (
            <>
              <Link to="/login" className="btn-login-outline">Login</Link>
              <Link to="/signup" className="btn-signup-fill">Signup</Link>
            </>
          ) : (
            <div className="user-profile">
              <span style={{ marginRight: '15px', color: 'var(--gray-300)' }}>{user.name}</span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </div>
          )}
        </div>
      </nav>

      <main className="content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ProtectedRoute><ServicesPortal /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/predict" element={<ProtectedRoute role="patient"><PatientForm /></ProtectedRoute>} />
          <Route path="/image-analysis" element={<ProtectedRoute role="patient"><ImageAnalysis /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute role="patient"><ResultPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute role="patient"><HistoryPage /></ProtectedRoute>} />
          
          <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/add-doctor" element={<ProtectedRoute role="admin"><AddDoctor /></ProtectedRoute>} />
          <Route path="/edit-doctor/:id" element={<ProtectedRoute role="admin"><EditDoctor /></ProtectedRoute>} />
          
          {/* Individual Service Routes - Still accessible for direct links */}
          <Route path="/services/ai-diagnosis" element={<ProtectedRoute><AIDiagnosis /></ProtectedRoute>} />
          <Route path="/services/emergency-triage" element={<ProtectedRoute><EmergencyTriage /></ProtectedRoute>} />
          <Route path="/services/telemedicine" element={<ProtectedRoute><Telemedicine /></ProtectedRoute>} />
          <Route path="/services/patient-monitoring" element={<ProtectedRoute><PatientMonitoring /></ProtectedRoute>} />
          <Route path="/services/health-analytics" element={<ProtectedRoute><HealthAnalytics /></ProtectedRoute>} />
          <Route path="/services/medical-research" element={<ProtectedRoute><MedicalResearch /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;