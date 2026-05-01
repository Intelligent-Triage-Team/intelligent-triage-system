import { useState, useEffect } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";

function EditDoctor() {

  const { id } = useParams();   // get doctor id from URL
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    available_from: "",
    available_to: ""
  });

  //  LOAD DATA
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await API.get(`/admin/doctor/${id}`, {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        });

        setForm(res.data); // 

      } catch (error) {
        console.error(error);
        alert("Error loading doctor data");
      }
    };

    fetchDoctor();
  }, [id]);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // UPDATE (we will do next step)
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await API.put(`/admin/doctor/${id}`, form, {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    alert(res.data.message);

    // go back to admin dashboard
    navigate("/admin");

  } catch (error) {
    console.error(error);
    alert("Error updating doctor");
  }
};

  return (
    <div className="container">
      <h2>Edit Doctor</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
        />

        <label>Available From</label>
        <input
          type="time"
          name="available_from"
          value={form.available_from}
          onChange={handleChange}
        />

        <label>Available To</label>
        <input
          type="time"
          name="available_to"
          value={form.available_to}
          onChange={handleChange}
        />

        <button type="submit">Update Doctor</button>

      </form>
    </div>
  );
}

export default EditDoctor;