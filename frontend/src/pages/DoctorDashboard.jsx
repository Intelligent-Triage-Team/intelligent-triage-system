import React, { useEffect, useState } from "react";
import API from "../api/api";

function DoctorDashboard() {

  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const patientsPerPage = 10;

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

    await API.post("/appointments", {
      patient_id: 3,
      doctor_id: 1,
      triage_id: triageId,
      appointment_date: "2026-03-15 10:00:00"
    });

    alert("Appointment scheduled successfully");

  } catch (error) {

    console.error(error);

  }

};
const indexOfLast = currentPage * patientsPerPage;
const indexOfFirst = indexOfLast - patientsPerPage;
const currentPatients = patients.slice(indexOfFirst, indexOfLast);
return (
  <div className="container">
    <h2>Doctor Triage Queue</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Disease</th>
            <th>Severity</th>
            <th>Confidence</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {currentPatients.map((p) => (
<tr key={p.triage_id} className={`row-${p.severity}`}>
  <td>{p.patient_name}</td>
  <td>{p.predicted_disease}</td>
<td>
  <span className={`badge ${p.severity}`}>
    {p.severity?.toUpperCase()}
  </span>
</td>

  <td>{p.prediction_confidence}%</td>

  <td>
    <button onClick={() => scheduleAppointment(p.triage_id)}>
      Schedule
    </button>
  </td>
</tr>
          ))}
        </tbody>

      </table>
<div style={{ marginTop: "20px" }}>
  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
    Previous
  </button>

  <span style={{ margin: "0 10px" }}>Page {currentPage}</span>

  <button onClick={() => setCurrentPage(currentPage + 1)}>
    Next
  </button>
</div>
    </div>
    
  );
}

export default DoctorDashboard;