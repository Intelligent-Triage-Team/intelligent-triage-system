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
      alert("Something went wrong");
    }

  } finally {
    setLoading(false); //  ALWAYS runs
  }
};

  return (
    <div className="animate-fade-in">
      <div className="container">
        <div className="text-center mb-4">
          <h1>Patient Symptom Form</h1>
          <p className="text-muted">Describe your symptoms for AI-powered triage analysis</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="symptoms" className="form-label">
                  Describe Your Symptoms
                </label>
                <textarea
                  id="symptoms"
                  disabled={loading}
                  placeholder="Please describe your symptoms in detail. Include when they started, severity, and any other relevant information..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className={loading ? 'loading' : ''}
                />
                <div className="form-help">
                  Be as specific as possible to get the most accurate triage assessment.
                </div>
              </div>

              {loading && (
                <div className="text-center py-3">
                  <div className="loading-spinner me-2"></div>
                  <span className="text-muted">Processing your symptoms... please wait</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="btn btn-primary btn-lg btn-block hover-lift"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner me-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Symptoms
                    <span className="ms-2">{'>'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4">
              <div className="alert alert-info">
                <strong>Important:</strong> This is an AI-powered triage system. 
                For medical emergencies, please call emergency services immediately.
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h3>Recent History</h3>
          </div>
          <div className="card-body">
            {history.length === 0 ? (
              <p className="text-muted text-center">No previous symptom submissions</p>
            ) : (
              <div className="history-list">
                {history.slice(0, 3).map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="symptom-text">{item.symptoms}</div>
                        <small className="text-muted">
                          {new Date(item.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <span className={`badge badge-${item.severity}`}>
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientForm;