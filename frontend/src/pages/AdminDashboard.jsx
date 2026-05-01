import { useEffect, useState } from "react";
import API from "../api/api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
function AdminDashboard() {
    const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/admin/stats", {
  headers: {
    Authorization: localStorage.getItem("token")
  }
})
  .then(res => setStats(res.data))
      .catch(err => console.error(err));
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
const deleteUser = async (user) => {
  try {

    // Prevent deleting admin
    if (user.role === "admin") {
      alert("Cannot delete admin");
      return;
    }

    // Confirmation popup
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const res = await API.delete(`/admin/user/${user.id}`);
const data = res.data; // 

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

    // Prevent changing admin
    if (selectedUser.role === "admin") {
      alert("Cannot change admin role");
      return;
    }

    const res = await API.put(`/admin/user/${id}/role`, {
  role: newRole
});

const data = res.data; // 

    alert(data.message);

    // update UI instantly
    setUsers(users.map(user =>
      user.id === id ? { ...user, role: newRole } : user
    ));

  } catch (error) {
    console.error(error);
  }
};
  return (
    <div className="dashboard bg-gray-100 min-h-screen p-6">

      <h2>Admin Dashboard</h2>

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

{users.length === 0 && (
  <p style={{ textAlign: "center", marginTop: "20px" }}>
    No users found
  </p>
)}
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
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.id}</td>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>
  {user.role === "doctor" ? (
    <span style={{ color: "green", fontWeight: "bold" }}>
      Doctor
    </span>
  ) : (
    <select
      value={user.role}
      disabled={user.role === "admin"}
      onChange={(e) => updateRole(user.id, e.target.value)}
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

  <button onClick={() => deleteUser(user)}>
    Delete
  </button>
</td>
        </tr>
      ))}
      
    </tbody>
  </table>
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