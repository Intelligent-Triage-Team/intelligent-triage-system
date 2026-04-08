import { useState } from "react";
import API from "../api/api";


function PatientForm() {
  const [symptoms, setSymptoms] = useState("");
const [result, setResult] = useState(null);
const [appointment, setAppointment] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await API.post("/predict", {
      symptoms: symptoms
    });
console.log(response.data);
    setResult(response.data.prediction);
//     await API.post("/auto-schedule", {
//   triage_id: response.data.triage_id,
//   patient_id: 3
// });
const appointmentRes = await API.post("/auto-schedule", {
  triage_id: response.data.triage_id,
  patient_id: 3
});

setAppointment(appointmentRes.data);
    // setResult(response.data);
    // clear textarea after submit
setSymptoms("");

  } catch (error) {
    console.error(error);
alert("Something went wrong");
  }
};

return (
  <div className="container">
    <h2>Patient Symptom Form</h2>

      <form onSubmit={handleSubmit}>

        <textarea
          placeholder="Describe your symptoms..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />

        <br /><br />

        <button type="submit">Submit Symptoms</button>

      </form>
      
      {result && (
  <div style={{ marginTop: "20px" }}>
    <h3>Triage Result</h3>

    <p><b>Disease:</b> {result.predicted_disease}</p>
    <p><b>Triage Level:</b> {result.triage_level}</p>
    <p><b>Confidence:</b> {result.confidence}%</p>

  </div>
)}
{appointment && (
  <div style={{ marginTop: "20px" }}>
    <h3>Appointment Details</h3>

    <p><b>Appointment ID:</b> {appointment.appointment_id}</p>
<p><b>Doctor ID:</b> {appointment.doctor_id}</p>
<p><b>Time:</b> {appointment.appointment_time}</p>
<p><b>Status:</b> Scheduled</p>
  </div>
)}
    </div>
  );
}

export default PatientForm;