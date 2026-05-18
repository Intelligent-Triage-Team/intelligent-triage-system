
import { useEffect, useState } from "react";
import API from "../../api/api";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";



function AdminDashboard() {
    const navigate = useNavigate();
    const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  navigate("/login");
};
  const [stats, setStats] = useState(null);
  
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
  <div className="admin-layout">

    {/* LEFT SIDEBAR */}
    <aside className="admin-sidebar">

      <div className="sidebar-top">
        <h1 className="sidebar-logo">MediCore</h1>
        <p className="sidebar-subtitle">Admin Dashboard</p>
      </div>

      <nav className="sidebar-nav">
        <button onClick={() => document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" })}>
          Dashboard
        </button>

        <button onClick={() => navigate("/admin/doctors")}>
          Doctors
        </button>

        <button onClick={() => navigate("/admin/emergency")}>
          Emergency Cases
        </button>

        <button onClick={() => navigate("/admin/users")}>
          Users
        </button>
      </nav>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

    </aside>

    {/* RIGHT MAIN CONTENT */}
    <main className="admin-main">

      {/* HEADER SECTION */}
      <section id="dashboard" className="section header-section">
        <h1>Admin Dashboard</h1>
        <p>Monitor hospital system performance and users</p>
      </section>

      {/* STATS SECTION */}
      <section className="section">
        <div className="stats-grid">

          <div className="card">
            <h3>Total Users</h3>
            <p>{stats.total_users}</p>
          </div>

          <div className="card">
            <h3>Patients</h3>
            <p>{stats.total_patients}</p>
          </div>

          <div className="card">
            <h3>Doctors</h3>
            <p>{stats.total_doctors}</p>
          </div>

          <div className="card">
            <h3>Appointments</h3>
            <p>{stats.total_appointments}</p>
          </div>

          <div className="card">
            <h3>Triage Cases</h3>
            <p>{stats.total_predictions}</p>
          </div>

        </div>
      </section>

      {/* TRIAGE SECTION */}
      <section className="section">
        <h2 className="section-title">Triage Cases</h2>

        <div className="triage-grid">
          <div className="card danger">
            <h3>Emergency</h3>
            <p>{stats.emergency_cases}</p>
          </div>

          <div className="card warning">
            <h3>Urgent</h3>
            <p>{stats.urgent_cases}</p>
          </div>

          <div className="card success">
            <h3>Normal</h3>
            <p>{stats.normal_cases}</p>
          </div>
        </div>
      </section>

      {/* FLOW SECTION */}
      <section className="section">
        <h2 className="section-title">Patient Flow</h2>

        <div className="flow-grid">
          <div className="card waiting">
            <h3>Waiting</h3>
            <p>{stats.waiting_cases}</p>
          </div>

          <div className="card scheduled">
            <h3>Scheduled</h3>
            <p>{stats.scheduled_cases}</p>
          </div>

          <div className="card completed">
            <h3>Completed</h3>
            <p>{stats.completed_cases}</p>
          </div>
        </div>
      </section>

      {/* CHART SECTION */}
      <section className="section">
        <h2 className="section-title">Triage Distribution</h2>

        <div className="chart-box">
          <PieChart width={500} height={350}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
              label
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </section>

    </main>

  </div>
  );
}

export default AdminDashboard;