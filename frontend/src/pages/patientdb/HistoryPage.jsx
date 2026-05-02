import { useEffect, useState, useMemo } from "react";
import API from "../../api/api";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const cancelAppointment = async (id) => {
    try {
      const res = await API.put(`/appointment/${id}/cancel`, {}, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      alert(res.data.message);
      fetchHistory();
    } catch (error) {
      console.error(error);
      alert("Cancel failed");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get("/my-history", {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setHistory(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const processedHistory = useMemo(() => {
    let result = [...history];

    if (filterSeverity !== "all") {
      result = result.filter(item => item.severity === filterSeverity);
    }

    if (filterStatus !== "all") {
      result = result.filter(item => {
        const status = item.appointment_status || "none";
        return status === filterStatus;
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [history, filterSeverity, filterStatus, sortOrder]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="history-page">
      <div className="history-container">
        <header className="page-header">
          <h2>Patient Medical History</h2>
          <p>Review your past diagnostics and appointments</p>
        </header>

        <div className="controls-bar no-print">
          <div className="filters">
            <div className="control-group">
              <label>Severity:</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                <option value="all">All</option>
                <option value="emergency">Emergency</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="none">No Appointment</option>
              </select>
            </div>

            <div className="control-group">
              <label>Sort By:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <button className="btn-print" onClick={handlePrint}>
            📄 Export to PDF
          </button>
        </div>

        {processedHistory.length === 0 && (
          <div className="empty-state no-print">
            <div className="icon">📭</div>
            <h3>No Records Found</h3>
            <p>Try adjusting your filters or complete a new triage assessment.</p>
          </div>
        )}

        <div className="history-list printable-area">
          {processedHistory.map((item, index) => {
            const isEmergency = item.severity === "emergency";
            const isUrgent = item.severity === "urgent";
            const severityClass = isEmergency ? "emergency" : isUrgent ? "urgent" : "normal";
            const severityIcon = isEmergency ? "🚨" : isUrgent ? "⚠️" : "✅";

            return (
              <div key={item.appointment_id || index} className={`history-card ${severityClass}`}>
                <div className="card-header">
                  <div className="severity-badge">
                    <span className="icon">{severityIcon}</span>
                    <span className="text">{item.severity.toUpperCase()}</span>
                  </div>
                  <div className="date-badge">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "No Date"}
                  </div>
                </div>

                <div className="disease-info">
                  <h3>{item.predicted_disease}</h3>
                  <div className="confidence">
                    <span className="label">AI Confidence:</span>
                    <span className="value">{(item.prediction_confidence > 1 ? item.prediction_confidence : item.prediction_confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <span className="label">Doctor</span>
                    <span className="value">{item.doctor_name || "Unassigned"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Schedule</span>
                    <span className="value">
                      {item.appointment_date ? new Date(item.appointment_date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : "None"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status</span>
                    {item.appointment_status ? (
                      <span className={`status-pill ${item.appointment_status}`}>
                        {item.appointment_status}
                      </span>
                    ) : (
                      <span className="status-pill none">None</span>
                    )}
                  </div>
                </div>

                {item.appointment_id && item.appointment_status === "scheduled" && (
                  <div className="card-actions no-print">
                    <button className="btn-cancel" onClick={() => cancelAppointment(item.appointment_id)}>
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .history-page { min-height: 100vh; background: #f8fafc; padding: 4rem 1rem; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: flex-start; }
        .history-container { width: 100%; max-width: 800px; }
        
        .page-header { text-align: center; margin-bottom: 2.5rem; }
        .page-header h2 { margin: 0; font-size: 2.2rem; color: #1e293b; font-weight: 800; }
        .page-header p { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; }

        .controls-bar { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem 1.5rem; border-radius: 16px; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); flex-wrap: wrap; gap: 1rem; }
        .filters { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .control-group { display: flex; align-items: center; gap: 0.5rem; }
        .control-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .control-group select { padding: 0.5rem 1rem; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; color: #1e293b; font-size: 0.9rem; font-weight: 500; cursor: pointer; outline: none; transition: 0.2s; }
        .control-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .btn-print { background: #1e293b; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .btn-print:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

        .empty-state { text-align: center; background: white; padding: 4rem 2rem; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .empty-state .icon { font-size: 4rem; margin-bottom: 1rem; }
        .empty-state h3 { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.5rem; }
        .empty-state p { margin: 0; color: #64748b; }

        .history-list { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .history-card { background: white; border-radius: 20px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: 0.3s; border-left: 6px solid transparent; }
        .history-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.08); }
        
        .history-card.emergency { border-left-color: #ef4444; }
        .history-card.urgent { border-left-color: #f59e0b; }
        .history-card.normal { border-left-color: #10b981; }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .severity-badge { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 0.9rem; letter-spacing: 0.05em; }
        .emergency .severity-badge { color: #ef4444; }
        .urgent .severity-badge { color: #d97706; }
        .normal .severity-badge { color: #059669; }
        
        .date-badge { background: #f1f5f9; color: #475569; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

        .disease-info { margin-bottom: 1.5rem; }
        .disease-info h3 { margin: 0 0 0.25rem 0; font-size: 1.4rem; color: #1e293b; font-weight: 700; }
        .confidence { font-size: 0.9rem; color: #64748b; }
        .confidence .value { font-weight: 700; color: #3b82f6; margin-left: 0.25rem; }

        .appointment-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 12px; }
        .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-item .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        .detail-item .value { font-size: 0.95rem; color: #1e293b; font-weight: 500; }

        .status-pill { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; width: fit-content; }
        .status-pill.scheduled { background: #dcfce7; color: #15803d; }
        .status-pill.pending { background: #fef3c7; color: #b45309; }
        .status-pill.completed { background: #e0e7ff; color: #4338ca; }
        .status-pill.cancelled { background: #fee2e2; color: #b91c1c; }
        .status-pill.none { background: #f1f5f9; color: #64748b; }

        .card-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
        .btn-cancel { background: white; color: #ef4444; border: 1px solid #fca5a5; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-cancel:hover { background: #fef2f2; border-color: #ef4444; }

        @media print {
          body * { visibility: hidden; }
          .history-container, .history-container * { visibility: visible; }
          .history-container { position: absolute; left: 0; top: 0; width: 100%; padding: 0; background: white; }
          .no-print { display: none !important; }
          .history-page { background: white; padding: 0; }
          .history-card { box-shadow: none; border: 1px solid #e2e8f0; break-inside: avoid; margin-bottom: 20px; }
          .appointment-details { background: white; border: 1px solid #e2e8f0; }
        }
      `}</style>
    </div>
  );
}

export default HistoryPage;