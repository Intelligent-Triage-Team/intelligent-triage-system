import { useState } from "react";
import { Link } from "react-router-dom";

function EmergencyTriage() {
  const [triageData, setTriageData] = useState({
    chiefComplaint: "",
    painLevel: "",
    consciousness: "alert",
    breathing: "normal",
    bleeding: "none",
    symptoms: []
  });
  const [triageResult, setTriageResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const emergencySymptoms = [
    "Chest pain", "Difficulty breathing", "Severe bleeding", "Loss of consciousness",
    "Severe headache", "Slurred speech", "Weakness/numbness", "Vision changes",
    "High fever", "Seizures", "Broken bones", "Burns"
  ];

  const handleSymptomToggle = (symptom) => {
    setTriageData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const calculateTriage = () => {
    if (!triageData.chiefComplaint) {
      alert("Please describe your chief complaint");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      let priority = "Low";
      let waitTime = "2-4 hours";
      let color = "success";
      let urgency = "Non-urgent";

      // Triage algorithm
      if (triageData.consciousness === "unconscious" || 
          triageData.breathing === "severe" || 
          triageData.bleeding === "severe" ||
          triageData.symptoms.includes("Chest pain") ||
          triageData.symptoms.includes("Difficulty breathing") ||
          triageData.symptoms.includes("Loss of consciousness")) {
        priority = "Immediate";
        waitTime = "Immediate";
        color = "danger";
        urgency = "Life-threatening";
      } else if (triageData.painLevel === "severe" ||
                 triageData.breathing === "moderate" ||
                 triageData.bleeding === "moderate" ||
                 triageData.symptoms.includes("Severe headache") ||
                 triageData.symptoms.includes("Slurred speech") ||
                 triageData.symptoms.includes("Seizures") ||
                 triageData.symptoms.includes("Broken bones")) {
        priority = "Urgent";
        waitTime = "30-60 minutes";
        color = "warning";
        urgency = "Serious";
      } else if (triageData.painLevel === "moderate" ||
                 triageData.symptoms.length >= 3) {
        priority = "Priority";
        waitTime = "1-2 hours";
        color = "info";
        urgency = "Moderate";
      }

      setTriageResult({
        priority: priority,
        waitTime: waitTime,
        color: color,
        urgency: urgency,
        timestamp: new Date().toLocaleString(),
        recommendations: getRecommendations(priority),
        emergencyActions: getEmergencyActions(priority)
      });

      setIsProcessing(false);
    }, 2000);
  };

  const getRecommendations = (priority) => {
    const recommendations = {
      "Immediate": [
        "Call emergency services immediately (911 or local emergency number)",
        "Do not move the patient unless necessary",
        "Keep the patient warm and comfortable",
        "Monitor breathing and consciousness continuously"
      ],
      "Urgent": [
        "Seek emergency medical care within 1 hour",
        "Have someone drive you to emergency department",
        "Avoid eating or drinking until examined",
        "Bring list of current medications"
      ],
      "Priority": [
        "Visit emergency department or urgent care within 2 hours",
        "Avoid strenuous activity",
        "Monitor symptoms for changes",
        "Contact primary care physician for guidance"
      ],
      "Low": [
        "Schedule appointment with primary care physician",
        "Monitor symptoms at home",
        "Rest and stay hydrated",
        "Over-the-counter medications may help"
      ]
    };
    return recommendations[priority] || [];
  };

  const getEmergencyActions = (priority) => {
    const actions = {
      "Immediate": [
        "Call 911 NOW",
        "Check airway, breathing, circulation",
        "Begin CPR if necessary",
        "Control bleeding with direct pressure"
      ],
      "Urgent": [
        "Go to nearest emergency department",
        "Avoid driving if severely ill",
        "Bring medications and medical history",
        "Call ahead if possible"
      ],
      "Priority": [
        "Contact doctor for guidance",
        "Prepare medical information",
        "Arrange transportation",
        "Monitor vital signs"
      ],
      "Low": [
        "Self-care at home",
        "Monitor symptoms",
        "Contact doctor if worsens",
        "Rest and fluids"
      ]
    };
    return actions[priority] || [];
  };

  const resetTriage = () => {
    setTriageData({
      chiefComplaint: "",
      painLevel: "",
      consciousness: "alert",
      breathing: "normal",
      bleeding: "none",
      symptoms: []
    });
    setTriageResult(null);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle p-4 mb-3">
              <i className="fas fa-ambulance fa-3x text-danger"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Emergency Triage System</h1>
            <p className="lead text-muted">
              Quick emergency assessment to determine medical priority and appropriate care level
            </p>
          </div>

          {/* Emergency Hotline */}
          <div className="alert alert-danger mb-4 text-center">
            <h5 className="alert-heading mb-2">
              <i className="fas fa-phone-alt me-2"></i>Emergency Hotline
            </h5>
            <div className="display-6 fw-bold">911</div>
            <p className="mb-0">Call immediately for life-threatening emergencies</p>
          </div>

          {/* Triage Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-clipboard-check me-2"></i>Emergency Assessment
              </h5>

              {/* Chief Complaint */}
              <div className="mb-4">
                <label className="form-label">Chief Complaint *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Briefly describe your main medical concern..."
                  value={triageData.chiefComplaint}
                  onChange={(e) => setTriageData({...triageData, chiefComplaint: e.target.value})}
                ></textarea>
              </div>

              {/* Vital Signs */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Pain Level</label>
                  <select
                    className="form-select"
                    value={triageData.painLevel}
                    onChange={(e) => setTriageData({...triageData, painLevel: e.target.value})}
                  >
                    <option value="">Select level</option>
                    <option value="none">No pain</option>
                    <option value="mild">Mild (1-3/10)</option>
                    <option value="moderate">Moderate (4-6/10)</option>
                    <option value="severe">Severe (7-10/10)</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Consciousness</label>
                  <select
                    className="form-select"
                    value={triageData.consciousness}
                    onChange={(e) => setTriageData({...triageData, consciousness: e.target.value})}
                  >
                    <option value="alert">Alert</option>
                    <option value="drowsy">Drowsy</option>
                    <option value="confused">Confused</option>
                    <option value="unconscious">Unconscious</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Breathing</label>
                  <select
                    className="form-select"
                    value={triageData.breathing}
                    onChange={(e) => setTriageData({...triageData, breathing: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="rapid">Rapid</option>
                    <option value="difficult">Difficult</option>
                    <option value="severe">Severe distress</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Bleeding</label>
                  <select
                    className="form-select"
                    value={triageData.bleeding}
                    onChange={(e) => setTriageData({...triageData, bleeding: e.target.value})}
                  >
                    <option value="none">None</option>
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              {/* Symptoms Checklist */}
              <div className="mb-4">
                <label className="form-label">Additional Symptoms</label>
                <div className="row">
                  {emergencySymptoms.map((symptom, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`symptom-${index}`}
                          checked={triageData.symptoms.includes(symptom)}
                          onChange={() => handleSymptomToggle(symptom)}
                        />
                        <label className="form-check-label" htmlFor={`symptom-${index}`}>
                          {symptom}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-danger btn-lg"
                  onClick={calculateTriage}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing Triage...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-medkit me-2"></i>
                      Calculate Triage Priority
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {triageResult && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>Triage Results
                  </h5>
                  <button className="btn btn-outline-sm btn-outline-secondary" onClick={resetTriage}>
                    <i className="fas fa-redo me-1"></i>New Assessment
                  </button>
                </div>

                {/* Priority Badge */}
                <div className="text-center mb-4">
                  <div className={`badge bg-${triageResult.color} p-3 fs-4`}>
                    {triageResult.priority} Priority
                  </div>
                  <div className="mt-2">
                    <strong>Estimated Wait Time:</strong> {triageResult.waitTime}
                  </div>
                </div>

                {/* Urgency Level */}
                <div className={`alert alert-${triageResult.color}`}>
                  <h6 className="alert-heading">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Urgency Level: {triageResult.urgency}
                  </h6>
                </div>

                {/* Recommendations */}
                <div className="mb-4">
                  <h6 className="mb-3">Recommended Actions</h6>
                  <ul className="list-group list-group-flush">
                    {triageResult.recommendations.map((rec, index) => (
                      <li key={index} className="list-group-item">
                        <i className="fas fa-check-circle text-success me-2"></i>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency Actions */}
                {triageResult.priority === "Immediate" && (
                  <div className="alert alert-danger">
                    <h6 className="alert-heading">
                      <i className="fas fa-ambulance me-2"></i>Emergency Actions Required
                    </h6>
                    <ul className="mb-0">
                      {triageResult.emergencyActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center mt-4">
                  {triageResult.priority === "Immediate" ? (
                    <button className="btn btn-danger btn-lg me-2" onClick={() => window.location.href = 'tel:911'}>
                      <i className="fas fa-phone-alt me-2"></i>Call 911 Now
                    </button>
                  ) : (
                    <Link to="/contact" className="btn btn-primary btn-lg me-2">
                      <i className="fas fa-hospital me-2"></i>Find Hospital
                    </Link>
                  )}
                  <Link to="/services/ai-diagnosis" className="btn btn-outline-primary">
                    <i className="fas fa-brain me-2"></i>AI Diagnosis
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="alert alert-warning mt-4">
            <h6 className="alert-heading">
              <i className="fas fa-info-circle me-2"></i>Important Notice
            </h6>
            <p className="mb-0">
              This triage system is for initial assessment only. If your condition worsens or you have any doubts, 
              seek immediate medical attention. When in doubt, always call emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyTriage;
