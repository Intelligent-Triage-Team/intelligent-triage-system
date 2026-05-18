import { useEffect, useState } from "react";
import API from "../../api/api";

function AdminEmergency() {

  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {

    API.get("/admin/emergency-list", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    })
      .then(res => setEmergencies(res.data))
      .catch(err => console.error(err));

  }, []);

  return (

    <div className="p-8">

  <div id="emergency">
<h2 style={{ textAlign: "center", marginTop: "40px", color: "#e74c3c" }}>
  Recent Emergency Cases
</h2>
</div>
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <table className="w-full border-collapse">
    <thead className="bg-gray-50">
      <tr>
       <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Patient
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Disease
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Time
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Status
</th>
      </tr>
    </thead>

    <tbody>
      {emergencies.map((item) => (
        <tr
  key={item.id}
  className="hover:bg-gray-50 transition-colors duration-200"
>
         <td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {item.patient_name}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {item.predicted_disease}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {new Date(item.created_at).toLocaleString()}
</td>
          <td>
         <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
    item.status === "completed"
      ? "bg-green-100 text-green-700"
      : item.status === "scheduled"
      ? "bg-blue-100 text-blue-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {item.status || "waiting"}
</span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>
    </div>

  );

}

export default AdminEmergency;