import { useEffect, useState } from "react";
import API from "../../api/api";

function AdminDoctors() {

  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [workload, setWorkload] = useState([]);

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

  return (
  <div className="min-h-screen bg-[#f5f7fb] flex">

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Doctors Management
      </h1>

      <div id="doctors">
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>
          Doctor Availability
        </h2>
      </div>

      {/* KEEP YOUR TABLES BELOW HERE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <table className="w-full border-collapse">
    <thead className="bg-gray-50">
      <tr>
<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Name
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Specialization
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  From
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  To
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Status
</th>
      </tr>
    </thead>

    <tbody>
      {doctorAvailability.map((doc) => (
        <tr
  key={doc.id}
  className="hover:bg-gray-50 transition-colors duration-200"
>
         <td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {doc.name}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {doc.specialization}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {doc.available_from}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {doc.available_to}
</td>
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
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
    isAvailable
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700"
  }`}
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
    <h2 style={{ textAlign: "center", marginTop: "40px" }}>
  Doctor Workload
</h2>
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <table className="w-full border-collapse">
    <thead className="bg-gray-50">
      <tr>
       <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Doctor
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Specialization
</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
  Scheduled Appointments
</th>
      </tr>
    </thead>

    <tbody>
      {workload.map((doc) => (
        <tr
  key={doc.id}
  className="hover:bg-gray-50 transition-colors duration-200"
>
          <td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {doc.name}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700">
  {doc.specialization}
</td>

<td className="px-6 py-4 border-t border-gray-100 text-gray-700 font-semibold">
  {doc.total_appointments}
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}

export default AdminDoctors;