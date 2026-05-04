import { useEffect, useState } from "react";
import API from "../api/api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";



function AdminDashboard() {
    const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
const [workload, setWorkload] = useState([]);
const [emergencies, setEmergencies] = useState([]);
const [searchUser, setSearchUser] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 5;
  useEffect(() => {

  const fetchStats = () => {
    API.get("/admin/stats", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    })
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  };

  fetchStats();

  const interval = setInterval(fetchStats, 5000);

  return () => clearInterval(interval);

}, []);
const [users, setUsers] = useState([]);
    useEffect(() => {
  API.get("/admin/users", {
  headers: {
    Authorization: localStorage.getItem("token")
  }
})
  .then(res => setUsers(res.data))
    .catch(err => console.error(err));
}, []);
useEffect(() => {
  API.get("/admin/doctors-availability", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  })
    .then(res => setDoctorAvailability(res.data))
    .catch(err => console.error(err));
}, []);
useEffect(() => {
  API.get("/admin/doctor-workload", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  })
    .then(res => setWorkload(res.data))
    .catch(err => console.error(err));
}, []);
useEffect(() => {
  API.get("/admin/emergency-list", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  })
    .then(res => setEmergencies(res.data))
    .catch(err => console.error(err));
}, []);
const deleteUser = async (user) => {
  try {

    // 1️⃣ Prevent deleting admin
    if (user.role === "admin") {
      alert("Cannot delete admin");
      return;
    }

    // 2️⃣ Confirmation popup
    if (!window.confirm(`Delete ${user.role}: ${user.name}?`)) return;

    const res = await API.delete(`/admin/user/${user.id}`);
const data = res.data; // ✅

    alert(data.message);

    // remove user instantly from UI
    setUsers(users.filter(u => u.id !== user.id));

  } catch (error) {
    console.error(error);
  }
};
  if (!stats) return <h2>Loading...</h2>;
  const chartData = [
  { name: "Emergency", value: stats.emergency_cases },
  { name: "Urgent", value: stats.urgent_cases },
  { name: "Normal", value: stats.normal_cases }
];

const COLORS = ["#e74c3c", "#f39c12", "#27ae60"];
const updateRole = async (id, newRole) => {
  try {

    // find the user first
    const selectedUser = users.find(u => u.id === id);
    if (!selectedUser) return;

    // 🔒 Prevent changing admin
    if (selectedUser.role === "admin") {
      alert("Cannot change admin role");
      return;
    }

    const res = await API.put(`/admin/user/${id}/role`, {
  role: newRole
});

const data = res.data; // ✅

    alert(data.message);

    // update UI instantly
    setUsers(users.map(user =>
      user.id === id ? { ...user, role: newRole } : user
    ));

  } catch (error) {
    console.error(error);
  }
};
const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchUser.toLowerCase())
);

const indexOfLast = currentPage * usersPerPage;
const indexOfFirst = indexOfLast - usersPerPage;

