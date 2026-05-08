import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function PatientMonitoring() {
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    oxygenSaturation: 98,
    glucose: 95,
    weight: 150,
    lastUpdated: new Date().toLocaleString()
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    time: "",
    frequency: ""
  });

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        // Simulate real-time vital monitoring
        setVitals(prev => ({
          ...prev,
          heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 5)),
          bloodPressure: {
            systolic: Math.max(100, Math.min(140, prev.bloodPressure.systolic + (Math.random() - 0.5) * 3)),
            diastolic: Math.max(60, Math.min(90, prev.bloodPressure.diastolic + (Math.random() - 0.5) * 2))
          },
          oxygenSaturation: Math.max(95, Math.min(100, prev.oxygenSaturation + (Math.random() - 0.5) * 2)),
          lastUpdated: new Date().toLocaleString()
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const checkAlerts = () => {
    const newAlerts = [];
    
    if (vitals.heartRate > 100) {
      newAlerts.push({ type: 'warning', message: 'Heart rate is elevated', timestamp: new Date() });
    }
    if (vitals.heartRate < 60) {
      newAlerts.push({ type: 'warning', message: 'Heart rate is low', timestamp: new Date() });
    }
    if (vitals.bloodPressure.systolic > 140) {
      newAlerts.push({ type: 'danger', message: 'Blood pressure is high', timestamp: new Date() });
    }
    if (vitals.oxygenSaturation < 95) {
      newAlerts.push({ type: 'danger', message: 'Oxygen saturation is low', timestamp: new Date() });
    }
    if (vitals.temperature > 100.4) {
      newAlerts.push({ type: 'warning', message: 'Temperature is elevated', timestamp: new Date() });
    }

    setAlerts(newAlerts);
  };

  useEffect(() => {
    checkAlerts();
  }, [vitals]);

  const handleVitalUpdate = (vital, value) => {
    setVitals(prev => ({
      ...prev,
      [vital]: value,
      lastUpdated: new Date().toLocaleString()
    }));
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.time) {
      const medication = {
        ...newMedication,
        id: Date.now(),
        addedAt: new Date().toLocaleString()
      };
      setMedications([...medications, medication]);
      setNewMedication({ name: "", dosage: "", time: "", frequency: "" });
    }
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const getVitalStatus = (vital, value) => {
    const thresholds = {
      heartRate: { min: 60, max: 100 },
      systolic: { min: 90, max: 140 },
      diastolic: { min: 60, max: 90 },
      temperature: { min: 97, max: 99.5 },
      oxygenSaturation: { min: 95, max: 100 },
      glucose: { min: 70, max: 140 }
    };

    const threshold = thresholds[vital];
    if (!threshold) return 'normal';

    if (value < threshold.min || value > threshold.max) {
      return 'abnormal';
    }
    return 'normal';
  };

  const getVitalColor = (status) => {
    switch (status) {
      case 'abnormal': return 'danger';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-12">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-4 mb-3">
              <i className="fas fa-heartbeat fa-3x text-success"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Patient Monitoring System</h1>
            <p className="lead text-muted">
              Real-time health monitoring and vital signs tracking for continuous care
            </p>
          </div>

          {/* Monitoring Control */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">
                    <i className="fas fa-chart-line me-2"></i>Real-time Monitoring
                  </h5>
                  <p className="text-muted mb-0">
                    Status: {isMonitoring ? 'Active' : 'Inactive'} | Last Updated: {vitals.lastUpdated}
                  </p>
                </div>
                <button
                  className={`btn ${isMonitoring ? 'btn-danger' : 'btn-success'} btn-lg`}
                  onClick={() => setIsMonitoring(!isMonitoring)}
                >
                  {isMonitoring ? (
                    <>
                      <i className="fas fa-stop me-2"></i>Stop Monitoring
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play me-2"></i>Start Monitoring
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="row mb-4">
              {alerts.map((alert, index) => (
                <div key={index} className="col-12">
                  <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Alert:</strong> {alert.message}
                    <small className="d-block mt-1">{alert.timestamp.toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vitals Dashboard */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-2">
                    <i className="fas fa-heart fa-2x text-primary"></i>
                  </div>
                  <h6 className="card-title">Heart Rate</h6>
                  <div className="display-6 fw-bold text-primary">{vitals.heartRate}</div>
                  <small className="text-muted">BPM</small>
                  <div className="mt-2">
                    <span className={`badge bg-${getVitalColor(getVitalStatus('heartRate', vitals.heartRate))}`}>
                      {getVitalStatus('heartRate', vitals.heartRate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle p-3 mb-2">
                    <i className="fas fa-tint fa-2x text-danger"></i>
                  </div>
                  <h6 className="card-title">Blood Pressure</h6>
                  <div className="display-6 fw-bold text-danger">
                    {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                  </div>
                  <small className="text-muted">mmHg</small>
                  <div className="mt-2">
                    <span className={`badge bg-${getVitalColor(getVitalStatus('systolic', vitals.bloodPressure.systolic))}`}>
                      {getVitalStatus('systolic', vitals.bloodPressure.systolic)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle p-3 mb-2">
                    <i className="fas fa-thermometer-half fa-2x text-warning"></i>
                  </div>
                  <h6 className="card-title">Temperature</h6>
                  <div className="display-6 fw-bold text-warning">{vitals.temperature}</div>
                  <small className="text-muted">°F</small>
                  <div className="mt-2">
                    <span className={`badge bg-${getVitalColor(getVitalStatus('temperature', vitals.temperature))}`}>
                      {getVitalStatus('temperature', vitals.temperature)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body text-center">
                  <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle p-3 mb-2">
                    <i className="fas fa-lungs fa-2x text-info"></i>
                  </div>
                  <h6 className="card-title">O₂ Saturation</h6>
                  <div className="display-6 fw-bold text-info">{vitals.oxygenSaturation}</div>
                  <small className="text-muted">%</small>
                  <div className="mt-2">
                    <span className={`badge bg-${getVitalColor(getVitalStatus('oxygenSaturation', vitals.oxygenSaturation))}`}>
                      {getVitalStatus('oxygenSaturation', vitals.oxygenSaturation)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Vitals */}
          <div className="row mb-4">
            <div className="col-lg-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="fas fa-vial me-2"></i>Blood Glucose
                  </h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="h4">{vitals.glucose}</span>
                      <small className="text-muted ms-2">mg/dL</small>
                    </div>
                    <div>
                      <span className={`badge bg-${getVitalColor(getVitalStatus('glucose', vitals.glucose))}`}>
                        {getVitalStatus('glucose', vitals.glucose)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="fas fa-weight me-2"></i>Weight
                  </h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="h4">{vitals.weight}</span>
                      <small className="text-muted ms-2">lbs</small>
                    </div>
                    <div>
                      <span className="badge bg-success">Normal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-edit me-2"></i>Manual Vitals Entry
              </h5>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Heart Rate</label>
                  <input
                    type="number"
                    className="form-control"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalUpdate('heartRate', parseInt(e.target.value))}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Systolic BP</label>
                  <input
                    type="number"
                    className="form-control"
                    value={vitals.bloodPressure.systolic}
                    onChange={(e) => setVitals(prev => ({
                      ...prev,
                      bloodPressure: { ...prev.bloodPressure, systolic: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Diastolic BP</label>
                  <input
                    type="number"
                    className="form-control"
                    value={vitals.bloodPressure.diastolic}
                    onChange={(e) => setVitals(prev => ({
                      ...prev,
                      bloodPressure: { ...prev.bloodPressure, diastolic: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalUpdate('temperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medication Management */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-pills me-2"></i>Medication Tracking
              </h5>
              
              {/* Add Medication Form */}
              <div className="row mb-4">
                <div className="col-md-3 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Medication name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  />
                </div>
                <div className="col-md-2 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  />
                </div>
                <div className="col-md-2 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Time"
                    value={newMedication.time}
                    onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                  />
                </div>
                <div className="col-md-3 mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Frequency"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  />
                </div>
                <div className="col-md-2 mb-2">
                  <button className="btn btn-primary w-100" onClick={addMedication}>
                    <i className="fas fa-plus me-1"></i>Add
                  </button>
                </div>
              </div>

              {/* Medications List */}
              {medications.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Time</th>
                        <th>Frequency</th>
                        <th>Added</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.map((med) => (
                        <tr key={med.id}>
                          <td>{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.time}</td>
                          <td>{med.frequency}</td>
                          <td>{med.addedAt}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeMedication(med.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No medications added yet</p>
              )}
            </div>
          </div>

          {/* Health Trends */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-chart-area me-2"></i>Health Trends
              </h5>
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center">
                    <h6 className="text-success">Heart Rate Trend</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-success" style={{width: '75%'}}></div>
                    </div>
                    <small className="text-muted">Stable over 24 hours</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h6 className="text-primary">Blood Pressure Trend</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-primary" style={{width: '60%'}}></div>
                    </div>
                    <small className="text-muted">Slightly elevated</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <h6 className="text-info">Oxygen Saturation</h6>
                    <div className="progress mb-2">
                      <div className="progress-bar bg-info" style={{width: '95%'}}></div>
                    </div>
                    <small className="text-muted">Excellent</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="alert alert-danger mt-4">
            <h6 className="alert-heading">
              <i className="fas fa-phone-alt me-2"></i>Emergency Contact
            </h6>
            <p className="mb-0">
              If you experience severe symptoms or abnormal readings, contact your healthcare provider immediately 
              or call emergency services at 911.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientMonitoring;
