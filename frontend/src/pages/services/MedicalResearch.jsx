import { useState } from "react";
import { Link } from "react-router-dom";

function MedicalResearch() {
  const [selectedResearch, setSelectedResearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [participationData, setParticipationData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    medicalHistory: "",
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const researchStudies = [
    {
      id: "ai-cardiology",
      title: "AI-Powered Cardiac Risk Assessment",
      description: "Study evaluating the effectiveness of machine learning algorithms in predicting cardiovascular diseases",
      category: "Cardiology",
      duration: "12 months",
      participants: 250,
      status: "recruiting",
      requirements: ["Age 30-75", "No prior heart disease", "Willing to wear monitoring device"],
      compensation: "$500",
      researcher: "Dr. Sarah Johnson",
      institution: "HealthCare AI Research Institute",
      deadline: "2024-03-15"
    },
    {
      id: "diabetes-ai",
      title: "Machine Learning for Diabetes Prediction",
      description: "Research on early detection of Type 2 diabetes using AI and patient data analysis",
      category: "Endocrinology",
      duration: "18 months",
      participants: 180,
      status: "recruiting",
      requirements: ["Age 25-65", "Family history of diabetes", "Regular check-in commitment"],
      compensation: "$750",
      researcher: "Dr. Michael Chen",
      institution: "Medical AI Research Center",
      deadline: "2024-04-01"
    },
    {
      id: "mental-health",
      title: "Digital Mental Health Interventions",
      description: "Study on effectiveness of AI-driven mental health support systems",
      category: "Psychiatry",
      duration: "6 months",
      participants: 300,
      status: "recruiting",
      requirements: ["Age 18-60", "Mild to moderate anxiety/depression", "Smartphone access"],
      compensation: "$300",
      researcher: "Dr. Emily Rodriguez",
      institution: "Behavioral Health Research Lab",
      deadline: "2024-02-28"
    },
    {
      id: "cancer-detection",
      title: "AI Cancer Detection from Medical Images",
      description: "Research on early cancer detection using deep learning on medical imaging",
      category: "Oncology",
      duration: "24 months",
      participants: 150,
      status: "recruiting",
      requirements: ["Age 40-80", "Recent medical imaging available", "No active cancer treatment"],
      compensation: "$1000",
      researcher: "Dr. James Wilson",
      institution: "Oncology AI Research Institute",
      deadline: "2024-05-01"
    },
    {
      id: "sleep-disorders",
      title: "AI-Based Sleep Disorder Diagnosis",
      description: "Study on using AI to analyze sleep patterns and diagnose sleep disorders",
      category: "Neurology",
      duration: "9 months",
      participants: 200,
      status: "recruiting",
      requirements: ["Age 25-70", "Sleep complaints", "Wearable device comfort"],
      compensation: "$400",
      researcher: "Dr. Lisa Anderson",
      institution: "Sleep Research Center",
      deadline: "2024-03-30"
    },
    {
      id: "vaccine-response",
      title: "Predicting Vaccine Response with AI",
      description: "Research on using machine learning to predict individual vaccine responses",
      category: "Immunology",
      duration: "15 months",
      participants: 400,
      status: "recruiting",
      requirements: ["Age 18-65", "Planned vaccination", "Blood sample willingness"],
      compensation: "$600",
      researcher: "Dr. Robert Taylor",
      institution: "Immunology Research Institute",
      deadline: "2024-04-15"
    }
  ];

  const categories = ["all", "Cardiology", "Endocrinology", "Psychiatry", "Oncology", "Neurology", "Immunology"];

  const filteredStudies = researchStudies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || study.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleParticipation = () => {
    if (!selectedResearch) return;

    if (!participationData.name || !participationData.email || !participationData.phone || !participationData.age) {
      alert("Please fill in all required fields");
      return;
    }

    if (!participationData.consent) {
      alert("Please consent to participate in the research study");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const participation = {
        ...participationData,
        researchId: selectedResearch,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };

      // Store in localStorage
      const participations = JSON.parse(localStorage.getItem('research_participations') || '[]');
      participations.push(participation);
      localStorage.setItem('research_participations', JSON.stringify(participations));

      setSubmissionSuccess(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const resetForm = () => {
    setParticipationData({
      name: "",
      email: "",
      phone: "",
      age: "",
      medicalHistory: "",
      consent: false
    });
    setSelectedResearch("");
    setSubmissionSuccess(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "recruiting": return "bg-success";
      case "ongoing": return "bg-primary";
      case "completed": return "bg-secondary";
      default: return "bg-secondary";
    }
  };

  const getSelectedStudy = () => {
    return researchStudies.find(study => study.id === selectedResearch);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-12">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-purple bg-opacity-10 rounded-circle p-4 mb-3">
              <i className="fas fa-microscope fa-3x text-purple"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Medical Research Studies</h1>
            <p className="lead text-muted">
              Participate in cutting-edge medical research and contribute to healthcare innovation
            </p>
          </div>

          {/* Search and Filter */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Search Studies</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">&nbsp;</label>
                  <button className="btn btn-outline-primary w-100" onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("all");
                  }}>
                    <i className="fas fa-redo me-1"></i>Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Research Studies Grid */}
          <div className="row mb-4">
            {filteredStudies.map((study, index) => (
              <div key={index} className="col-lg-6 mb-4">
                <div className={`card h-100 ${selectedResearch === study.id ? 'border-primary' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title">{study.title}</h5>
                        <span className={`badge ${getStatusBadge(study.status)}`}>{study.status}</span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">{study.category}</small>
                      </div>
                    </div>
                    
                    <p className="card-text text-muted mb-3">{study.description}</p>
                    
                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted">
                          <i className="fas fa-user-md me-1"></i> {study.researcher}
                        </small>
                      </div>
                      <div className="col-6 text-end">
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i> {study.duration}
                        </small>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-4">
                        <small className="text-muted">
                          <i className="fas fa-users me-1"></i> {study.participants} needed
                        </small>
                      </div>
                      <div className="col-4">
                        <small className="text-muted">
                          <i className="fas fa-dollar-sign me-1"></i> {study.compensation}
                        </small>
                      </div>
                      <div className="col-4 text-end">
                        <small className="text-muted">
                          <i className="fas fa-calendar me-1"></i> {study.deadline}
                        </small>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">Requirements:</small>
                      <ul className="list-unstyled mb-0">
                        {study.requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="small">
                            <i className="fas fa-check text-success me-1"></i> {req}
                          </li>
                        ))}
                        {study.requirements.length > 2 && (
                          <li className="small text-muted">
                            +{study.requirements.length - 2} more requirements
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setSelectedResearch(study.id)}
                    >
                      <i className="fas fa-hand-paper me-2"></i>Participate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Participation Form */}
          {selectedResearch && !submissionSuccess && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">
                  <i className="fas fa-user-plus me-2"></i>Research Participation Form
                </h5>
                
                {/* Study Details */}
                <div className="alert alert-info mb-4">
                  <strong>Selected Study:</strong> {getSelectedStudy()?.title}<br />
                  <small>Researcher: {getSelectedStudy()?.researcher} | Duration: {getSelectedStudy()?.duration} | Compensation: {getSelectedStudy()?.compensation}</small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={participationData.name}
                      onChange={(e) => setParticipationData({...participationData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={participationData.email}
                      onChange={(e) => setParticipationData({...participationData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your phone number"
                      value={participationData.phone}
                      onChange={(e) => setParticipationData({...participationData, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter your age"
                      value={participationData.age}
                      onChange={(e) => setParticipationData({...participationData, age: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Medical History</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Briefly describe your relevant medical history..."
                    value={participationData.medicalHistory}
                    onChange={(e) => setParticipationData({...participationData, medicalHistory: e.target.value})}
                  ></textarea>
                </div>

                {/* Study Requirements */}
                <div className="mb-3">
                  <h6>Study Requirements:</h6>
                  <ul className="list-group list-group-flush">
                    {getSelectedStudy()?.requirements.map((req, index) => (
                      <li key={index} className="list-group-item">
                        <i className="fas fa-info-circle text-info me-2"></i>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Consent */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="consent"
                      checked={participationData.consent}
                      onChange={(e) => setParticipationData({...participationData, consent: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="consent">
                      I consent to participate in this research study and understand that my data will be used for research purposes in accordance with privacy regulations.
                    </label>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleParticipation}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Submit Participation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {submissionSuccess && (
            <div className="card shadow-sm">
              <div className="card-body p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-4 mb-3">
                  <i className="fas fa-check fa-3x text-success"></i>
                </div>
                <h5 className="card-title mb-3">Application Submitted Successfully!</h5>
                <p className="text-muted mb-4">
                  Thank you for your interest in participating in medical research. The research team will contact you within 3-5 business days.
                </p>
                <div className="alert alert-info">
                  <strong>Next Steps:</strong><br />
                  • Research team will review your application<br />
                  • You'll receive an email with screening details<br />
                  • If eligible, you'll be scheduled for an initial consultation<br />
                  • Study participation will begin after screening and consent
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button className="btn btn-primary" onClick={resetForm}>
                    <i className="fas fa-plus me-2"></i>Apply for Another Study
                  </button>
                  <Link to="/contact" className="btn btn-outline-primary">
                    <i className="fas fa-phone me-2"></i>Contact Research Team
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Research Information */}
          <div className="card shadow-sm mt-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-info-circle me-2"></i>About Medical Research Participation
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-2">
                      <i className="fas fa-shield-alt fa-2x text-primary"></i>
                    </div>
                    <h6>Your Safety First</h6>
                    <p className="text-muted small">All studies follow strict ethical guidelines and safety protocols</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle p-3 mb-2">
                      <i className="fas fa-user-shield fa-2x text-info"></i>
                    </div>
                    <h6>Privacy Protected</h6>
                    <p className="text-muted small">Your personal data is protected and anonymized for research</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-3 mb-2">
                      <i className="fas fa-hand-holding-heart fa-2x text-success"></i>
                    </div>
                    <h6>Make a Difference</h6>
                    <p className="text-muted small">Contribute to medical breakthroughs that help millions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="alert alert-warning mt-4">
            <h6 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>Important Notice
            </h6>
            <p className="mb-0">
              Participation in medical research is voluntary. You may withdraw at any time without penalty. 
              All studies are reviewed by ethics committees and follow regulatory guidelines. 
              Please discuss participation with your healthcare provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalResearch;
