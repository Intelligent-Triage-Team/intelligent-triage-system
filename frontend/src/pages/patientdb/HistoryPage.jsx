import { useEffect, useState } from "react";
import API from "../../api/api";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const cancelAppointment = async (id) => {
  try {
    const res = await API.put(`/appointment/${id}/cancel`, {}, {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    alert(res.data.message);

    // refresh history
   fetchHistory();

  } catch (error) {
    console.error(error);
    alert("Cancel failed");
  }
};
const fetchHistory = async () => {
  try {
    const res = await API.get("/my-history", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setHistory(res.data);

  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  fetchHistory();
}, []);

  return (
    
    <div
  className="container"
  style={{
    display: "flex",
    justifyContent: "center",
    background: "#f4f6f8",
    padding: "40px 0",
    minHeight: "100vh"
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
      <h2 style={{
  textAlign: "center",
  marginBottom: "20px",
  fontSize: "22px"
}}>
  Patient History
</h2>

      {history.length === 0 && (
  <p style={{
    textAlign: "center",
    color: "#777",
    marginTop: "20px"
  }}>
    📭 No history yet. Start a new check!
  </p>
)}

      {history.map((item, index) => (
        <div
  key={item.appointment_id || index}
  style={{
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
    background: "#ffffff",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    borderLeft:
    
      item.severity === "emergency"
        ? "5px solid #e74c3c"
        : item.severity === "urgent"
        ? "5px solid #f39c12"
        : "5px solid #2ecc71"
  }}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "";
}}
>
  
          <h4 style={{ marginBottom: "8px" }}>
  {item.severity === "emergency" && "🚨 "}
  {item.severity === "urgent" && "⚠️ "}
  {item.severity === "normal" && "✅ "}
  Triage Level: {item.severity.toUpperCase()}
</h4>

          <div style={{ marginTop: "10px" }}>
  <p><b>🧬 Disease:</b> {item.predicted_disease}</p>

  <p>
    <b>📊 Confidence:</b>{" "}
    {(item.prediction_confidence > 1
      ? item.prediction_confidence
      : item.prediction_confidence * 100
    ).toFixed(2)}%
  </p>
</div>

         <p>
  <b>Appointment:</b>{" "}
  {item.appointment_date
    ? new Date(item.appointment_date).toLocaleString()
    : "No appointment"}
</p>
          <p>
  <b>Triage Date:</b>{" "}
  {item.created_at
    ? new Date(item.created_at).toLocaleString()
    : "No Date"}
</p>

<p>
  <b>Status:</b>{" "}
  {item.appointment_status ? (
<span
  style={{
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
    background:
      item.appointment_status === "scheduled"
        ? "#d4edda"
        : "#f8d7da",
    color:
      item.appointment_status === "scheduled"
        ? "#2e7d32"
        : "#c0392b"
  }}
>
  {item.appointment_status}
</span>
  ) : (
    "No Appointment"
  )}
</p>
  <p><b>Doctor:</b> {item.doctor_name}</p>

{/* 👇 NEW WRAPPER */}
<div style={{
  marginTop: "10px",
  display: "flex",
  justifyContent: "flex-end"
}}>
  {item.appointment_id && item.appointment_status === "scheduled" && (
<button
  onClick={() => cancelAppointment(item.appointment_id)}
 style={{
  marginTop: "10px",
  padding: "8px 16px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  display: "inline-block",
  width: "auto",
  fontWeight: "600",
  transition: "all 0.2s ease"
}}
  onMouseEnter={(e) => {
  e.currentTarget.style.background = "#c0392b";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "#e74c3c";
}}
>
  Cancel
</button>
)}
</div>
        </div>

        
      ))}
      
    </div>
    </div>
  );
}

export default HistoryPage;