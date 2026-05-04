import React, { useEffect, useState } from "react";
import API from "../api/api";

function DoctorDashboard() {

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [availability, setAvailability] = useState({
  available_from: "",
  available_to: ""
});
const [selectedPatient, setSelectedPatient] = useState(null);
const [showProfile, setShowProfile] = useState(false);
const [patientHistory, setPatientHistory] = useState([]);
const patientsPerPage = 5;
const [profileHistory, setProfileHistory] = useState([]);

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
const filteredPatients = patients.filter((p) => {
  const patientName = p.patient_name
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  const search = searchTerm
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  const matchesSearch = patientName.includes(search);

  const matchesSeverity =
    severityFilter === "all"
      ? true
      : p.severity?.toLowerCase() === severityFilter;

  return matchesSearch && matchesSeverity;
});

const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
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
const viewPatientProfile = async (patientId) => {
  try {
    const token = localStorage.getItem("token");

    const profileRes = await API.get(`/patient/${patientId}/profile`, {
      headers: { Authorization: token }
    });

    const triageRes = await API.get(`/patients/${patientId}/history`, {
      headers: { Authorization: token }
    });

    const historyRes = await API.get(`/patient/${patientId}/profile-history`, {
      headers: { Authorization: token }
    });

    setSelectedPatient(profileRes.data);
    setPatientHistory(triageRes.data);
    setProfileHistory(historyRes.data);

    setShowProfile(true);

  } catch (error) {
    console.error(error);
  }
};
const updateMedicalInfo = async () => {
  try {
    await API.put(
      `/patient/${selectedPatient.patient_id}/medical`,
      selectedPatient,
      {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      }
    );

    alert("Medical info updated successfully");

  } catch (error) {
    console.error(error);
    alert("Update failed");
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
  <div
    onClick={() => setSeverityFilter("emergency")}
    style={{
      cursor: "pointer",
      background: "#fdecea",
      color: "#c0392b",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow:
        severityFilter === "emergency"
          ? "0 0 0 3px #e74c3c"
          : "0 2px 6px rgba(0,0,0,0.05)"
    }}
  >
    🔴 <span>Emergency:</span>
    <strong>{patients.filter(p => p.severity === "emergency").length}</strong>
  </div>

  {/* Urgent */}
  <div
    onClick={() => setSeverityFilter("urgent")}
    style={{
      cursor: "pointer",
      background: "#fff4e5",
      color: "#e67e22",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow:
        severityFilter === "urgent"
          ? "0 0 0 3px #f39c12"
          : "0 2px 6px rgba(0,0,0,0.05)"
    }}
  >
    🟠 <span>Urgent:</span>
    <strong>{patients.filter(p => p.severity === "urgent").length}</strong>
  </div>

  {/* Normal */}
  <div
    onClick={() => setSeverityFilter("normal")}
    style={{
      cursor: "pointer",
      background: "#eafaf1",
      color: "#27ae60",
      padding: "12px 18px",
      borderRadius: "10px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow:
        severityFilter === "normal"
          ? "0 0 0 3px #27ae60"
          : "0 2px 6px rgba(0,0,0,0.05)"
    }}
  >
    🟢 <span>Normal:</span>
    <strong>{patients.filter(p => p.severity === "normal").length}</strong>
  </div>

  {/* Show All */}
  <button
    onClick={() => setSeverityFilter("all")}
    style={{
      cursor: "pointer",
      padding: "12px 18px",
      border: "none",
      borderRadius: "10px",
      fontWeight: "600",
      background: "#34495e",
      color: "white"
    }}
  >
    Show All
  </button>

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
<input
  type="text"
  placeholder="Search patient by name..."
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }}
  style={{
    padding: "10px",
    width: "300px",
    maxWidth: "100%",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>
<div style={{ overflowX: "auto", width: "100%" }}>
<table style={{
  width: "100%",
  minWidth: "900px",
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
<button
  onClick={() => viewPatientProfile(p.patient_id)}
  style={{
    background: "#8e44ad",
    color: "white",
    border: "none",
    padding: "6px",
    borderRadius: "5px"
  }}
>
  Detailes
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
    Page {currentPage} of {totalPages || 1}
  </span>

<button 
  onClick={() => setCurrentPage(currentPage + 1)}
  disabled={currentPage >= totalPages}
  style={{
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    background: currentPage >= totalPages ? "#95a5a6" : "#3498db",
    color: "white",
    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
    width: "120px"
  }}
>
  Next
</button>
</div>
{showProfile && selectedPatient && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  }}>
    <div style={{
      background: "white",
      padding: "25px",
      borderRadius: "12px",
      width: "900px",
      maxWidth: "95%",
      maxHeight: "90vh",
      overflowY: "auto"
    }}>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Patient Overview
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.3fr",
        gap: "25px"
      }}>

        {/* LEFT PROFILE */}
        <div>
          <h3>Profile</h3>
          <p><b>Name:</b> {selectedPatient.name}</p>
          <p><b>Email:</b> {selectedPatient.email}</p>
          <p><b>Age:</b> {selectedPatient.age}</p>
          <p><b>Gender:</b> {selectedPatient.gender}</p>
          <p><b>Blood:</b> {selectedPatient.blood_group || "-"}</p>
          <p><b>Weight:</b> {selectedPatient.weight || "-"}</p>
          <p><b>Height:</b> {selectedPatient.height || "-"}</p>
          <p><b>Allergies:</b> {selectedPatient.allergies || "-"}</p>
          <p><b>Chronic:</b> {selectedPatient.chronic_disease || "-"}</p>
          <p><b>Contact:</b> {selectedPatient.emergency_contact || "-"}</p>
          
          <div>
            <br /><br />
  <h3>Patient Info</h3>

  <p><b>Name:</b> {selectedPatient.name}</p>
  <p><b>Email:</b> {selectedPatient.email}</p>
  <p><b>Age:</b> {selectedPatient.age}</p>
  <p><b>Gender:</b> {selectedPatient.gender}</p>
  

  <hr style={{ margin: "15px 0" }} />

  <h3>Edit Medical Info</h3>

  <input
    placeholder="Blood Group"
    value={selectedPatient.blood_group || ""}
    onChange={(e) =>
      setSelectedPatient({
        ...selectedPatient,
        blood_group: e.target.value
      })
    }
  /><br /><br />

  <input
    placeholder="Weight"
    value={selectedPatient.weight || ""}
    onChange={(e) =>
      setSelectedPatient({
        ...selectedPatient,
        weight: e.target.value
      })
    }
  /><br /><br />

  <input
    placeholder="Height"
    value={selectedPatient.height || ""}
    onChange={(e) =>
      setSelectedPatient({
        ...selectedPatient,
        height: e.target.value
      })
    }
  /><br /><br />

  <input
    placeholder="Allergies"
    value={selectedPatient.allergies || ""}
    onChange={(e) =>
      setSelectedPatient({
        ...selectedPatient,
        allergies: e.target.value
      })
    }
  /><br /><br />

  <input
    placeholder="Chronic Disease"
    value={selectedPatient.chronic_disease || ""}
    onChange={(e) =>
      setSelectedPatient({
        ...selectedPatient,
        chronic_disease: e.target.value
      })
    }
  /><br /><br />

  <input
    placeholder="Emergency Contact"
    value={selectedPatient.emergency_contact || ""}
    onChange={(e) =>
      setSelectedPatient({
        ...selectedPatient,
        emergency_contact: e.target.value
      })
    }
  /><br /><br />

  <button onClick={updateMedicalInfo}>
    Save Medical Info
  </button>
</div>
<hr style={{ margin: "20px 0" }} />

<h3>Profile Update History</h3>

{profileHistory.length === 0 ? (
  <p>No profile changes found.</p>
) : (
  profileHistory.map((item, index) => (
    <div
      key={index}
      style={{
        background: "#f8f9fa",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "10px"
      }}
    >
      <p><b>Date:</b> {new Date(item.updated_at).toLocaleString()}</p>
      <p><b>Weight:</b> {item.weight || "-"}</p>
      <p><b>Height:</b> {item.height || "-"}</p>
      <p><b>Blood Group:</b> {item.blood_group || "-"}</p>
      <p><b>Allergies:</b> {item.allergies || "-"}</p>
    </div>
  ))
)}
        </div>
        

        {/* RIGHT HISTORY */}
        <div>
          <h3>History</h3>

          {patientHistory.length === 0 ? (
            <p>No history found.</p>
          ) : (
            patientHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "#f8f9fa",
                  borderLeft:
                    item.severity === "emergency"
                      ? "4px solid red"
                      : item.severity === "urgent"
                      ? "4px solid orange"
                      : "4px solid green"
                }}
              >
                <p><b>Disease:</b> {item.predicted_disease}</p>

<p>
  <b>Severity:</b>
  <span
    style={{
      marginLeft: "8px",
      padding: "4px 10px",
      borderRadius: "20px",
      color: "white",
      fontSize: "12px",
      fontWeight: "600",
      background:
        item.severity === "emergency"
          ? "#e74c3c"
          : item.severity === "urgent"
          ? "#f39c12"
          : "#27ae60"
    }}
  >
    {item.severity?.toUpperCase()}
  </span>
</p>

<p>
  <b>Confidence:</b>{" "}
  {(
    item.prediction_confidence > 1
      ? item.prediction_confidence
      : item.prediction_confidence * 100
  ).toFixed(2)}%
</p>

<p>
  <b>Appointment:</b>{" "}
  {item.appointment_date
    ? new Date(item.appointment_date).toLocaleString()
    : "-"}
</p>
              </div>
            ))
          )}
        </div>

      </div>

      <button
        onClick={() => setShowProfile(false)}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Close
      </button>

    </div>
  </div>
)}
    </div>
    
  );
}

export default DoctorDashboard;