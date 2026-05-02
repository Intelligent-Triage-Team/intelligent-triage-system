import { useEffect, useState } from "react";
import API from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (location.state) {
      setResult(location.state.result);
      setAppointment(location.state.appointment);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await API.get("/my-result", {
          headers: { Authorization: localStorage.getItem("token") }
        });

        if (res.data) {
          setResult({
            predicted_disease: res.data.predicted_disease,
            triage_level: res.data.severity.charAt(0).toUpperCase() + res.data.severity.slice(1),
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
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Analyzing your symptoms...</p>
        <style jsx>{`
          .loader-container { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Inter', sans-serif; }
          .spinner { width: 50px; height: 50px; border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          p { color: #64748b; font-size: 1.1rem; font-weight: 500; }
        `}</style>
      </div>
    );
  }

  const confidenceValue = (result.confidence > 1 ? result.confidence : result.confidence * 100).toFixed(2);
  
  const getSeverityStyles = (level) => {
    switch(level) {
      case "Emergency": return { bg: "linear-gradient(135deg, #ef4444, #b91c1c)", icon: "🚨", msg: "Immediate medical attention required!" };
      case "Urgent": return { bg: "linear-gradient(135deg, #f59e0b, #d97706)", icon: "⚠️", msg: "You should see a doctor soon." };
      default: return { bg: "linear-gradient(135deg, #10b981, #047857)", icon: "✅", msg: "No immediate risk, but monitor your condition." };
    }
  };

  const severityData = getSeverityStyles(result.triage_level);

  return (
    <div className="result-page">
      <div className="result-card">
        <header className="card-header">
          <h2>Patient Triage Result</h2>
          <p>AI-Powered Diagnostic Analysis</p>
        </header>

        <div className="severity-banner" style={{ background: severityData.bg }}>
          <div className="severity-icon">{severityData.icon}</div>
          <h3>Triage Level: {result.triage_level}</h3>
          <p>{severityData.msg}</p>
        </div>

        <div className="analysis-box">
          <div className="detail-row">
            <span className="label">🧬 Predicted Disease:</span>
            <span className="value primary">{result.predicted_disease}</span>
          </div>
          
          <div className="confidence-section">
            <div className="confidence-header">
              <span className="label">📊 AI Confidence:</span>
              <span className="value">{confidenceValue}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${confidenceValue}%` }}></div>
            </div>
          </div>
        </div>

        {result.top3_predictions && result.top3_predictions.length > 1 && (
          <div className="other-predictions">
            <h4>🔍 Other Possible Conditions</h4>
            <div className="prediction-list">
              {result.top3_predictions.filter(item => item.disease !== result.predicted_disease).map((item, index) => (
                <div key={index} className="prediction-item">
                  <span className="disease-name">{item.disease}</span>
                  <span className="disease-prob">{item.prob}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!appointment ? (
          <div className="appointment-alert error">
            <span className="icon">❌</span> No appointment scheduled. Please try again later.
          </div>
        ) : (
          <div className="appointment-box">
            <div className="appointment-header">
              <h3>📅 Appointment Details</h3>
              <span className="badge-scheduled">✔ Scheduled</span>
            </div>
            <div className="appointment-details">
              <div className="detail-item">
                <span className="label">Appointment ID:</span>
                <span className="value">#{appointment.appointment_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Assigned Doctor:</span>
                <span className="value">Dr. {appointment.doctor_name.split(' ').pop()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Scheduled Time:</span>
                <span className="value highlight">{new Date(appointment.appointment_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => navigate("/predict")}>🔄 Check Again</button>
          <button className="btn-primary" onClick={() => navigate("/")}>🏠 Back Home</button>
        </div>
      </div>

      <style jsx>{`
        .result-page { min-height: 100vh; background: #f8fafc; padding: 4rem 1rem; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: flex-start; }
        .result-card { width: 100%; max-width: 650px; background: white; padding: 2.5rem; border-radius: 24px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); animation: slideUp 0.5s ease-out; }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .card-header { text-align: center; margin-bottom: 2rem; }
        .card-header h2 { margin: 0; font-size: 2rem; color: #1e293b; font-weight: 800; }
        .card-header p { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; }

        .severity-banner { padding: 2rem; border-radius: 16px; color: white; text-align: center; margin-bottom: 2rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
        .severity-icon { font-size: 3rem; margin-bottom: 0.5rem; line-height: 1; }
        .severity-banner h3 { margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .severity-banner p { margin: 0; font-size: 1.05rem; opacity: 0.9; }

        .analysis-box { background: #f1f5f9; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .label { color: #64748b; font-weight: 600; font-size: 0.95rem; }
        .value { color: #1e293b; font-weight: 700; font-size: 1.1rem; }
        .value.primary { color: #3b82f6; font-size: 1.25rem; }
        
        .confidence-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .progress-bar-bg { height: 10px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 10px; transition: width 1s ease-in-out; }

        .other-predictions { margin-bottom: 2rem; }
        .other-predictions h4 { margin: 0 0 1rem 0; color: #475569; font-size: 1rem; }
        .prediction-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .prediction-item { display: flex; justify-content: space-between; padding: 1rem 1.25rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; transition: 0.2s; }
        .prediction-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #cbd5e1; }
        .disease-name { font-weight: 500; color: #334155; }
        .disease-prob { font-weight: 700; color: #64748b; }

        .appointment-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; }
        .appointment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .appointment-header h3 { margin: 0; color: #166534; font-size: 1.2rem; }
        .badge-scheduled { background: #dcfce7; color: #15803d; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
        
        .appointment-details { display: flex; flex-direction: column; gap: 0.75rem; }
        .detail-item { display: flex; justify-content: space-between; }
        .detail-item .value.highlight { color: #047857; }

        .appointment-alert.error { background: #fef2f2; color: #b91c1c; padding: 1rem; border-radius: 12px; text-align: center; font-weight: 500; margin-bottom: 2rem; }

        .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .action-buttons button { padding: 1rem; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.2s; border: none; }
        .btn-primary { background: #10b981; color: white; }
        .btn-primary:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .btn-secondary { background: #3b82f6; color: white; }
        .btn-secondary:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
      `}</style>
    </div>
  );
}

export default ResultPage;