import React, { useEffect, useState } from "react";
import API from "../api/api";

function DoctorDashboard() {

  const [patients, setPatients] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [availability, setAvailability] = useState({
  available_from: "",
  available_to: ""
});

const patientsPerPage = 10;
const completeCase = async (triageId) => {
  try {
    const token = localStorage.getItem("token");

    await API.put(`/triage/${triageId}/complete`, {}, {
      headers: {
        Authorization: token
      }
    });

    alert("Case marked as completed");

    fetchQueue(); // refresh table

  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  const fetchAvailability = async () => {
    try {
      const res = await API.get("/doctor/me", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      setAvailability(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  fetchAvailability();
}, []);
 useEffect(() => {
  fetchQueue();

  const interval = setInterval(() => {
    fetchQueue();
  }, 5000); // refresh every 5 seconds

  return () => clearInterval(interval);
}, []);

  const fetchQueue = async () => {
    try {

      const token = localStorage.getItem("token");

      const response = await API.get("/triage-queue", {
        headers: {
          Authorization: token
        }
      });

      const sortedPatients = response.data.sort((a, b) => {
  const priority = {
    emergency: 1,
    urgent: 2,
    normal: 3
  };

  return priority[a.severity] - priority[b.severity];
});

setPatients(sortedPatients);
setLastUpdated(new Date());


    } catch (error) {
      console.error(error);
    }
  };
const getSeverityColor = (severity) => {
  if (!severity) return "black";

  const level = severity.toLowerCase();

  if (level === "emergency") return "red";
  if (level === "urgent") return "orange";
  return "green";
};
const scheduleAppointment = async (triageId) => {
  try {
    const token = localStorage.getItem("token");

    await API.post(
      "/auto-schedule",
      { triage_id: triageId },
      {
        headers: {
          Authorization: token
        }
      }
    );

    alert("Appointment scheduled successfully");

    fetchQueue(); // refresh list

  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || "Error scheduling");
  }
};
const indexOfLast = currentPage * patientsPerPage;
const indexOfFirst = indexOfLast - patientsPerPage;
const currentPatients = patients.slice(indexOfFirst, indexOfLast);
const handleChange = (e) => {
  setAvailability({
    ...availability,
    [e.target.name]: e.target.value
  });
};
const [successMsg, setSuccessMsg] = useState("");

const updateAvailability = async () => {
  try {
    const res = await API.put(
      "/doctor/update-availability",
      availability,
      {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      }
    );

    setSuccessMsg("✅ Availability updated successfully");

    // auto hide after 3 sec
    setTimeout(() => setSuccessMsg(""), 3000);

  } catch (error) {
    console.error(error);
    setSuccessMsg("❌ Update failed");
  }
};
return (
  
  <div className="container">
    <h2>Doctor Triage Queue</h2>
    <p style={{ 
  color: "#777", 
  fontSize: "14px",
  marginBottom: "15px" 
}}>
  Last updated: {lastUpdated.toLocaleTimeString()}
</p>

<div style={{ 
  display: "flex", 
  gap: "15px", 
  marginBottom: "25px",
  flexWrap: "wrap"
}}>

  {/* Emergency */}
  <div style={{
    background: "#fdecea",
    color: "#c0392b",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  }}>
    🔴 <span>Emergency:</span> 
    <strong>{patients.filter(p => p.severity === "emergency").length}</strong>
  </div>

  {/* Urgent */}
  <div style={{
    background: "#fff4e5",
    color: "#e67e22",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  }}>
    🟠 <span>Urgent:</span> 
    <strong>{patients.filter(p => p.severity === "urgent").length}</strong>
  </div>

  {/* Normal */}
  <div style={{
    background: "#eafaf1",
    color: "#27ae60",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  }}>
    🟢 <span>Normal:</span> 
    <strong>{patients.filter(p => p.severity === "normal").length}</strong>
  </div>

</div>
<div className="container">
  <h2>Update Availability</h2>

  <label>From</label>
  <input
    type="time"
    name="available_from"
    value={availability.available_from}
    onChange={handleChange}
  />

  <label>To</label>
  <input
    type="time"
    name="available_to"
    value={availability.available_to}
    onChange={handleChange}
  />

  <button onClick={updateAvailability}>
    Update Availability
  </button>
  {successMsg && (
  <p style={{
    marginTop: "10px",
    color: successMsg.includes("❌") ? "red" : "green",
    fontWeight: "500"
  }}>
    {successMsg}
  </p>
)}
</div>
<div style={{ overflowX: "auto" }}>
      <table style={{
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 10px"
}}>
        <thead>
  <tr style={{ background: "#2c3e50", color: "white" }}>
    <th style={{ padding: "10px" }}>Patient</th>
    <th style={{ padding: "10px" }}>Disease</th>
    <th style={{ padding: "10px" }}>Severity</th>
    <th style={{ padding: "10px" }}>Confidence</th>
    <th style={{ padding: "10px" }}>Action</th>
  </tr>
</thead>

        <tbody>
          {currentPatients.map((p) => (
<tr 
  key={p.triage_id}
  style={{
    background:
      p.severity === "emergency"
        ? "#fff5f5"
        : p.severity === "urgent"
        ? "#fffaf0"
        : "white",
    borderLeft:
      p.severity === "emergency"
        ? "5px solid #e74c3c"
        : p.severity === "urgent"
        ? "5px solid #f39c12"
        : "5px solid transparent",

    transition: "all 0.2s ease"   // ✅ ADD THIS
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.01)";
    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";
  }}
>
  <td>{p.patient_name}</td>
  <td>{p.predicted_disease}</td>
<td>
<span style={{
  padding: "5px 10px",
  borderRadius: "20px",
  color: "white",
  fontWeight: "600",
  background:
    p.severity === "emergency"
      ? "#e74c3c"
      : p.severity === "urgent"
      ? "#f39c12"
      : "#27ae60"
}}>
  {p.severity?.toUpperCase()}
</span>
</td>

  <td>
  {(p.prediction_confidence > 1
    ? p.prediction_confidence
    : p.prediction_confidence * 100
  ).toFixed(2)}%
</td>

<td style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

  {p.appointment_status === "scheduled" && (
    <button
      disabled
      style={{
        background: "#7f8c8d",
        color: "white",
        border: "none",
        padding: "6px",
        borderRadius: "5px"
      }}
    >
      Scheduled
    </button>
  )}

  {p.appointment_status === "cancelled" && (
 <button
  onClick={() => scheduleAppointment(p.triage_id)}
  style={{
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "5px",
    transition: "all 0.2s ease"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  }}
>
  Schedule
</button>
  )}

  {!p.appointment_status && (
    <button
      onClick={() => scheduleAppointment(p.triage_id)}
      style={{
        background: "#3498db",
        color: "white",
        border: "none",
        padding: "6px",
        borderRadius: "5px"
      }}
    >
      Schedule
    </button>
  )}

  <button
    onClick={() => completeCase(p.triage_id)}
    disabled={p.status === "completed"}
    style={{
      background: p.status === "completed" ? "#95a5a6" : "#2ecc71",
      color: "white",
      border: "none",
      padding: "6px",
      borderRadius: "5px"
    }}
  >
    {p.status === "completed" ? "Completed" : "Complete"}
  </button>

</td>
</tr>

          ))}
          
        </tbody>

      </table>
      </div>
<div style={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  marginTop: "30px"
}}>
  <button 
    onClick={() => setCurrentPage(currentPage - 1)} 
    disabled={currentPage === 1}
    style={{
      padding: "10px 20px",
      borderRadius: "6px",
      border: "none",
      background: "#e74c3c",
      color: "white",
      cursor: "pointer",
      width: "120px"
    }}
  >
    Previous
  </button>

  <span style={{ fontWeight: "bold" }}>
    Page {currentPage}
  </span>

  <button 
    onClick={() => setCurrentPage(currentPage + 1)}
    style={{
      padding: "10px 20px",
      borderRadius: "6px",
      border: "none",
      background: "#3498db",
      color: "white",
      cursor: "pointer",
      width: "120px"
    }}
  >
    Next
  </button>
</div>
    </div>
    
  );
}

export default DoctorDashboard;