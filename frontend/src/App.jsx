import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";   // ADD THIS
import "./App.css";
import API from "./api/api";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PatientForm from "./pages/PatientForm";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResultPage from "./pages/patientdb/ResultPage";
import HistoryPage from "./pages/patientdb/HistoryPage";
import ProfilePage from "./pages/patientdb/ProfilePage";
import AddDoctor from "./pages/doctor/AddDoctor";
import EditDoctor from "./pages/doctor/EditDoctor";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import ServicesPortal from "./pages/ServicesPortal";
// import Header from "./components/Header";
function App() {

  // ADD HERE
  const [scrolled, setScrolled] = useState(false);
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setUser(null);
  setNotifications([]);   // ✅ clear notifications
  setShowNotif(false);    // ✅ close dropdown
};
const fetchNotifications = async () => {
  try {
    const res = await API.get("/notifications", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setNotifications(res.data);

  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
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


  fetchNotifications(); // ✅ CALL HERE

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
const [notifications, setNotifications] = useState([]);
const [showNotif, setShowNotif] = useState(false);
  // RETURN STARTS HERE
  return (
    <div>
      <ToastContainer />
   <nav 
  className={`navbar ${scrolled ? "navbar-scroll" : ""}`} 
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
minHeight: "60px"
  }}
>
{/* LEFT SIDE */}
<div
  style={{
    display: "flex",
    gap: "18px",
    alignItems: "center",
    fontSize: "17px",
    fontWeight: "800",
    fontWeight: "bold",
  }}
>
  <Link to="/">Home</Link>
  <Link to="/about">About</Link>
  <Link to="/services">Services</Link>
  <Link to="/contact">Contact</Link>
  <Link to="/services-portal">Services-portal</Link>
{/* <Link to="/about" style={linkStyle}>About</Link>
      <Link to="/services" style={linkStyle}>Services</Link>
      <Link to="/contact" style={linkStyle}>Contact</Link>
      <Link to="/services-portal" style={linkStyle}>Portal</Link> */}


  {user?.role === "patient" && (
    <>
      <Link to="/predict">New Check</Link>
      <Link to="/result">Result</Link>
      <Link to="/history">History</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/chatbot">Chatbot</Link>

    </>
  )}

  {user?.role === "doctor" && (
    <Link to="/doctor">Doctor Dashboard</Link>
  )}

  {user?.role === "admin" && (
    <Link to="/admin">Admin Dashboard</Link>
  )}
</div>

{/* RIGHT SIDE */}
<div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
  {!user && (
    <>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
    </>
  )}
  {/* 🔔 NOTIFICATION */}
  {user && (
  <div style={{ position: "relative" }}>
    <span 
      style={{ cursor: "pointer" }} 
      onClick={async () => {
        try {
          // await API.put("/notifications/read", {}, {
          //   headers: {
          //     Authorization: localStorage.getItem("token")
          //   }
          // });
        } catch (error) {
          console.error("Mark read error:", error);
        }

        fetchNotifications();
        setShowNotif(!showNotif);
      }}
    >
     <div style={{ position: "relative", display: "inline-block" }}>
  
  <span>🔔</span>

  {notifications.length > 0 && (
    <span style={{
      position: "absolute",
      top: "-5px",
      right: "-10px",
      background: "red",
      color: "white",
      borderRadius: "50%",
      padding: "2px 6px",
      fontSize: "12px"
    }}>
      {notifications.length}
    </span>
  )}

</div>
    </span>

    {showNotif && (
    <div style={{
  position: "absolute",
  top: "40px",
  right: "0",
  background: "#ffffff",
  borderRadius: "10px",
  padding: "10px 0",
  width: "280px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  zIndex: 1000,
  overflow: "hidden"
}}>
        {notifications.length === 0 ? (
          <p style={{ padding: "15px", textAlign: "center", color: "#888" }}>
  No notifications
</p>
        ) : (
         notifications.map((n) => (
  <div 
    key={n.id} 
    style={{ 
      padding: "10px 15px",
      borderBottom: "1px solid #f1f1f1",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background 0.2s",
      background: n.is_read ? "transparent" : "#d6ecff",
      borderLeft: n.is_read ? "none" : "4px solid #3498db",
      fontWeight: n.is_read ? "normal" : "600"
    }}

   onClick={async () => {
  try {
    await API.put(`/notifications/read/${n.id}`, {}, {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    // ✅ update UI instantly
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, is_read: true } : item
      )
    );

  } catch (error) {
    console.error("Error marking one notification:", error);
  }
}}

    onMouseEnter={(e) => e.currentTarget.style.background = "#f5f7fa"}
    onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? "transparent" : "#d6ecff"}
  >
    🔔 {n.message}
  </div>
))
        )}
      </div>
    )}
  </div>
  )}
  {/* LOGOUT */}
  {user && (
    <button onClick={logout}>Logout</button>
  )}

</div>
</nav>

      <h1>Patient Triage System</h1>

      <Routes>
    
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services-portal" element={<ServicesPortal />} />



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
  path="/add-doctor"
  element={
    <ProtectedRoute role="admin">
      <AddDoctor />
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
<Route
  path="/result"
  element={
    <ProtectedRoute role="patient">
      <ResultPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/history"
  element={
    <ProtectedRoute role="patient">
      <HistoryPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit-doctor/:id"
  element={
    <ProtectedRoute role="admin">
      <EditDoctor />
    </ProtectedRoute>
  }
/>
<Route
  path="/profile"
  element={
    <ProtectedRoute role="patient">
      <ProfilePage />
    </ProtectedRoute>
  }
/>
      </Routes>
      {user && <Chatbot />}
      <Footer />

    </div>
  );
}

export default App;