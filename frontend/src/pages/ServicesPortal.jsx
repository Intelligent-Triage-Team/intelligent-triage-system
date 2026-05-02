import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AIDiagnosis from "./services/AIDiagnosis";
import EmergencyTriage from "./services/EmergencyTriage";
import Telemedicine from "./services/Telemedicine";
import PatientMonitoring from "./services/PatientMonitoring";
import HealthAnalytics from "./services/HealthAnalytics";
import MedicalResearch from "./services/MedicalResearch";

function ServicesPortal() {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState("overview");
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined") return null;
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  })();

  const requireAuth = () => {
    if (!token || !user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  // Check if user is logged in
  if (!user) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle p-4 mb-3">
                  <i className="fas fa-lock fa-3x text-warning"></i>
                </div>
                <h2 className="mb-3">Login Required</h2>
                <p className="text-muted mb-4">
                  You must be logged in to access healthcare services. Please log in to continue.
                </p>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate("/login")}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login to Access Services
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/")}
                  >
                    <i className="fas fa-home me-2"></i>
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const services = [
    {
      id: "ai-diagnosis",
      name: "AI Diagnosis",
      description: "Get instant AI-assisted medical diagnosis based on symptoms",
      icon: "fa-brain",
      color: "primary",
      component: <AIDiagnosis />
    },
    {
      id: "emergency-triage",
      name: "Emergency Triage",
      description: "Quick emergency assessment to determine medical priority",
      icon: "fa-ambulance",
      color: "danger",
      component: <EmergencyTriage />
    },
    {
      id: "telemedicine",
      name: "Telemedicine",
      description: "Connect with healthcare providers virtually",
      icon: "fa-video",
      color: "info",
      component: <Telemedicine />
    },
    {
      id: "patient-monitoring",
      name: "Patient Monitoring",
      description: "Real-time health monitoring and vital tracking",
      icon: "fa-heartbeat",
      color: "success",
      component: <PatientMonitoring />
    },
    {
      id: "health-analytics",
      name: "Health Analytics",
      description: "Comprehensive health data analysis and insights",
      icon: "fa-chart-line",
      color: "warning",
      component: <HealthAnalytics />
    },
    {
      id: "medical-research",
      name: "Medical Research",
      description: "Participate in cutting-edge medical studies",
      icon: "fa-microscope",
      color: "purple",
      component: <MedicalResearch />
    }
  ];

  const renderService = () => {
    if (activeService === "overview") {
      return (
        <div className="container py-5">
          <div className="row">
            <div className="col-lg-12">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-4 mb-3">
                  <i className="fas fa-hospital fa-3x text-primary"></i>
                </div>
                <h1 className="display-4 fw-bold mb-3">Healthcare Services Portal</h1>
                <p className="lead text-muted">
                  Welcome back, {user.name}! Access all your healthcare services in one place
                </p>
              </div>

              {/* Services Grid */}
              <div className="row">
                {services.map((service, index) => (
                  <div key={index} className="col-lg-4 col-md-6 mb-4">
                    <div className="card h-100 service-card" onClick={() => {
                      if (!requireAuth()) return;
                      setActiveService(service.id);
                    }}>
                      <div className="card-body text-center">
                        <div className={`d-inline-flex align-items-center justify-content-center bg-${service.color} bg-opacity-10 rounded-circle p-4 mb-3`}>
                          <i className={`fas ${service.icon} fa-3x text-${service.color}`}></i>
                        </div>
                        <h5 className="card-title">{service.name}</h5>
                        <p className="card-text text-muted">{service.description}</p>
                        <button className={`btn btn-${service.color}`}>
                          <i className={`fas ${service.icon} me-2`}></i>
                          Access Service
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

                            <div className="card shadow-sm mt-5">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4">
                    <i className="fas fa-chart-bar me-2"></i>Your Service Usage
                  </h5>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="text-center">
                        <div className="h4 text-primary">12</div>
                        <small className="text-muted">AI Diagnoses</small>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center">
                        <div className="h4 text-info">3</div>
                        <small className="text-muted">Telemedicine Visits</small>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center">
                        <div className="h4 text-success">28</div>
                        <small className="text-muted">Days Monitored</small>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="text-center">
                        <div className="h4 text-warning">2</div>
                        <small className="text-muted">Research Studies</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card shadow-sm mt-4">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4">
                    <i className="fas fa-bolt me-2"></i>Quick Actions
                  </h5>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => requireAuth() && setActiveService("ai-diagnosis")}
                      >
                        <i className="fas fa-brain me-2"></i>Quick Diagnosis
                      </button>
                    </div>
                    <div className="col-md-3 mb-3">
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => requireAuth() && setActiveService("emergency-triage")}
                      >
                        <i className="fas fa-ambulance me-2"></i>Emergency
                      </button>
                    </div>
                    <div className="col-md-3 mb-3">
                      <button
                        className="btn btn-outline-info w-100"
                        onClick={() => requireAuth() && setActiveService("telemedicine")}
                      >
                        <i className="fas fa-video me-2"></i>Book Doctor
                      </button>
                    </div>
                    <div className="col-md-3 mb-3">
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={() => requireAuth() && setActiveService("patient-monitoring")}
                      >
                        <i className="fas fa-heartbeat me-2"></i>Start Monitoring
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const service = services.find(s => s.id === activeService);
    return service ? service.component : null;
  };

  return (
    <div>
      {/* Service Navigation */}
      <div className="bg-light border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-secondary me-3"
                onClick={() => setActiveService("overview")}
              >
                <i className="fas fa-th-large me-2"></i>
                All Services
              </button>
              <div className="btn-group" role="group">
                {services.map((service) => (
                  <button
                    key={service.id}
                    className={`btn ${activeService === service.id ? `btn-${service.color}` : 'btn-outline-secondary'}`}
                    onClick={() => setActiveService(service.id)}
                  >
                    <i className={`fas ${service.icon} me-1`}></i>
                    {service.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="d-flex align-items-center">
              <span className="text-muted me-3">Welcome, {user.name}</span>
              <button
                className="btn btn-outline-sm btn-outline-secondary"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
              >
                <i className="fas fa-sign-out-alt me-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service Content */}
      {renderService()}

      <style jsx>{`
        .service-card {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .btn-group .btn {
          border-radius: 0;
          border-right: 1px solid rgba(0,0,0,0.125);
        }

        .btn-group .btn:first-child {
          border-top-left-radius: 0.375rem;
          border-bottom-left-radius: 0.375rem;
        }

        .btn-group .btn:last-child {
          border-top-right-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-right: none;
        }
      `}</style>
    </div>
  );
}

export default ServicesPortal;
