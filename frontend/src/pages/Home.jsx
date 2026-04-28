import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // const user = JSON.parse(localStorage.getItem("user"));
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

  const goToDashboard = () => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/predict");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out");
    navigate("/login");
  };
 const cardStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  width: "260px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center"
};
const whyCard = {
  maxWidth: "250px",
  textAlign: "center"
};

  return (
  <div>

    {/* HERO SECTION */}
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "50px",
        background: "linear-gradient(90deg, #2c3e50, #1abc9c)",
        color: "white"
      }}
    >

      {/* LEFT SIDE (TEXT + BUTTONS) */}
      <div style={{ maxWidth: "500px", marginLeft: "40px" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
          Smart Patient Triage System
        </h1>

        <p style={{ fontSize: "18px", marginBottom: "25px" }}>
          AI-powered healthcare system that prioritizes patients based on urgency and improves hospital efficiency.
        </p>

        <button
  // onClick={token ? goToDashboard : () => navigate("/login")}
  onClick={() => navigate(token ? "/predict" : "/login")}
  style={{
    background: "#1abc9c",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    marginTop: "10px"
  }}
>
  {token ? "Go to Dashboard" : "Start Triage"}
</button>
{!token && (
  <p style={{ marginTop: "10px", fontSize: "14px" }}>
    Don't have an account?{" "}
    <span
      onClick={() => navigate("/signup")}
      style={{
        color: "#1abc9c",
        cursor: "pointer",
        fontWeight: "600"
      }}
    >
      Signup
    </span>
  </p>
)}
      </div>
      {/* FEATURES SECTION */}


      {/* RIGHT SIDE (IMAGE) */}
      <div>
      <img
  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80"
  alt="hospital"
  style={{
    width: "450px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
  }}
/>
      </div>

    </div>
    
<div
  style={{
    background: "#f4f6f8",
    padding: "60px 20px",
    textAlign: "center"
  }}
>
  <h2 style={{ marginBottom: "40px", color: "#2c3e50" }}>
    Our Services
  </h2>

 <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
    marginTop: "30px"
  }}
>
  {/* CARD 1 */}
  <div style={cardStyle} className="service-card">
    <div style={{ fontSize: "40px", marginBottom: "10px" }}>🧠</div>
    <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>
      AI Triage
    </h3>
    <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>
      Automatically classify patients based on urgency using intelligent algorithms.
    </p>
  </div>

  {/* CARD 2 */}
  <div style={cardStyle} className="service-card">
    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📅</div>
    <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>
      Appointment Scheduling
    </h3>
    <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>
      Efficiently book and manage doctor appointments in real time.
    </p>
  </div>

  {/* CARD 3 */}
  <div style={cardStyle} className="service-card">
    <div style={{ fontSize: "40px", marginBottom: "10px" }}>👨‍⚕️</div>
    <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>
      Doctor Management
    </h3>
    <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.6" }}>
      Organize doctors, availability, and patient assignments seamlessly.
    </p>
  </div>
</div>
</div>
{/* WHY CHOOSE US */}
<div
  style={{
    padding: "60px 20px",
    background: "white",
    textAlign: "center"
  }}
>
  <h2 style={{ marginBottom: "40px", color: "#2c3e50" }}>
    Why Choose Us
  </h2>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "40px",
      flexWrap: "wrap"
    }}
  >
    <div style={whyCard}>
      <div style={{ fontSize: "35px" }}>⚡</div>
      <h3>Fast Decision Making</h3>
      <p>Instant patient classification reduces waiting time.</p>
    </div>

    <div style={whyCard}>
      <div style={{ fontSize: "35px" }}>🤖</div>
      <h3>AI Powered</h3>
      <p>Uses intelligent models to improve accuracy.</p>
    </div>

    <div style={whyCard}>
      <div style={{ fontSize: "35px" }}>🏥</div>
      <h3>Hospital Efficiency</h3>
      <p>Optimizes doctor workload and patient flow.</p>
    </div>
  </div>
</div>
{/* FOOTER */}
<div
  style={{
    background: "#2c3e50",
    color: "white",
    padding: "30px 20px",
    textAlign: "center",
    marginTop: "40px"
  }}
>
  <h3 style={{ marginBottom: "10px" }}>
    Healthcare Triage System
  </h3>

  <p style={{ fontSize: "14px", color: "#ccc" }}>
    Improving patient care with AI-powered decision support.
  </p>

  <p style={{ marginTop: "15px", fontSize: "13px", color: "#aaa" }}>
    © 2026 All Rights Reserved
  </p>
</div>
  </div>
);
}

export default Home;