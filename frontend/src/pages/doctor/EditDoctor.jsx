import { useState, useEffect } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";

function EditDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    available_from: "",
    available_to: ""
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await API.get(`/admin/doctor/${id}`, {
          headers: { Authorization: localStorage.getItem("token") }
        });
        setForm(res.data);
      } catch (error) {
        alert("Error loading doctor data");
      }
    };
    fetchDoctor();
  }, [id]);

  const specializations = [
    "General Medicine", "Cardiology", "Pediatrics", "Orthopedics", 
    "Neurology", "Dermatology", "Psychiatry", "Emergency Medicine", 
    "Radiology", "Surgery", "Internal Medicine", "Obstetrics & Gynecology"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/admin/doctor/${id}`, form, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      navigate("/admin");
    } catch (error) {
      alert("Error updating doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-page">
      <div className="form-container">
        <header className="form-header">
          <button className="btn-back" onClick={() => navigate("/admin")}>← Back to Dashboard</button>
          <h1>Modify Staff Credentials</h1>
          <p>Update the records and availability for Dr. {form.name.split(' ').pop()}.</p>
        </header>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-section">
            <h3>Identity & Contact</h3>
            <div className="input-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Official Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-section">
            <h3>Workforce Allocation</h3>
            <div className="input-group">
              <label>Specialization</label>
              <select name="specialization" value={form.specialization} onChange={handleChange} className="premium-select" required>
                <option value="">Select Specialization...</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div className="input-grid">
              <div className="input-group">
                <label>Duty Starts</label>
                <input type="time" name="available_from" value={form.available_from} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Duty Ends</label>
                <input type="time" name="available_to" value={form.available_to} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Saving Changes..." : "Apply Updates"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .add-doctor-page { min-height: 100vh; background: #f1f5f9; padding: 3rem 1rem; font-family: 'Inter', sans-serif; display: flex; justify-content: center; }
        .form-container { width: 100%; max-width: 800px; }
        
        .form-header { margin-bottom: 2.5rem; text-align: left; }
        .btn-back { background: none; border: none; color: #6366f1; font-weight: 600; cursor: pointer; margin-bottom: 1rem; padding: 0; }
        .form-header h1 { margin: 0; font-size: 2rem; color: #1e293b; font-weight: 800; }
        .form-header p { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; }

        .premium-form { background: white; padding: 2.5rem; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .form-section { margin-bottom: 2rem; }
        .form-section h3 { font-size: 1rem; color: #1e293b; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; }
        
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .input-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .input-group input { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; transition: 0.2s; }
        .input-group input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

        .btn-submit { width: 100%; padding: 1rem; background: #6366f1; color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.2s; margin-top: 1rem; }
        .btn-submit:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>
    </div>
  );
}

export default EditDoctor;