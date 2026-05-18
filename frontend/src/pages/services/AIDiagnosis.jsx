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
  const [consultationType, setConsultationType] = useState("medical"); // medical, emotional, mental, lifestyle
  const [emotionalState, setEmotionalState] = useState("");
  const [lifestyleFactors, setLifestyleFactors] = useState("");

  const handleDiagnosis = async () => {
    if (!patientInfo.age || !patientInfo.gender) {
      alert("Please fill in all required fields");
      return;
    }

    if (consultationType === "medical" && !symptoms) {
      alert("Please describe your symptoms for medical analysis");
      return;
    }

    if (consultationType === "emotional" && !emotionalState) {
      alert("Please describe how you're feeling emotionally");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis based on consultation type
    setTimeout(() => {
      let analysisData;
      
      if (consultationType === "medical") {
        const possibleConditions = [
          { name: "Common Cold", probability: 85, severity: "Low" },
          { name: "Influenza", probability: 65, severity: "Medium" },
          { name: "COVID-19", probability: 45, severity: "High" },
          { name: "Allergies", probability: 30, severity: "Low" }
        ];

        analysisData = {
          type: "medical",
          analysis: possibleConditions,
          recommendations: [
            "Rest and hydration",
            "Monitor temperature regularly",
            "Consult healthcare provider if symptoms worsen",
            "Consider over-the-counter medications for symptom relief"
          ],
          urgency: "Medium"
        };
      } else if (consultationType === "emotional") {
        const emotionalConditions = [
          { name: "Stress and Anxiety", probability: 75, severity: "Medium" },
          { name: "Mild Depression", probability: 45, severity: "Medium" },
          { name: "Burnout", probability: 60, severity: "Low" },
          { name: "Adjustment Difficulties", probability: 55, severity: "Low" }
        ];

        analysisData = {
          type: "emotional",
          analysis: emotionalConditions,
          recommendations: [
            "Practice deep breathing exercises for 5 minutes daily",
            "Consider journaling your thoughts and feelings",
            "Ensure you're getting 7-8 hours of quality sleep",
            "Try gentle physical activities like walking or yoga",
            "Connect with trusted friends or family members",
            "Limit social media and news consumption if it causes stress",
            "Consider speaking with a mental health professional"
          ],
          urgency: "Low"
        };
      } else if (consultationType === "mental") {
        const mentalConditions = [
          { name: "Generalized Anxiety", probability: 65, severity: "Medium" },
          { name: "Depressive Symptoms", probability: 50, severity: "Medium" },
          { name: "Sleep Disturbances", probability: 70, severity: "Low" },
          { name: "Cognitive Fatigue", probability: 55, severity: "Low" }
        ];

        analysisData = {
          type: "mental",
          analysis: mentalConditions,
          recommendations: [
            "Establish a consistent daily routine",
            "Practice mindfulness meditation for 10 minutes daily",
            "Break tasks into smaller, manageable steps",
            "Celebrate small achievements and progress",
            "Consider cognitive behavioral therapy techniques",
            "Maintain social connections and support systems",
            "Seek professional help if symptoms persist or worsen"
          ],
          urgency: "Low"
        };
      } else {
        // Lifestyle consultation
        const lifestyleFactors = [
          { name: "Poor Sleep Quality", probability: 70, severity: "Low" },
          { name: "Nutritional Imbalance", probability: 65, severity: "Low" },
          { name: "Sedentary Lifestyle", probability: 80, severity: "Medium" },
          { name: "Work-Life Imbalance", probability: 75, severity: "Medium" }
        ];

        analysisData = {
          type: "lifestyle",
          analysis: lifestyleFactors,
          recommendations: [
            "Aim for 7-9 hours of sleep per night",
            "Include more fruits and vegetables in your diet",
            "Take regular movement breaks every hour",
            "Stay hydrated with at least 8 glasses of water daily",
            "Practice time management and set boundaries",
            "Engage in hobbies and activities you enjoy",
            "Consider regular health check-ups and screenings"
          ],
          urgency: "Low"
        };
      }

      setDiagnosis({
        timestamp: new Date().toLocaleString(),
        consultationType: consultationType,
        symptoms: consultationType === "medical" ? symptoms : 
                  consultationType === "emotional" ? emotionalState :
                  consultationType === "mental" ? emotionalState : lifestyleFactors,
        patientInfo: patientInfo,
        ...analysisData
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetDiagnosis = () => {
    setSymptoms("");
    setPatientInfo({ age: "", gender: "", medicalHistory: "" });
    setDiagnosis(null);
    setEmotionalState("");
    setLifestyleFactors("");
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
            <h1 className="display-4 fw-bold mb-3"> ግዕዝ Comprehensive Health Assistant</h1>
            <p className="lead text-muted">
              Get personalized AI-assisted health guidance for medical symptoms, emotional well-being, mental health, and lifestyle advice
            </p>
          </div>

          {/* Consultation Type Selector */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-heart-pulse me-2"></i>Choose Your Health Concern
              </h5>
              
              <div className="row g-3">
                <div className="col-md-3 col-6 g-18">
                  <button
                    className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 ${
                      consultationType === "medical" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setConsultationType("medical")}
                  >
                    <i className="fas fa-stethoscope fa-2x mb-2"></i>
                    <span className="fw-bold">Medical</span>
                    <small className="d-none d-md-block">Physical symptoms & conditions</small>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 ${
                      consultationType === "emotional" ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => setConsultationType("emotional")}
                  >
                    <i className="fas fa-heart fa-2x mb-2"></i>
                    <span className="fw-bold">Emotional</span>
                    <small className="d-none d-md-block">Feelings & emotional state</small>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 ${
                      consultationType === "mental" ? "btn-info" : "btn-outline-info"
                    }`}
                    onClick={() => setConsultationType("mental")}
                  >
                    <i className="fas fa-brain fa-2x mb-2"></i>
                    <span className="fw-bold">Mental</span>
                    <small className="d-none d-md-block">Cognitive & psychological</small>
                  </button>
                </div>
                <div className="col-md-3 col-6">
                  <button
                    className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 ${
                      consultationType === "lifestyle" ? "btn-warning" : "btn-outline-warning"
                    }`}
                    onClick={() => setConsultationType("lifestyle")}
                  >
                    <i className="fas fa-spa fa-2x mb-2"></i>
                    <span className="fw-bold">Lifestyle</span>
                    <small className="d-none d-md-block">Daily habits & wellness</small>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-user-md me-2"></i>
                {consultationType === "medical" ? "Medical Information" :
                 consultationType === "emotional" ? "Emotional Assessment" :
                 consultationType === "mental" ? "Mental Health Assessment" : "Lifestyle Assessment"}
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
                <label className="form-label">
                  {consultationType === "medical" ? "Describe Your Symptoms *" :
                   consultationType === "emotional" ? "Describe Your Emotional State *" :
                   consultationType === "mental" ? "Describe Your Mental State *" : "Describe Your Lifestyle Factors *"}
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder={
                    consultationType === "medical" ? "Please describe your symptoms in detail (e.g., headache, fever, cough, fatigue...)" :
                    consultationType === "emotional" ? "How are you feeling emotionally? (e.g., stressed, anxious, sad, overwhelmed...)" :
                    consultationType === "mental" ? "Describe your mental state (e.g., difficulty concentrating, mood changes, sleep issues...)" :
                    "Describe your lifestyle habits (e.g., sleep patterns, diet, exercise, work-life balance...)"
                  }
                  value={consultationType === "medical" ? symptoms : consultationType === "lifestyle" ? lifestyleFactors : emotionalState}
                  onChange={(e) => {
                    if (consultationType === "medical") setSymptoms(e.target.value);
                    else if (consultationType === "emotional" || consultationType === "mental") setEmotionalState(e.target.value);
                    else setLifestyleFactors(e.target.value);
                  }}
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
                      <i className={`fas ${
                        consultationType === "medical" ? "fa-stethoscope" :
                        consultationType === "emotional" ? "fa-heart" :
                        consultationType === "mental" ? "fa-brain" : "fa-spa"
                      } me-2`}></i>
                      {consultationType === "medical" ? "Get Medical Analysis" :
                       consultationType === "emotional" ? "Get Emotional Support" :
                       consultationType === "mental" ? "Get Mental Health Guidance" : "Get Lifestyle Advice"}
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
                    <i className={`fas ${
                      diagnosis.type === "medical" ? "fa-stethoscope" :
                      diagnosis.type === "emotional" ? "fa-heart" :
                      diagnosis.type === "mental" ? "fa-brain" : "fa-spa"
                    } me-2`}></i>
                    {diagnosis.type === "medical" ? "Medical Analysis Results" :
                     diagnosis.type === "emotional" ? "Emotional Support Results" :
                     diagnosis.type === "mental" ? "Mental Health Assessment" : "Lifestyle Recommendations"}
                  </h5>
                  <button className="btn btn-outline-sm btn-outline-secondary" onClick={resetDiagnosis}>
                    <i className="fas fa-redo me-1"></i>New Analysis
                  </button>
                </div>

                <div className="alert alert-info">
                  <small className="text-muted">Analysis completed on: {diagnosis.timestamp}</small>
                </div>

                {/* Analysis Results */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    {diagnosis.type === "medical" ? "Possible Conditions" :
                     diagnosis.type === "emotional" ? "Emotional Assessment" :
                     diagnosis.type === "mental" ? "Mental Health Factors" : "Lifestyle Factors"}
                  </h6>
                  {diagnosis.analysis.map((condition, index) => (
                    <div key={index} className={`d-flex justify-content-between align-items-center mb-2 p-3 rounded ${
                      diagnosis.type === "medical" ? "bg-light" :
                      diagnosis.type === "emotional" ? "bg-success bg-opacity-10" :
                      diagnosis.type === "mental" ? "bg-info bg-opacity-10" : "bg-warning bg-opacity-10"
                    }`}>
                      <div>
                        <strong>{condition.name}</strong>
                        <div className="text-muted small">Severity: {condition.severity}</div>
                      </div>
                      <div className="text-end">
                        <div className={`badge bg-${
                          diagnosis.type === "medical" ? "primary" :
                          diagnosis.type === "emotional" ? "success" :
                          diagnosis.type === "mental" ? "info" : "warning"
                        }`}>{condition.probability}%</div>
                        <div className="small text-muted">Probability</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="mb-4">
                  <h6 className="mb-3">
                    {diagnosis.type === "medical" ? "Medical Recommendations" :
                     diagnosis.type === "emotional" ? "Emotional Support Strategies" :
                     diagnosis.type === "mental" ? "Mental Health Strategies" : "Lifestyle Improvements"}
                  </h6>
                  <ul className="list-group list-group-flush">
                    {diagnosis.recommendations.map((rec, index) => (
                      <li key={index} className="list-group-item">
                        <i className={`fas fa-check-circle text-${
                          diagnosis.type === "medical" ? "success" :
                          diagnosis.type === "emotional" ? "success" :
                          diagnosis.type === "mental" ? "info" : "warning"
                        } me-2`}></i>
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
                  {diagnosis.type === "medical" ? (
                    <>
                      <Link to="/contact" className="btn btn-outline-primary me-2">
                        <i className="fas fa-phone me-1"></i>Consult Doctor
                      </Link>
                      <Link to="/emergency" className="btn btn-danger">
                        <i className="fas fa-ambulance me-1"></i>Emergency Services
                      </Link>
                    </>
                  ) : diagnosis.type === "emotional" || diagnosis.type === "mental" ? (
                    <>
                      <Link to="/contact" className="btn btn-success me-2">
                        <i className="fas fa-user-md me-1"></i>Book Therapy Session
                      </Link>
                      <button className="btn btn-info" onClick={() => window.open('tel:988', '_blank')}>
                        <i className="fas fa-phone-alt me-1"></i>Crisis Helpline
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/contact" className="btn btn-outline-warning me-2">
                        <i className="fas fa-calendar-check me-1"></i>Wellness Consultation
                      </Link>
                      <button className="btn btn-warning">
                        <i className="fas fa-download me-1"></i>Download Health Plan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comprehensive Disclaimer */}
          <div className="alert alert-warning mt-4">
            <h6 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>Healthcare Disclaimer
            </h6>
            <p className="mb-2">
              <strong>Medical Analysis:</strong> This AI-trained diagnosis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for medical diagnosis and treatment.
            </p>
            <p className="mb-2">
              <strong>Emotional & Mental Health Support:</strong> While our AI provides helpful guidance, it's not a substitute for professional mental health services. If you're experiencing severe emotional distress, suicidal thoughts, or mental health crises, please contact emergency services or a mental health professional immediately.
            </p>
            <p className="mb-0">
              <strong>Lifestyle Advice:</strong> These recommendations are general wellness suggestions. Please consult healthcare professionals before making significant changes to your diet, exercise routine, or lifestyle, especially if you have pre-existing health conditions.
            </p>
            <hr className="my-2" />
            <small className="text-muted">
              <strong>Emergency Resources:</strong> If you're in immediate danger or experiencing a medical emergency, call emergency services right away. For mental health crises, contact crisis hotlines or emergency services.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIDiagnosis;
