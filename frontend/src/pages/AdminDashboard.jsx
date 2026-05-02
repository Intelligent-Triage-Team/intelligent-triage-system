import { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area 
} from "recharts";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        cpu: 32, memory: 54, disk: 28, uptime: '24d 12h', apiStatus: 'online', dbStatus: 'connected'
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [notifications] = useState([
        { id: 1, type: 'warning', msg: 'System update scheduled for 02:00 AM', time: '10m ago' },
        { id: 2, type: 'success', msg: 'New medical staff registered: Dr. Amare', time: '1h ago' }
    ]);

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                API.get("/admin/stats", { headers: { Authorization: localStorage.getItem("token") } }),
                API.get("/admin/users", { headers: { Authorization: localStorage.getItem("token") } })
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (user) => {
        if (user.role === "admin") return alert("Cannot delete admin");
        if (!window.confirm(`Delete ${user.name}?`)) return;
        try {
            await API.delete(`/admin/user/${user.id}`, { headers: { Authorization: localStorage.getItem("token") } });
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error) { alert("Deletion failed"); }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [users, searchQuery]);

    const getDoctorStatus = (u) => {
        if (u.role !== 'doctor') return null;
        if (!u.available_from || !u.available_to) return { text: 'Unknown', class: 'unknown' };

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHours + currentMinutes / 60;

        const parseTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours + minutes / 60;
        };

        const fromTime = parseTime(u.available_from);
        const toTime = parseTime(u.available_to);

        const isOnShift = currentTime >= fromTime && currentTime <= toTime;

        if (!isOnShift) return { text: 'Off Duty', class: 'offline' };
        if (u.active_cases > 0) return { text: 'Busy', class: 'busy' };
        return { text: 'Available', class: 'available' };
    };

    const COLORS = ["#6366f1", "#f59e0b", "#ef4444"];
    const chartData = stats ? [
        { name: "Normal", value: stats.normal_cases },
        { name: "Urgent", value: stats.urgent_cases },
        { name: "Emergency", value: stats.emergency_cases }
    ] : [];

    if (loading || !stats) return <div className="loader">Initializing Admin Environment...</div>;

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <div className="logo-icon">H</div>
                    <span>ግዕዝ HealthCare</span>
                </div>
                
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <span className="icon">🏠</span> Dashboard
                    </button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <span className="icon">👥</span> Users
                    </button>
                    <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                        <span className="icon">📈</span> Analytics
                    </button>
                    <button className={activeTab === 'system' ? 'active' : ''} onClick={() => setActiveTab('system')}>
                        <span className="icon">⚙️</span> System Health
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="avatar">A</div>
                        <div className="info">
                            <div className="name">Admin Central</div>
                            <div className="role">Root Authority</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title">
                        <h1>{activeTab.toUpperCase()}</h1>
                        <p>ግዕዝ Intelligent Healthcare triage system </p>
                    </div>
                    <div className="header-actions">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder=" search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn-add" onClick={() => navigate("/add-doctor")}>+ Add New Doctor / Staff</button>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="overview-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon users">👥</div>
                                <div className="stat-data">
                                    <label>Total Users</label>
                                    <h3>{stats.total_users}</h3>
                                </div>
                                <div className="trend up">+12%</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon docs">👨‍⚕️</div>
                                <div className="stat-data">
                                    <label>Medical Staff</label>
                                    <h3>{stats.total_doctors}</h3>
                                </div>
                                <div className="trend">Stable</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon apps">📅</div>
                                <div className="stat-data">
                                    <label>Appointments</label>
                                    <h3>{stats.total_appointments}</h3>
                                </div>
                                <div className="trend up">+8%</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon alerts">🚨</div>
                                <div className="stat-data">
                                    <label>Emergencies</label>
                                    <h3>{stats.emergency_cases}</h3>
                                </div>
                                <div className="trend down">-5%</div>
                            </div>
                        </div>

                        <div className="charts-row">
                            <div className="chart-container large">
                                <h3>Patient Flow Analysis</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={[
                                        { name: 'Mon', count: 45 }, { name: 'Tue', count: 52 }, { name: 'Wed', count: 48 },
                                        { name: 'Thu', count: 61 }, { name: 'Fri', count: 55 }, { name: 'Sat', count: 32 }, { name: 'Sun', count: 38 }
                                    ]}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-container small">
                                <h3>Triage Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-content">
                        <div className="table-header-row">
                            <h3>Staff & Patient Registry</h3>
                            <button className="btn-add-primary" onClick={() => navigate("/add-doctor")}>
                                <span className="icon">➕</span> Add New Staff Member
                            </button>
                        </div>
                        <div className="table-card">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Availability</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td><b>{u.name}</b></td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge-role ${u.role}`}>{u.role.toUpperCase()}</span></td>
                                            <td>
                                                {u.role === 'doctor' ? (
                                                    <span className={`status-badge ${getDoctorStatus(u).class}`}>
                                                        {getDoctorStatus(u).text}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn-edit-mini" onClick={() => navigate(u.role === 'doctor' ? `/edit-doctor/${u.doctor_id}` : '#')}>Edit</button>
                                                <button className="btn-delete-mini" onClick={() => deleteUser(u)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="analytics-content">
                        <div className="chart-container">
                            <h3>Historical Triage Trends</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={[
                                    { name: 'Jan', emergency: 40, urgent: 24, normal: 24 },
                                    { name: 'Feb', emergency: 30, urgent: 13, normal: 22 },
                                    { name: 'Mar', emergency: 20, urgent: 98, normal: 22 },
                                    { name: 'Apr', emergency: 27, urgent: 39, normal: 20 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="emergency" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="urgent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="normal" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="system-content">
                        <div className="health-grid">
                            <div className="health-card">
                                <h4>CPU Load</h4>
                                <div className="gauge-outer"><div className="gauge-inner" style={{width: `${systemHealth.cpu}%`}}></div></div>
                                <span>{systemHealth.cpu}%</span>
                            </div>
                            <div className="health-card">
                                <h4>Memory Usage</h4>
                                <div className="gauge-outer"><div className="gauge-inner" style={{width: `${systemHealth.memory}%`}}></div></div>
                                <span>{systemHealth.memory}%</span>
                            </div>
                            <div className="health-card">
                                <h4>Storage</h4>
                                <div className="gauge-outer"><div className="gauge-inner" style={{width: `${systemHealth.disk}%`}}></div></div>
                                <span>{systemHealth.disk}%</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
                .admin-container { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; overflow: hidden; }
                
                .admin-sidebar { width: 280px; background: #1e293b; color: white; display: flex; flex-direction: column; }
                .sidebar-brand { padding: 2rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #334155; }
                .logo-icon { width: 40px; height: 40px; background: #6366f1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; }
                .sidebar-brand span { font-weight: 700; letter-spacing: 0.1em; }
                
                .sidebar-nav { padding: 2rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                .sidebar-nav button { background: none; border: none; color: #94a3b8; padding: 1rem 1.5rem; border-radius: 12px; text-align: left; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 1rem; font-weight: 500; }
                .sidebar-nav button:hover { background: #334155; color: white; }
                .sidebar-nav button.active { background: #6366f1; color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
                
                .sidebar-footer { padding: 1.5rem; border-top: 1px solid #334155; }
                .admin-profile { display: flex; align-items: center; gap: 1rem; }
                .avatar { width: 42px; height: 42px; background: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .info .name { font-size: 0.9rem; font-weight: 600; }
                .info .role { font-size: 0.75rem; color: #94a3b8; }

                .admin-main { flex: 1; overflow-y: auto; padding: 2.5rem; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .header-title h1 { margin: 0; font-size: 1.8rem; color: #1e293b; font-weight: 800; }
                .header-title p { margin: 0.25rem 0 0; color: #64748b; }
                
                .header-actions { display: flex; align-items: center; gap: 1.5rem; }
                .search-box input { padding: 0.75rem 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; width: 300px; transition: 0.3s; }
                .search-box input:focus { border-color: #6366f1; width: 400px; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); outline: none; }
                .btn-add { background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; white-space: nowrap; }
                .btn-add:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }

                .table-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .table-header-row h3 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 700; }
                .btn-add-primary { background: white; color: #6366f1; border: 2px solid #6366f1; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 0.75rem; }
                .btn-add-primary:hover { background: #6366f1; color: white; transform: scale(1.02); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15); }
                .btn-add-primary .icon { font-size: 1.1rem; }

                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-card { background: white; padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
                .stat-icon { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .stat-icon.users { background: #eef2ff; color: #6366f1; }
                .stat-icon.docs { background: #ecfdf5; color: #10b981; }
                .stat-icon.apps { background: #eff6ff; color: #3b82f6; }
                .stat-icon.alerts { background: #fef2f2; color: #ef4444; }
                .stat-data label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
                .stat-data h3 { margin: 0; font-size: 1.75rem; color: #1e293b; }
                .trend { position: absolute; top: 1.5rem; right: 1.5rem; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
                .trend.up { background: #dcfce7; color: #16a34a; }
                .trend.down { background: #fee2e2; color: #ef4444; }

                .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
                .chart-container { background: white; padding: 1.5rem; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .chart-container h3 { margin: 0 0 1.5rem; font-size: 1rem; color: #1e293b; font-weight: 700; }

                .table-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { background: #f8fafc; padding: 1.25rem; text-align: left; font-size: 0.8rem; color: #64748b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
                .admin-table td { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }
                .badge-role { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
                .badge-role.admin { background: #fef2f2; color: #ef4444; }
                .badge-role.doctor { background: #ecfdf5; color: #10b981; }
                .badge-role.patient { background: #eff6ff; color: #3b82f6; }
                
                .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; min-width: 80px; text-align: center; }
                .status-badge.available { background: #dcfce7; color: #16a34a; }
                .status-badge.busy { background: #fef08a; color: #ca8a04; }
                .status-badge.offline { background: #f1f5f9; color: #64748b; }
                .status-badge.unknown { background: #e2e8f0; color: #475569; }

                .btn-edit-mini { background: #f1f5f9; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin-right: 0.5rem; font-size: 0.8rem; }
                .btn-delete-mini { background: #fee2e2; color: #ef4444; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }

                .health-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
                .health-card { background: white; padding: 2rem; border-radius: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .health-card h4 { margin: 0 0 1.5rem; color: #64748b; font-size: 0.9rem; }
                .gauge-outer { height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; margin-bottom: 1rem; }
                .gauge-inner { height: 100%; background: #6366f1; border-radius: 6px; transition: width 0.5s ease; }
                .health-card span { font-size: 1.5rem; font-weight: 800; color: #1e293b; }

                .loader { height: 100vh; display: flex; align-items: center; justify-content: center; background: #1e293b; color: white; font-size: 1.2rem; font-weight: 600; letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
}

export default AdminDashboard;