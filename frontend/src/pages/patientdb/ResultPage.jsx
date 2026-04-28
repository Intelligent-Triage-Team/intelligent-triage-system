import { useEffect, useState } from "react";
import API from "../../api/api";
// import { useLocation } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {

  // ✅ use data from navigation (no delay)
  if (location.state) {
    setResult(location.state.result);
    setAppointment(location.state.appointment);
    return;
  }

  // ✅ fallback (if page refreshed)
  const fetchData = async () => {
    try {
      const res = await API.get("/my-result", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      if (res.data) {
        setResult({
          predicted_disease: res.data.predicted_disease,
          triage_level:
            res.data.severity.charAt(0).toUpperCase() +
            res.data.severity.slice(1),
          confidence: res.data.prediction_confidence
        });

        setAppointment({
  appointment_id: res.data.appointment_id,
  doctor_name: res.data.doctor_name,
  appointment_time: res.data.appointment_date
});
      }

    } catch (error) {
      console.error(error);
    }
  };

  fetchData();

}, []);
if (!result) {
  return (
   <p style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
  ⏳ Analyzing your symptoms...
</p>
  );
}
  return (
  // <div className="container" style={{ display: "flex", justifyContent: "center" }}>
  <div
  className="container"
  style={{
    display: "flex",
    justifyContent: "center",
    background: "#f4f6f8",   // ✅ light gray background
    padding: "40px 0",       // ✅ spacing top/bottom
    minHeight: "100vh"       // ✅ full screen height
  }}
>

  <div style={{
    width: "100%",
    maxWidth: "600px",
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)"
  }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
  🏥 Patient Triage Result
</h2>
<hr style={{ marginBottom: "20px", opacity: "0.2" }} />

     {result && (
  <div style={{ marginTop: "25px" }}>

    {/* 🔥 Colored Box */}
   <div
  style={{
    padding: "20px",
    borderRadius: "10px",
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    background:
      result?.triage_level === "Emergency"
        ? "linear-gradient(135deg, #e74c3c, #c0392b)"
        : result?.triage_level === "Urgent"
        ? "linear-gradient(135deg, #f39c12, #e67e22)"
        : "linear-gradient(135deg, #2ecc71, #27ae60)",
  }}
>
      <div style={{ fontSize: "22px", marginBottom: "10px" }}>
  {result.triage_level === "Emergency" && "🚨"}
  {result.triage_level === "Urgent" && "⚠️"}
  {result.triage_level === "Normal" && "✅"}
</div>

<h3>Triage Level: {result.triage_level}</h3>

      <p>
        {result.triage_level === "Emergency" &&
          "Immediate medical attention required!"}

        {result.triage_level === "Urgent" &&
          "You should see a doctor soon."}

        {result.triage_level === "Normal" &&
          "No immediate risk, but monitor your condition."}
      </p>
    </div>

    <br />

<div style={{
  marginTop: "25px",
  padding: "15px",
  borderRadius: "8px",
  background: "#f9f9f9"
}}>
  <p><b>🧬 Disease:</b> {result.predicted_disease}</p>

  <p>
    <b>📊 Confidence:</b>{" "}
    {(result.confidence > 1
      ? result.confidence
      : result.confidence * 100
    ).toFixed(2)}%
  </p>
  <div style={{
  height: "8px",
  background: "#ddd",
  borderRadius: "5px",
  marginTop: "5px"
}}>
  <div style={{
    width: `${(result.confidence > 1
      ? result.confidence
      : result.confidence * 100)}%`,
    height: "100%",
    background: "#3498db",
    borderRadius: "5px"
  }} />
</div>
</div>
   {result.top3_predictions && (
  <div style={{ marginTop: "25px" }}>
    <h4 style={{ marginBottom: "10px" }}>
      🔍 Other Possible Diseases
    </h4>

    {result.top3_predictions
      .filter(item => item.disease !== result.predicted_disease)
      .map((item, index) => (
     <div
  key={index}
  style={{
    padding: "10px",
    marginBottom: "8px",
    borderRadius: "6px",
    background: "#f4f6f7",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.02)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  <span>{item.disease}</span>
  <span style={{ fontWeight: "600" }}>
    {item.prob}%
  </span>
</div>
      ))}
  </div>
)}
  </div>
)}

{!appointment && (
  <p style={{ marginTop: "20px", color: "red" }}>
    No appointment scheduled. Please try again later.
  </p>
)}

{appointment && (
<div style={{
  marginTop: "25px",
  padding: "20px",
  borderRadius: "10px",
  background: "#ecf5ff",
  borderLeft: "5px solid #3498db"
}}>
  <h3 style={{ marginBottom: "10px" }}>
    📅 Appointment Details
  </h3>

  <p><b>ID:</b> {appointment.appointment_id}</p>
  <p><b>Doctor:</b> {appointment.doctor_name}</p>

  <p>
    <b>Time:</b>{" "}
    {new Date(appointment.appointment_time).toLocaleString()}
  </p>

  <p style={{ color: "#2ecc71", fontWeight: "600" }}>
    ✔ Scheduled
  </p>
</div>
  
)}
<div style={{ marginTop: "30px", textAlign: "center" }}>

  <button
    onClick={() => navigate("/predict")}
    style={{
      padding: "10px 20px",
      marginRight: "10px",
      background: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    🔄 Check Again
  </button>

  <button
    onClick={() => navigate("/")}
    style={{
      padding: "10px 20px",
      background: "#2ecc71",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    🏠 Back Home
  </button>

</div>
    </div>
    </div>

  );
}

export default ResultPage;