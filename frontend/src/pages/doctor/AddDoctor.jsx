import { useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

function AddDoctor() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    available_from: "",
    available_to: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/admin/create-doctor", form, {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      alert("Doctor created successfully");
      navigate("/admin");

    } catch (error) {
      console.error(error);
      alert("Error creating doctor");
    }
  };

  return (
  <div className="container">
    <h2 className="title">Add Doctor</h2>

    <form onSubmit={handleSubmit} className="form">

      <input
        name="name"
        placeholder="Doctor Name"
        onChange={handleChange}
        required
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      <input
        name="specialization"
        placeholder="Specialization"
        onChange={handleChange}
        required
      />

      <div className="time-group">
        <div>
          <label>Available From</label>
          <input type="time" name="available_from" onChange={handleChange} required />
        </div>

        <div>
          <label>Available To</label>
          <input type="time" name="available_to" onChange={handleChange} required />
        </div>
      </div>

      <button type="submit">Create Doctor</button>

    </form>
  </div>
);
}

export default AddDoctor;