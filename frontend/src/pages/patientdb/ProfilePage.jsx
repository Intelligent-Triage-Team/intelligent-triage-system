import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import API from "../../api/api";

function ProfilePage() {
const [formData, setFormData] = useState({
  name: "",
  email: "",
  age: "",
  gender: "",
  blood_group: "",
  weight: "",
  height: "",
  allergies: "",
  chronic_disease: "",
  dob: "",
  emergency_contact: ""
});
const [history, setHistory] = useState([]);
const [showHistory, setShowHistory] = useState(false);
const [photo, setPhoto] = useState(
  localStorage.getItem("profilePhoto") || ""
);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

setFormData({
  name: res.data.name ?? "",
  email: res.data.email ?? "",
  age: res.data.age ?? "",
  gender: res.data.gender ?? "",
  blood_group: res.data.blood_group ?? "",
  weight: res.data.weight ?? "",
  height: res.data.height ?? "",
  allergies: res.data.allergies ?? "",
  chronic_disease: res.data.chronic_disease ?? "",
  dob: res.data.dob ? res.data.dob.split("T")[0] : "",
  emergency_contact: res.data.emergency_contact ?? ""
});
    } catch (error) {
      console.error(error);
    }
  };
const fetchProfileHistory = async () => {
  try {
    const res = await API.get("/profile-history", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setHistory(res.data);
    setShowHistory(true);

  } catch (error) {
    console.error(error);
    alert("Failed to load profile history");
  }
};
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await API.put("/profile",
        {
  name: formData.name,
  age: formData.age,
  gender: formData.gender,
  blood_group: formData.blood_group,
  weight: formData.weight,
  height: formData.height,
  allergies: formData.allergies,
  chronic_disease: formData.chronic_disease,
  dob: formData.dob,
  emergency_contact: formData.emergency_contact
},
        {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        }
      );

      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };
const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Patient Medical Report", 20, 20);

  doc.setFontSize(12);

  let y = 40;

  const lines = [
    `Name: ${formData.name}`,
    `Email: ${formData.email}`,
    `Age: ${formData.age}`,
    `Gender: ${formData.gender}`,
    `Blood Group: ${formData.blood_group}`,
    `Weight: ${formData.weight} kg`,
    `Height: ${formData.height} cm`,
    `Allergies: ${formData.allergies}`,
    `Chronic Disease: ${formData.chronic_disease}`,
    `Date of Birth: ${formData.dob}`,
    `Emergency Contact: ${formData.emergency_contact}`
  ];

  lines.forEach((line) => {
    doc.text(line, 20, y);
    y += 10;
  });

  doc.save("patient-report.pdf");
};
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "14px",
  boxSizing: "border-box"
};

const thStyle = {
  padding: "12px",
  fontWeight: "600"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee"
};
const handlePhotoChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setPhoto(reader.result);
    localStorage.setItem("profilePhoto", reader.result);
  };

  reader.readAsDataURL(file);
};
return (
  <div className="container" style={{ padding: "30px" }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          window.innerWidth < 768
            ? "1fr"
            : "repeat(auto-fit, minmax(420px, 1fr))",
        gap: "25px",
        maxWidth: "1100px",
        margin: "auto",
        alignItems: "stretch"
      }}
    >
      {/* LEFT CARD */}
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          height: "100%"
        }}
      >
        
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#2c3e50"
          }}
        >
          Current Profile
        </h2>

        <p><b>Name:</b> {formData.name || "-"}</p>
        <p><b>Email:</b> {formData.email || "-"}</p>
        <p><b>Age:</b> {formData.age || "-"}</p>
        <p><b>Gender:</b> {formData.gender || "-"}</p>
        <p><b>Blood Group:</b> {formData.blood_group || "-"}</p>
        <p><b>Weight:</b> {formData.weight || "-"} kg</p>
        <p><b>Height:</b> {formData.height || "-"} cm</p>
        <p><b>Allergies:</b> {formData.allergies || "-"}</p>
        <p><b>Chronic Disease:</b> {formData.chronic_disease || "-"}</p>
        <p><b>Date of Birth:</b> {formData.dob || "-"}</p>
        <p><b>Emergency Contact:</b> {formData.emergency_contact || "-"}</p>
        <p><b>Role:</b> patient</p>

        <button
          onClick={downloadPDF}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.2s"
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Download Report PDF
        </button>

        <button
          onClick={fetchProfileHistory}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "12px",
            background: "#2ecc71",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.2s"
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          View Update History
        </button>
      </div>

      {/* RIGHT CARD */}
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          height: "100%"
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#2c3e50"
          }}
        >
          Edit Profile
        </h2>

        <form onSubmit={handleUpdate}>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Name"
            style={inputStyle}
          />

          <input
            value={formData.email || ""}
            disabled
            style={inputStyle}
          />

          <input
            name="age"
            value={formData.age || ""}
            onChange={handleChange}
            placeholder="Age"
            style={inputStyle}
          />

          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input
            name="blood_group"
            value={formData.blood_group || ""}
            onChange={handleChange}
            placeholder="Blood Group"
            style={inputStyle}
          />

          <input
            name="weight"
            value={formData.weight || ""}
            onChange={handleChange}
            placeholder="Weight (kg)"
            style={inputStyle}
          />

          <input
            name="height"
            value={formData.height || ""}
            onChange={handleChange}
            placeholder="Height (cm)"
            style={inputStyle}
          />

          <input
            name="allergies"
            value={formData.allergies || ""}
            onChange={handleChange}
            placeholder="Allergies"
            style={inputStyle}
          />

          <input
            name="chronic_disease"
            value={formData.chronic_disease || ""}
            onChange={handleChange}
            placeholder="Chronic Disease"
            style={inputStyle}
          />

          <input
            type="date"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            name="emergency_contact"
            value={formData.emergency_contact || ""}
            onChange={handleChange}
            placeholder="Emergency Contact"
            style={inputStyle}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>

    {/* HISTORY */}
    {showHistory && (
      <div
        style={{
          maxWidth: "1100px",
          margin: "30px auto",
          background: "#ffffff",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#2c3e50"
          }}
        >
          Profile Update History
        </h2>

        {history.length === 0 ? (
          <p style={{ textAlign: "center" }}>No history found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center"
            }}
          >
            <thead>
              <tr style={{ background: "#2c3e50", color: "white" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Weight</th>
                <th style={thStyle}>Height</th>
                <th style={thStyle}>Blood Group</th>
                <th style={thStyle}>Allergies</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>
                    {new Date(item.updated_at).toLocaleString()}
                  </td>
                  <td style={tdStyle}>{item.weight || "-"}</td>
                  <td style={tdStyle}>{item.height || "-"}</td>
                  <td style={tdStyle}>{item.blood_group || "-"}</td>
                  <td style={tdStyle}>{item.allergies || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )}
  </div>
);
}

export default ProfilePage;