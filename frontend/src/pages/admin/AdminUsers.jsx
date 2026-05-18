import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

function AdminUsers() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;

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

      if (user.role === "admin") {
        alert("Cannot delete admin");
        return;
      }

      if (!window.confirm(`Delete ${user.role}: ${user.name}?`)) {
        return;
      }

      const res = await API.delete(
        `/admin/user/${user.id}`
      );

      alert(res.data.message);

      setUsers(
        users.filter(u => u.id !== user.id)
      );

    } catch (error) {

      console.error(error);

    }

  };

  const updateRole = async (id, newRole) => {

    try {

      const selectedUser = users.find(
        u => u.id === id
      );

      if (!selectedUser) return;

      if (selectedUser.role === "admin") {
        alert("Cannot change admin role");
        return;
      }

      const res = await API.put(
        `/admin/user/${id}/role`,
        {
          role: newRole
        }
      );

      alert(res.data.message);

      setUsers(
        users.map(user =>
          user.id === id
            ? { ...user, role: newRole }
            : user
        )
      );

    } catch (error) {

      console.error(error);

    }

  };

  const filteredUsers = users.filter(user =>
    user.name
      .toLowerCase()
      .includes(searchUser.toLowerCase())
  );

  const indexOfLast =
    currentPage * usersPerPage;

  const indexOfFirst =
    indexOfLast - usersPerPage;

  const currentUsers =
    filteredUsers.slice(
      indexOfFirst,
      indexOfLast
    );

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  return (

    <div className="p-8">

<div id="users">

<h2 style={{ textAlign: "center", marginTop: "50px" }}>
  User Management
</h2>
</div>
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
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <table className="w-full border-collapse">
     <thead className="bg-gray-50">
      <tr>
<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  ID
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Name
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Email
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Role
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Action
</th>
      </tr>
      
    </thead>

    <tbody>
      {currentUsers.map(user => (
        <tr
  key={user.id}
  className="hover:bg-gray-50 transition-colors duration-200"
>
          <td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {user.id}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {user.name}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {user.email}
</td>
     <td>
  {user.role === "doctor" ? (
    <span
      style={{
        background: "#dcfce7",
        color: "#15803d",
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
        background: "#fee2e2",
        color: "#b91c1c",
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

export default AdminUsers;