const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  return (
    <div className="dashboard bg-gray-100 min-h-screen p-6">

      <h1>Admin Dashboard</h1>

      <div className="card-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">

<div className="dashboard-card bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
  <h3 className="text-gray-500 text-sm">Total Users</h3>
<p className="text-2xl font-bold mt-2">{stats.total_users}</p>
</div>

        <div className="dashboard-card bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h3>Patients</h3>
          <p>{stats.total_patients}</p>
        </div>

        <div className="dashboard-card bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h3>Doctors</h3>
          <p>{stats.total_doctors}</p>
        </div>

        <div className="dashboard-card bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
          <h3>Appointments</h3>
          <p>{stats.total_appointments}</p>
        </div>
<div className="dashboard-card bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition">
  <h3>Total Triage Cases</h3>
  <p>{stats.total_predictions}</p>
</div>
      </div>
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
  Doctor Availability
</h2>

<div className="container">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Specialization</th>
        <th>From</th>
        <th>To</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {doctorAvailability.map((doc) => (
        <tr key={doc.id}>
          <td>{doc.name}</td>
          <td>{doc.specialization}</td>
          <td>{doc.available_from}</td>
          <td>{doc.available_to}</td>
          <td>
  {(() => {
    const now = new Date();

    const current =
      now.getHours() * 60 + now.getMinutes();

    const fromParts = doc.available_from.split(":");
    const toParts = doc.available_to.split(":");

    const from =
      parseInt(fromParts[0]) * 60 +
      parseInt(fromParts[1]);

    const to =
      parseInt(toParts[0]) * 60 +
      parseInt(toParts[1]);

    const isAvailable = current >= from && current <= to;

    return (
      <span
        style={{
          color: isAvailable ? "green" : "red",
          fontWeight: "bold"
        }}
      >
        {isAvailable ? "Available" : "Unavailable"}
      </span>
    );
  })()}
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      <h2>Triage Cases</h2>

      <div className="card-container">

       <div className="dashboard-card emergency">
          <h3>Emergency</h3>
          <p>{stats.emergency_cases}</p>
        </div>

        <div className="dashboard-card urgent">
          <h3>Urgent</h3>
          <p>{stats.urgent_cases}</p>
        </div>

        <div className="dashboard-card normal">
          <h3>Normal</h3>
          <p>{stats.normal_cases}</p>
        </div>

      </div>
<h2 style={{ marginTop: "40px" }}>Patient Flow Monitor</h2>

<div className="card-container grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">

  <div className="dashboard-card bg-yellow-100 p-5 rounded-xl shadow-md">
    <h3>Waiting</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold" }}>
      {stats.waiting_cases}
    </p>
  </div>

  <div className="dashboard-card bg-blue-100 p-5 rounded-xl shadow-md">
    <h3>Scheduled</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold" }}>
      {stats.scheduled_cases}
    </p>
  </div>

  <div className="dashboard-card bg-green-100 p-5 rounded-xl shadow-md">
    <h3>Completed</h3>
    <p style={{ fontSize: "28px", fontWeight: "bold" }}>
      {stats.completed_cases}
    </p>
  </div>

</div>


<h2>Triage Distribution</h2>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "20px"
  }}
>
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      width: "520px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
    }}
  >
    <PieChart width={500} height={350}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        outerRadius={110}
        dataKey="value"
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={index} fill={COLORS[index]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </div>
</div>
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
  Doctor Workload
</h2>
<div className="container">
  <table>
    <thead>
      <tr>
        <th>Doctor</th>
        <th>Specialization</th>
        <th>Scheduled Appointments</th>
      </tr>
    </thead>

    <tbody>
      {workload.map((doc) => (
        <tr key={doc.id}>
          <td>{doc.name}</td>
          <td>{doc.specialization}</td>
          <td>
            <b>{doc.total_appointments}</b>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<h2 style={{ textAlign: "center", marginTop: "40px", color: "#e74c3c" }}>
  Recent Emergency Cases
</h2>

<div className="container">
  <table>
    <thead>
      <tr>
        <th>Patient</th>
        <th>Disease</th>
        <th>Time</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {emergencies.map((item) => (
        <tr key={item.id}>
          <td>{item.patient_name}</td>
          <td>{item.predicted_disease}</td>
          <td>
            {new Date(item.created_at).toLocaleString()}
          </td>
          <td>
            <span style={{
              color:
                item.status === "completed"
                  ? "green"
                  : item.status === "scheduled"
                  ? "blue"
                  : "red",
              fontWeight: "bold"
            }}>
              {item.status || "waiting"}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<h2 style={{ textAlign: "center", marginTop: "50px" }}>
  User Management
</h2>

<div style={{ textAlign: "right", marginBottom: "10px" }}>
  <button 
    className="btn-add"
    onClick={() => navigate("/add-doctor")}
  >
    + Add Doctor
  </button>
</div>
<input
  type="text"
  placeholder="Search user by name..."
  value={searchUser}
  onChange={(e) => {
  setSearchUser(e.target.value);
  setCurrentPage(1);
}}
  style={{
    padding: "10px",
    width: "300px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }}
/>
{users.length === 0 && (
  <p style={{ textAlign: "center", marginTop: "20px" }}>
    No users found
  </p>
)}
<p style={{
  marginBottom: "10px",
  color: "#555",
  fontWeight: "500"
}}>
  Showing {currentUsers.length} of {filteredUsers.length} users
</p>
<div className="container">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Action</th>
      </tr>
      
    </thead>

    <tbody>
      {currentUsers.map(user => (
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.name}</td>
          <td>{user.email}</td>
     <td>
  {user.role === "doctor" ? (
    <span
      style={{
        background: "#2ecc71",
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold"
      }}
    >
      Doctor
    </span>
  ) : user.role === "admin" ? (
    <span
      style={{
        background: "#e74c3c",
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontWeight: "bold"
      }}
    >
      Admin
    </span>
  ) : (
    <select
      value={user.role}
      onChange={(e) => updateRole(user.id, e.target.value)}
      style={{
        padding: "6px",
        borderRadius: "6px"
      }}
    >
      <option value="patient">Patient</option>
      <option value="admin">Admin</option>
    </select>
  )}
</td>
         <td>
  {user.role === "doctor" && user.doctor_id && (
  <button 
  onClick={() => navigate(`/edit-doctor/${user.doctor_id}`)}
  style={{
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    marginRight: "6px",
    cursor: "pointer"
  }}
>
  Edit
</button>
)}

 {user.role === "admin" ? (
  <button
    disabled
    style={{
      background: "#bdc3c7",
      color: "white",
      border: "none",
      padding: "6px 12px",
      borderRadius: "5px",
      cursor: "not-allowed"
    }}
  >
    Protected
  </button>
) : (
  <button onClick={() => deleteUser(user)}>
    Delete
  </button>
)}
</td>
        </tr>
      ))}
      
    </tbody>
  </table>
</div>

<div style={{
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  marginTop: "20px",
  alignItems: "center"
}}>
  <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Previous
  </button>

  <span>
    Page {currentPage} of {totalPages || 1}
  </span>

  <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>
<button 
  className="btn-add"
  onClick={() => navigate("/add-doctor")}
>
  + Add Doctor
</button>
    </div>
  );
}

export default AdminDashboard;