import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";


function PatientForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState([]);
// const [result, setResult] = useState(null);
// const [appointment, setAppointment] = useState(null);
useEffect(() => {
  
  const fetchData = async () => {
    try {
      const res = await API.get("/my-result", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      if (res.data) {
        // convert backend format → frontend format
        // setResult({
        //   predicted_disease: res.data.predicted_disease,
        //   triage_level: res.data.severity.charAt(0).toUpperCase() + res.data.severity.slice(1),
        //   confidence: res.data.prediction_confidence
        // });

        // setAppointment({
        //   appointment_id: res.data.appointment_id,
        //   doctor_id: res.data.doctor_id,
        //   appointment_time: res.data.appointment_date
        // });
      }
const historyRes = await API.get("/my-history", {
  headers: {
    Authorization: localStorage.getItem("token")
  }
});

setHistory(historyRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  fetchData();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!symptoms.trim()) {
    alert("Please enter symptoms");
    return;
  }

  if (loading) return; // prevent double click
setLoading(true);

  try {
    const response = await API.post(
      "/predict",
      { symptoms: symptoms },
      {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      }
    );

    // setResult(response.data.prediction);
    // setAppointment(response.data.appointment);

    if (response.data.notification) {
      toast.success(response.data.notification);
    }

    navigate("/result", {
      state: {
        result: response.data.prediction,
        appointment: response.data.appointment
      }
    });

    setSymptoms("");

  } catch (error) {

    if (error.response?.status === 400) {
      alert(error.response.data.message);
      navigate("/history");
    } else {
      console.error(error);
      alert("Please enter at least 3 symptoms before submitting.");
    }

  } finally {
    setLoading(false); // ✅ ALWAYS runs
  }
};
const symptomCount = symptoms
  .trim()
  .split(/[,\s]+/)
  .filter((s) => s !== "").length;

let confidenceMessage = "";
let confidenceColor = "";

if (symptomCount <= 2) {
  confidenceMessage = "Add at least 3 symptoms to generate a reliable prediction";
  confidenceColor = "#e74c3c";
} else if (symptomCount <= 5) {
  confidenceMessage = "Low confidence prediction";
  confidenceColor = "#f39c12";
} else if (symptomCount <= 8) {
  confidenceMessage = "Medium confidence prediction";
  confidenceColor = "#3498db";
} else {
  confidenceMessage = "High confidence prediction";
  confidenceColor = "#27ae60";
}
return (
  <div
  className="container"
  style={{
    display: "flex",
    justifyContent: "center",
    background: "#f4f6f8",   // ✅ light gray background
  }}
>
  
  <div style={{
    width: "100%",
    maxWidth: "500px",
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  }}>

    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
      Patient Symptom Form
    </h2>

    <form onSubmit={handleSubmit}>
       {loading && (
    <p style={{ color: "#3498db", marginBottom: "10px" }}>
      Processing your symptoms... please wait
    </p>
  )}

     <textarea
  disabled={loading}
  placeholder="Describe your symptoms..."
  value={symptoms}
  onChange={(e) => setSymptoms(e.target.value)}
  style={{
    width: "100%",
    height: "120px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
    outline: "none",
    transition: "all 0.2s ease"
  }}
  onFocus={(e) => {
    e.target.style.border = "1px solid #3498db";
    e.target.style.boxShadow = "0 0 5px rgba(52,152,219,0.3)";
  }}
  onBlur={(e) => {
    e.target.style.border = "1px solid #ccc";
    e.target.style.boxShadow = "none";
  }}
/>
{symptoms.trim() && (
  <div
    style={{
      marginTop: "10px",
      padding: "10px",
      borderRadius: "6px",
      background: confidenceColor,
      color: "white",
      fontWeight: "600",
      textAlign: "center"
    }}
  >
    {confidenceMessage}
  </div>
)}
<button
  type="submit"
  disabled={loading}
  style={{
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    background: loading ? "#95a5a6" : "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease"
  }}

  onMouseEnter={(e) => {
    if (loading) return; // ✅ prevent hover when loading
    e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
    e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
    e.currentTarget.style.background = "#2980b9";
  }}

  onMouseLeave={(e) => {
    if (loading) return; // ✅ prevent hover when loading
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.background = "#3498db";
  }}
>
  {loading ? "⏳ Processing..." : "Submit Symptoms"}
</button>

    </form>
  </div>

</div>
);
}

export default PatientForm;