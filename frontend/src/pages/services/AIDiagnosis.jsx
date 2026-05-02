import { useState } from "react";
import { Link } from "react-router-dom";

function AIDiagnosis() {
  const [symptoms, setSymptoms] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    age: "",
    gender: "",
    medicalHistory: ""
  });
  const [diagnosis, setDiagnosis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDiagnosis = async () => {
    if (!symptoms || !patientInfo.age || !patientInfo.gender) {
      alert("Please fill in all required fields");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const possibleConditions = [
        { name: "Common Cold", probability: 85, severity: "Low" },
        { name: "Influenza", probability: 65, severity: "Medium" },
        { name: "COVID-19", probability: 45, severity: "High" },
        { name: "Allergies", probability: 30, severity: "Low" }
      ];

      setDiagnosis({
        timestamp: new Date().toLocaleString(),
        symptoms: symptoms,
        patientInfo: patientInfo,
        analysis: possibleConditions,
        recommendations: [
          "Rest and hydration",
          "Monitor temperature regularly",
          "Consult healthcare provider if symptoms worsen",
          "Consider over-the-counter medications for symptom relief"
        ],
        urgency: "Medium"
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetDiagnosis = () => {
    setSymptoms("");
    setPatientInfo({ age: "", gender: "", medicalHistory: "" });
    setDiagnosis(null);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-4 mb-3">
              <i className="fas fa-brain fa-3x text-primary"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3"> ግዕዝ Intelligent Diagnosis</h1>
            <p className="lead text-muted">
              Get instant AI-assisted medical diagnosis based on your symptoms and medical history
            </p>
          </div>

          {/* Diagnosis Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-user-md me-2"></i>Patient Information
              </h5>
              
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter your age"
                    value={patientInfo.age}
                    onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-select"
                    value={patientInfo.gender}
                    onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Medical History (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Any pre-existing conditions, medications, or allergies..."
                  value={patientInfo.medicalHistory}
                  onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label">Describe Your Symptoms *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Please describe your symptoms in detail (e.g., headache, fever, cough, fatigue...)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                ></textarea>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleDiagnosis}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-stethoscope me-2"></i>
                      Get  Diagnosis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {diagnosis && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-clipboard-list me-2"></i>Diagnosis Results
                  </h5>
                  <button className="btn btn-outline-sm btn-outline-secondary" onClick={resetDiagnosis}>
                    <i className="fas fa-redo me-1"></i>New Analysis
                  </button>
                </div>

                <div className="alert alert-info">
                  <small className="text-muted">Analysis completed on: {diagnosis.timestamp}</small>
                </div>

                {/* Possible Conditions */}
                <div className="mb-4">
                  <h6 className="mb-3">Possible Conditions</h6>
                  {diagnosis.analysis.map((condition, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-3 bg-light rounded">
                      <div>
                        <strong>{condition.name}</strong>
                        <div className="text-muted small">Severity: {condition.severity}</div>
                      </div>
                      <div className="text-end">
                        <div className="badge bg-primary">{condition.probability}%</div>
                        <div className="small text-muted">Probability</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="mb-4">
                  <h6 className="mb-3">Recommendations</h6>
                  <ul className="list-group list-group-flush">
                    {diagnosis.recommendations.map((rec, index) => (
                      <li key={index} className="list-group-item">
                        <i className="fas fa-check-circle text-success me-2"></i>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Urgency Level */}
                <div className={`alert ${
                  diagnosis.urgency === 'High' ? 'alert-danger' : 
                  diagnosis.urgency === 'Medium' ? 'alert-warning' : 'alert-info'
                }`}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Urgency Level: {diagnosis.urgency}</strong>
                  {diagnosis.urgency === 'High' && (
                    <div className="mt-2">
                      Please seek immediate medical attention from our healthcare professionals for further evaluation and treatment .
                    </div>
                  )}
                </div>

                <div className="text-center mt-4">
                  <Link to="/contact" className="btn btn-outline-primary me-2">
                    <i className="fas fa-phone me-1"></i>Contact Doctor
                  </Link>
                  <Link to="/emergency" className="btn btn-danger">
                    <i className="fas fa-ambulance me-1"></i>Emergency Services
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="alert alert-warning mt-4">
            <h6 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>Medical Disclaimer
            </h6>
            <p className="mb-0">
              This AI trained  diagnosis from your input and it is for informational purposes only and should not replace professional medical advice. 
              Always consult with a qualified healthcare provider for medical diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIDiagnosis;
