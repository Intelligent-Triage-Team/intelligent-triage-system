import { useNavigate } from "react-router-dom";
import "./Home.css";

import {
  FaBrain,
  FaCalendarCheck,
  FaUserMd,
  FaBolt,
  FaRobot,
  FaHospital
} from "react-icons/fa";

function Home() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined") return null;
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user:", error);
      return null;
    }
  })();

  return (
    <div>

      {/* HERO */}
      <div className="hero">

        <div className="hero-left">
          <h1 className="hero-title">Smart Patient Triage System</h1>

          <p className="hero-text">
            AI-powered healthcare system that prioritizes patients based on urgency and improves hospital efficiency.
          </p>

          <button
            className="hero-btn"
            onClick={() => navigate(token ? "/predict" : "/login")}
          >
            {token ? "Go to Dashboard" : "Start Triage"}
          </button>

          {!token && (
            <p className="signup-text">
            Don't have an account?{" "} <a href="/signup" className="signup-link"> Signup</a></p>
          )}
        </div>

        <div>
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80"
            alt="hospital"
          />
        </div>

      </div>

      {/* SERVICES */}
      <div className="services-section">
        <h2 className="services-title">Our Services</h2>

        <div className="services-container">

          <div className="service-card">
            <div className="service-icon">
              <FaBrain />
            </div>
            <h3>AI Triage</h3>
            <p>
              Automatically classify patients based on urgency using intelligent algorithms.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaCalendarCheck />
            </div>
            <h3>Appointment Scheduling</h3>
            <p>
              Efficiently book and manage doctor appointments in real time.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FaUserMd />
            </div>
            <h3>Doctor Management</h3>
            <p>
              Organize doctors, availability, and patient assignments seamlessly.
            </p>
          </div>

        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="why-section">
        <h2 className="why-title">Why Choose Us</h2>

        <div className="why-container">

          <div className="why-card">
            <div className="why-icon">
              <FaBolt />
            </div>
            <h3>Fast Decision Making</h3>
            <p>Instant patient classification reduces waiting time.</p>
          </div>

          <div className="why-card">
            <div className="why-icon">
              <FaRobot />
            </div>
            <h3>AI Powered</h3>
            <p>Uses intelligent models to improve accuracy.</p>
          </div>

          <div className="why-card">
            <div className="why-icon">
              <FaHospital />
            </div>
            <h3>Hospital Efficiency</h3>
            <p>Optimizes doctor workload and patient flow.</p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Home;