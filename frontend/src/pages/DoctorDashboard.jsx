import React, { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [availability, setAvailability] = useState({
    available_from: "",
    available_to: ""
  });

  const patientsPerPage = 8;
  const [successMsg, setSuccessMsg] = useState("");
  const [showPatientRecords, setShowPatientRecords] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('queue');
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [newScheduleDate, setNewScheduleDate] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);
  const [recordsSearch, setRecordsSearch] = useState("");

  // Realistic notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'emergency', message: 'New trauma case in Triage Room 3', time: '2m ago', priority: 'high' },
    { id: 2, type: 'appointment', message: 'Follow-up with Patient #1042 in 15m', time: '10m ago', priority: 'medium' },
    { id: 3, type: 'lab', message: 'Blood work results ready for Sarah Smith', time: '1h ago', priority: 'low' }
  ]);

  const [realTimeStats, setRealTimeStats] = useState({
    totalPatients: 0,
    avgWaitTime: 0,
    completedToday: 0,
    emergencyAlerts: 0
  });

  const [apiName, setApiName] = useState("");
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
      return {};
    }
  }, []);

  const doctorName = useMemo(() => {
    const rawName = apiName || currentUser.name || "Doctor";
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }, [apiName, currentUser.name]);

  // Mock analytics data
  const analyticsData = useMemo(() => [
    { name: '08:00', patients: 12, wait: 15 },
    { name: '10:00', patients: 25, wait: 45 },
    { name: '12:00', patients: 18, wait: 30 },
    { name: '14:00', patients: 32, wait: 60 },
    { name: '16:00', patients: 21, wait: 25 },
    { name: '18:00', patients: 14, wait: 10 },
  ], []);

  const severityDistribution = useMemo(() => [
    { name: 'Emergency', value: patients.filter(p => p.severity === 'emergency').length, color: '#ef4444' },
    { name: 'Urgent', value: patients.filter(p => p.severity === 'urgent').length, color: '#f59e0b' },
    { name: 'Normal', value: patients.filter(p => p.severity === 'normal').length, color: '#10b981' },
  ], [patients]);

  // Existing Logic Functions
  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/triage-queue", {
        headers: { Authorization: token }
      });

      const enhancedPatients = response.data.map(patient => {
        const age = patient.age || 35; // Default if missing
        return {
          ...patient,
          waitTime: calculateWaitTime(patient.created_at),
          estimatedDuration: getEstimatedDuration(patient.severity),
          vitalSigns: generateVitalSigns(age, patient.severity),
          medicalHistory: generateMedicalHistory(age),
          allergies: generateAllergies(),
          medications: generateMedications(age),
          arrivalTime: new Date(patient.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          timeInQueue: getTimeInQueue(patient.created_at),
          bmi: (18 + Math.random() * 12).toFixed(1),
          bloodType: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'][Math.floor(Math.random() * 8)]
        };
      });

      const sortedPatients = enhancedPatients.sort((a, b) => {
        const priorityMap = { emergency: 1, urgent: 2, normal: 3 };
        const aPrio = priorityMap[a.severity] || 4;
        const bPrio = priorityMap[b.severity] || 4;
        return aPrio - bPrio;
      });

      setPatients(sortedPatients);
      setLastUpdated(new Date());
      updateRealTimeStats(enhancedPatients);

    } catch (error) {
      console.error("Fetch queue error:", error);
    }
  };

  const fetchPatientRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/doctor/patient-records", {
        headers: { Authorization: token }
      });
      setPatientRecords(res.data);
    } catch (error) {
      console.error("Fetch records error:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'records') {
      fetchPatientRecords();
    }
  }, [activeTab]);

  const generateMedicalHistory = (age) => {
    const conditions = age > 50 ? 
      ['Hypertension', 'Diabetes Type 2', 'Arthritis'] :
      ['Asthma', 'Migraines', 'Seasonal Allergies'];
    return conditions.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generateAllergies = () => ['Penicillin', 'Latex', 'Dust'].slice(0, Math.floor(Math.random() * 2));
  const generateMedications = (age) => age > 40 ? ['Lisinopril', 'Metformin'] : ['Albuterol'];

  const completeCase = async (triageId) => {
    try {
      setLoadingActions(prev => ({ ...prev, [triageId]: 'complete' }));
      const token = localStorage.getItem("token");
      await API.put(`/triage/${triageId}/complete`, {}, {
        headers: { Authorization: token }
      });

      const patient = patients.find(p => p.triage_id === triageId);
      showNotification(`✅ Case for ${patient?.patient_name || 'patient'} completed`);
      fetchQueue();
    } catch (error) {
      console.error("Complete error:", error);
      showNotification("❌ Failed to complete case");
    } finally {
      setLoadingActions(prev => ({ ...prev, [triageId]: null }));
    }
  };

  const scheduleAppointment = async (triageId) => {
    try {
      setLoadingActions(prev => ({ ...prev, [triageId]: 'schedule' }));
      const token = localStorage.getItem("token");
      const res = await API.post("/auto-schedule", { triage_id: triageId }, {
        headers: { Authorization: token }
      });

      const patient = patients.find(p => p.triage_id === triageId);
      showNotification(`📅 Scheduled for: ${new Date(res.data.appointment.appointment_time).toLocaleString()}`);
      fetchQueue();
    } catch (error) {
      console.error("Schedule error:", error);
      const errMsg = error.response?.data?.message || "Failed to schedule appointment";
      showNotification(`❌ ${errMsg}`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [triageId]: null }));
    }
  };

  const updateExistingSchedule = async () => {
    if (!selectedPatient?.appointment_id || !newScheduleDate) {
      showNotification("❌ Select a valid date and patient");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.put(`/appointments/${selectedPatient.appointment_id}`, 
        { appointment_date: newScheduleDate }, 
        { headers: { Authorization: token } }
      );
      showNotification("📅 Appointment rescheduled successfully");
      setShowScheduleEditor(false);
      fetchQueue();
    } catch (error) {
      showNotification("❌ Rescheduling failed");
    }
  };

  const updateAvailability = async () => {
    try {
      await API.put("/doctor/update-availability", availability, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      showNotification("✅ Availability updated");
    } catch (error) {
      showNotification("❌ Update failed");
    }
  };

  const handleTreatPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPrescription(true);
    setShowPatientRecords(false);
    setShowAnalytics(false);
  };

  const handleOpenScheduleEditor = (patient) => {
    setSelectedPatient(patient);
    setNewScheduleDate(patient.appointment_date ? new Date(patient.appointment_date).toISOString().slice(0, 16) : "");
    setShowScheduleEditor(true);
  };

  const fetchPatientHistory = async (patientId) => {
    if (!patientId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/patients/${patientId}/history`, {
        headers: { Authorization: token }
      });
      setPatientHistory(res.data);
      setShowHistoryModal(true);
    } catch (error) {
      showNotification("❌ Failed to fetch patient history");
    }
  };

  // Helper Functions
  const calculateWaitTime = (createdAt) => {
    const diff = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60));
    return diff;
  };

  const getEstimatedDuration = (severity) => {
    const d = { emergency: 20, urgent: 15, normal: 10 };
    return d[severity] || 10;
  };

  const generateVitalSigns = (age, severity) => ({
    heartRate: (severity === 'emergency' ? 110 : 75) + Math.floor(Math.random() * 20),
    oxygen: 94 + Math.floor(Math.random() * 6),
    temp: (36.5 + Math.random() * 2).toFixed(1)
  });

  const getTimeInQueue = (createdAt) => {
    const mins = calculateWaitTime(createdAt);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`;
  };

  const updateRealTimeStats = (p) => {
    setRealTimeStats({
      totalPatients: p.length,
      avgWaitTime: p.length > 0 ? Math.floor(p.reduce((s, x) => s + x.waitTime, 0) / p.length) : 0,
      completedToday: p.filter(x => x.status === 'completed').length,
      emergencyAlerts: p.filter(x => x.severity === 'emergency').length
    });
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await API.get("/doctor/me", {
          headers: { Authorization: localStorage.getItem("token") }
        });
        setAvailability(res.data);
        if (res.data.name) setApiName(res.data.name);
      } catch (e) {}
    };
    fetchDoc();
    fetchQueue();
    const inv = setInterval(fetchQueue, 5000);
    return () => clearInterval(inv);
  }, []);

  const filteredPatients = patients.filter(p => 
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.predicted_disease?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);

  // Render Helpers
  const getSeverityBadge = (s) => {
    const colors = {
      emergency: { bg: '#fee2e2', text: '#dc2626', label: 'EMERGENCY' },
      urgent: { bg: '#ffedd5', text: '#ea580c', label: 'URGENT' },
      normal: { bg: '#dcfce7', text: '#16a34a', label: 'NORMAL' }
    };
    const config = colors[s] || colors.normal;
    return (
      <span style={{
        padding: '0.25rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.7rem',
        fontWeight: '700',
        background: config.bg,
        color: config.text,
        letterSpacing: '0.02em'
      }}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">🏥</div>
          <div className="brand-name">ግዕዝ Health</div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <span className="icon">📋</span> Queue
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="icon">📊</span> Analytics
          </button>
          <button 
            className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            <span className="icon">📂</span> Records
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="doctor-card">
            <div className="avatar">{doctorName.charAt(0).toUpperCase()}</div>
            <div className="doc-info">
              <div className="name">Dr. {doctorName}</div>
              <div className="role">Senior Attending</div>
            </div>
          </div>
          
          <div className="availability-mini-form">
            <h4>Work Hours</h4>
            <div className="time-inputs">
              <input 
                type="time" 
                name="available_from" 
                value={availability.available_from} 
                onChange={(e) => setAvailability({...availability, available_from: e.target.value})}
              />
              <span>to</span>
              <input 
                type="time" 
                name="available_to" 
                value={availability.available_to} 
                onChange={(e) => setAvailability({...availability, available_to: e.target.value})}
              />
            </div>
            <button className="btn-save-mini" onClick={updateAvailability}>Update</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h2>{activeTab === 'queue' ? 'Patient Queue' : activeTab === 'analytics' ? 'Analytics' : 'Patient Records'}</h2>
            <p>Welcome back, Dr. {doctorName}. {activeTab === 'queue' ? `You have ${realTimeStats.totalPatients} patients waiting.` : 'Manage clinical data and history.'}</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search patient or diagnosis..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="header-actions">
              <div className="notification-bell">
                🔔 <span className="badge">{notifications.length}</span>
              </div>
              <div className="current-time">{lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
        </header>

        {activeTab === 'queue' ? (
          <div className="dashboard-grid">
            {/* Stats Overview */}
            <section className="stats-row">
              <div className="stat-card emergency">
                <div className="stat-icon">🚨</div>
                <div className="stat-data">
                  <span className="label">Critical</span>
                  <span className="value">{realTimeStats.emergencyAlerts}</span>
                </div>
              </div>
              <div className="stat-card waiting">
                <div className="stat-icon">⏳</div>
                <div className="stat-data">
                  <span className="label">Avg. Wait</span>
                  <span className="value">{realTimeStats.avgWaitTime}m</span>
                </div>
              </div>
              <div className="stat-card queue">
                <div className="stat-icon">👥</div>
                <div className="stat-data">
                  <span className="label">In Queue</span>
                  <span className="value">{realTimeStats.totalPatients}</span>
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-data">
                  <span className="label">Completed</span>
                  <span className="value">{realTimeStats.completedToday}</span>
                </div>
              </div>
            </section>

            {/* Main Table Section */}
            <div className="table-container">
              <div className="table-header-actions">
                <h3>Live Patient Feed</h3>
                <div className="filters">
                  <span className="filter-pill active">All</span>
                  <span className="filter-pill">Emergency</span>
                  <span className="filter-pill">Urgent</span>
                </div>
              </div>
              
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Vitals (HR/O₂/Temp)</th>
                    <th>Diagnosis / Prediction</th>
                    <th>Severity</th>
                    <th>Wait Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.map((p) => (
                    <tr key={p.triage_id} className={`row-severity-${p.severity}`}>
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar" style={{ background: p.severity === 'emergency' ? '#fecaca' : '#e2e8f0' }}>
                            {p.patient_name?.charAt(0)}
                          </div>
                          <div className="patient-meta">
                            <span className="name">{p.patient_name}</span>
                            <span className="details">{p.age}y • {p.bloodType} • {p.arrivalTime}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="vitals-row">
                          <span className={`vital ${p.vitalSigns.heartRate > 100 ? 'warning' : ''}`}>{p.vitalSigns.heartRate}</span>
                          <span className="vital">{p.vitalSigns.oxygen}%</span>
                          <span className="vital">{p.vitalSigns.temp}°C</span>
                        </div>
                      </td>
                      <td>
                        <div className="diagnosis-cell">
                          <span className="disease">{p.predicted_disease}</span>
                          <span className="badge-ai">AI PREDICTED</span>
                        </div>
                      </td>
                      <td>{getSeverityBadge(p.severity)}</td>
                      <td>
                        <div className="wait-cell">
                          <span className="time">{p.timeInQueue}</span>
                          <span className="est">Est: {p.estimatedDuration}m</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-group">
                          <button 
                            className="btn-action treat" 
                            onClick={() => handleTreatPatient(p)}
                            disabled={loadingActions[p.triage_id]}
                          >
                            {loadingActions[p.triage_id] === 'treat' ? '⏳' : 'Treat'}
                          </button>
                          <button 
                            className="btn-action schedule" 
                            onClick={() => p.appointment_id ? handleOpenScheduleEditor(p) : scheduleAppointment(p.triage_id)}
                            disabled={loadingActions[p.triage_id]}
                          >
                            {loadingActions[p.triage_id] === 'schedule' ? '⏳' : (p.appointment_id ? 'Reschedule' : 'Schedule')}
                          </button>
                          <button 
                            className="btn-action complete" 
                            onClick={() => fetchPatientHistory(p.patient_id)}
                          >
                            History
                          </button>
                          <button 
                            className="btn-action complete" 
                            onClick={() => completeCase(p.triage_id)}
                            disabled={loadingActions[p.triage_id]}
                          >
                            {loadingActions[p.triage_id] === 'complete' ? '⏳' : 'Done'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</button>
                <div className="pages">
                  Page {currentPage} of {Math.ceil(filteredPatients.length / patientsPerPage)}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredPatients.length / patientsPerPage), prev + 1))} disabled={indexOfLast >= filteredPatients.length}>Next</button>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <aside className="widgets-area">
              <div className="widget notifications">
                <h3>Priority Alerts</h3>
                <div className="notification-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`notification-item ${n.type}`}>
                      <div className="n-icon">{n.type === 'emergency' ? '🔴' : n.type === 'lab' ? '🧪' : '📅'}</div>
                      <div className="n-content">
                        <div className="n-msg">{n.message}</div>
                        <div className="n-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="widget quick-stats">
                <h3>Severity Mix</h3>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityDistribution} layout="vertical" margin={{ left: -30 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" fontSize={10} width={60} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {severityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </aside>
          </div>
        ) : activeTab === 'records' ? (
          <div className="records-view" style={{ padding: '2.5rem' }}>
            <div className="table-container">
              <div className="table-header-actions">
                <div className="search-bar" style={{ width: '400px' }}>
                  <span className="search-icon">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search records by name or disease..." 
                    value={recordsSearch}
                    onChange={(e) => setRecordsSearch(e.target.value)}
                  />
                </div>
                <button className="btn-save-mini" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} onClick={fetchPatientRecords}>Refresh Records</button>
              </div>
              
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Visit Date</th>
                    <th>Condition</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patientRecords.filter(r => r.patient_name.toLowerCase().includes(recordsSearch.toLowerCase()) || r.predicted_disease.toLowerCase().includes(recordsSearch.toLowerCase())).map((r, i) => (
                    <tr key={i}>
                      <td><b>{r.patient_name}</b></td>
                      <td>{new Date(r.visit_date).toLocaleDateString()}</td>
                      <td>{r.predicted_disease}</td>
                      <td>{getSeverityBadge(r.severity)}</td>
                      <td>
                        <span className={`badge-status ${r.triage_status}`}>{r.triage_status?.toUpperCase()}</span>
                      </td>
                      <td>
                        <button className="btn-action schedule" onClick={() => fetchPatientHistory(r.patient_id)}>Full History</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="analytics-view">
            <div className="analytics-grid-full">
              <div className="chart-card large">
                <h3>Patient Inflow vs. Wait Time</h3>
                <div style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="patients" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="wait" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Prescription / Treatment Modal */}
      {showPrescription && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <header className="modal-header">
              <h3>Treat Patient: {selectedPatient.patient_name}</h3>
              <button className="close-btn" onClick={() => setShowPrescription(false)}>×</button>
            </header>
            <div className="modal-body">
              <div className="patient-brief">
                <div className="brief-item">
                  <label>Initial Prediction</label>
                  <div>{selectedPatient.predicted_disease}</div>
                </div>
                <div className="brief-item">
                  <label>Severity</label>
                  <div>{selectedPatient.severity?.toUpperCase()}</div>
                </div>
              </div>
              
              <div className="patient-medical-context">
                <div className="context-card">
                  <h4>📜 Medical History</h4>
                  <ul>
                    {selectedPatient.medicalHistory?.map((h, i) => <li key={i}>{h}</li>) || <li>No records</li>}
                  </ul>
                </div>
                <div className="context-card">
                  <h4>⚠️ Allergies</h4>
                  <ul>
                    {selectedPatient.allergies?.map((a, i) => <li key={i}>{a}</li>) || <li>None reported</li>}
                  </ul>
                </div>
                <div className="context-card">
                  <h4>💊 Current Meds</h4>
                  <ul>
                    {selectedPatient.medications?.map((m, i) => <li key={i}>{m}</li>) || <li>None</li>}
                  </ul>
                </div>
              </div>

              <div className="treatment-form">
                <div className="form-group">
                  <label>Final Diagnosis</label>
                  <textarea placeholder="Enter detailed clinical diagnosis..."></textarea>
                </div>
                <div className="form-group">
                  <label>Prescribed Medication</label>
                  <input type="text" placeholder="Drug name, dosage, frequency..." />
                </div>
                <div className="form-group">
                  <label>Doctor's Notes</label>
                  <textarea placeholder="Internal clinical notes..."></textarea>
                </div>
              </div>
            </div>
            <footer className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPrescription(false)}>Cancel</button>
              <button className="btn-submit" onClick={() => {
                completeCase(selectedPatient.triage_id);
                setShowPrescription(false);
              }}>Submit Treatment</button>
            </footer>
          </div>
        </div>
      )}

      {/* Schedule Editor Modal */}
      {showScheduleEditor && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ width: '400px' }}>
            <header className="modal-header">
              <h3>Reschedule Appointment</h3>
              <button className="close-btn" onClick={() => setShowScheduleEditor(false)}>×</button>
            </header>
            <div className="modal-body">
              <p>Rescheduling for <b>{selectedPatient.patient_name}</b></p>
              <div className="form-group">
                <label>New Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                />
              </div>
            </div>
            <footer className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowScheduleEditor(false)}>Cancel</button>
              <button className="btn-submit" onClick={updateExistingSchedule}>Update Schedule</button>
            </footer>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ width: '800px', maxWidth: '90%' }}>
            <header className="modal-header">
              <h3>Medical Records History</h3>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>×</button>
            </header>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Severity</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {patientHistory.map((h, i) => (
                    <tr key={i}>
                      <td>{h.appointment_date ? new Date(h.appointment_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{h.predicted_disease}</td>
                      <td>{getSeverityBadge(h.severity)}</td>
                      <td>{(h.prediction_confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  {patientHistory.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No history found</td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="modal-footer">
              <button className="btn-submit" onClick={() => setShowHistoryModal(false)}>Close</button>
            </footer>
          </div>
        </div>
      )}
      {successMsg && <div className="toast-notification">{successMsg}</div>}

      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: 'Inter', -apple-system, sans-serif;
          background: #f1f5f9;
        }

        .dashboard-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: #f8fafc;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .logo-box {
          width: 40px;
          height: 40px;
          background: #4f46e5;
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1rem;
          border: none;
          background: transparent;
          color: #64748b;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          text-align: left;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #4f46e5;
        }

        .nav-item.active {
          background: #eef2ff;
          color: #4f46e5;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .doctor-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 16px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          background: #4f46e5;
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .doc-info .name { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
        .doc-info .role { font-size: 0.8rem; color: #64748b; }

        .availability-mini-form {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 1rem;
          border-radius: 16px;
        }

        .availability-mini-form h4 { margin: 0 0 0.75rem; font-size: 0.85rem; color: #475569; }
        .time-inputs { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
        .time-inputs input { width: 100%; padding: 0.4rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; }
        .btn-save-mini { width: 100%; padding: 0.5rem; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          overflow-y: auto;
        }

        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .header-left h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .header-left p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }

        .header-right { display: flex; align-items: center; gap: 2rem; }
        .search-bar { position: relative; width: 300px; }
        .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-bar input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; background: #f1f5f9; border: none; border-radius: 12px; font-size: 0.9rem; }

        .header-actions { display: flex; align-items: center; gap: 1.5rem; }
        .notification-bell { position: relative; cursor: pointer; font-size: 1.25rem; }
        .notification-bell .badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; font-size: 0.6rem; padding: 2px 5px; border-radius: 10px; border: 2px solid white; }
        .current-time { font-weight: 600; color: #1e293b; }

        /* Dashboard Grid */
        .dashboard-grid {
          padding: 2.5rem;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
        }

        .stats-row {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .stat-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
        }

        .stat-card:hover { transform: translateY(-4px); }
        .stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        
        .stat-card.emergency .stat-icon { background: #fef2f2; }
        .stat-card.waiting .stat-icon { background: #fffbeb; }
        .stat-card.queue .stat-icon { background: #eff6ff; }
        .stat-card.success .stat-icon { background: #ecfdf5; }

        .stat-data { display: flex; flex-direction: column; }
        .stat-data .label { font-size: 0.85rem; color: #64748b; margin-bottom: 2px; }
        .stat-data .value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }

        /* Table Styles */
        .table-container {
          background: #ffffff;
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
        }

        .table-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 0 0.5rem; }
        .table-header-actions h3 { margin: 0; font-size: 1.15rem; color: #1e293b; }
        .filters { display: flex; gap: 0.5rem; }
        .filter-pill { padding: 0.4rem 1rem; background: #f1f5f9; border-radius: 20px; font-size: 0.8rem; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .filter-pill.active { background: #4f46e5; color: white; }

        .patient-table { width: 100%; border-collapse: separate; border-spacing: 0 0.75rem; margin-top: -0.75rem; }
        .patient-table th { padding: 1rem; text-align: left; color: #94a3b8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .patient-table td { padding: 1rem; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
        
        .patient-cell { display: flex; align-items: center; gap: 0.75rem; }
        .patient-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1e293b; font-size: 0.9rem; }
        .patient-meta { display: flex; flex-direction: column; }
        .patient-meta .name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
        .patient-meta .details { font-size: 0.75rem; color: #94a3b8; }

        .vitals-row { display: flex; gap: 0.5rem; }
        .vital { padding: 0.25rem 0.5rem; background: #f1f5f9; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #475569; }
        .vital.warning { color: #ef4444; background: #fef2f2; }

        .diagnosis-cell { display: flex; flex-direction: column; gap: 0.25rem; }
        .diagnosis-cell .disease { font-weight: 500; color: #1e293b; font-size: 0.85rem; }
        .badge-ai { font-size: 0.6rem; font-weight: 800; color: #4f46e5; background: #eef2ff; padding: 2px 4px; border-radius: 4px; width: fit-content; }

        .wait-cell { display: flex; flex-direction: column; }
        .wait-cell .time { font-weight: 700; color: #1e293b; font-size: 0.85rem; }
        .wait-cell .est { font-size: 0.7rem; color: #94a3b8; }

        .action-group { display: flex; gap: 0.4rem; }
        .btn-action { padding: 0.4rem 0.75rem; border: none; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-action.treat { background: #4f46e5; color: white; }
        .btn-action.schedule { background: #f1f5f9; color: #4f46e5; }
        .btn-action.complete { background: #ecfdf5; color: #059669; }
        
        .btn-action:hover { filter: brightness(0.95); transform: translateY(-1px); }
        .btn-action:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Widgets Section */
        .widgets-area { display: flex; flex-direction: column; gap: 1.5rem; }
        .widget { background: #ffffff; border-radius: 20px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .widget h3 { margin: 0 0 1rem; font-size: 1rem; color: #1e293b; }

        .notification-list { display: flex; flex-direction: column; gap: 1rem; }
        .notification-item { display: flex; gap: 0.75rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
        .notification-item:last-child { border-bottom: none; }
        .n-icon { font-size: 1.25rem; }
        .n-msg { font-size: 0.85rem; font-weight: 500; color: #334155; }
        .n-time { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #ffffff; width: 650px; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .modal-header h3 { margin: 0; font-size: 1.25rem; color: #1e293b; }
        .close-btn { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

        .modal-body { padding: 2rem; overflow-y: auto; flex: 1; }
        .patient-brief { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; background: #f8fafc; padding: 1.25rem; border-radius: 16px; }
        .brief-item label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .brief-item div { font-weight: 600; color: #1e293b; }

        .patient-medical-context { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .context-card { background: #f1f5f9; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
        .context-card h4 { margin: 0 0 0.5rem; font-size: 0.8rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
        .context-card ul { margin: 0; padding: 0 0 0 1.25rem; font-size: 0.85rem; color: #1e293b; }
        .context-card li { margin-bottom: 2px; }

        .treatment-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
        .form-group textarea, .form-group input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.9rem; font-family: inherit; }
        .form-group textarea { min-height: 100px; resize: none; }

        .modal-footer { padding: 1.5rem 2rem; background: #f8fafc; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0; }
        .badge-status { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
        .badge-status.completed { background: #dcfce7; color: #16a34a; }
        .badge-status.pending { background: #fef3c7; color: #d97706; }
        .btn-cancel { padding: 0.75rem 1.5rem; border: 1px solid #e2e8f0; background: white; border-radius: 12px; cursor: pointer; font-weight: 600; }
        .btn-submit { padding: 0.75rem 1.5rem; background: #4f46e5; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; }

        /* Utilities */
        .toast-notification { position: fixed; bottom: 2rem; right: 2rem; background: #1e293b; color: white; padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 2000; animation: slideUp 0.3s ease; }
        
        .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
        .pagination button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
        .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
        .pagination .pages { font-size: 0.85rem; color: #64748b; }

        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .widgets-area { flex-direction: row; }
          .widget { flex: 1; }
        }
      `}</style>
    </div>
  );
}

export default DoctorDashboard;