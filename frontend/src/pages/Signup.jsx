import { useState } from "react";
import API from "../api/api";

function Signup() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/signup", formData);
      alert("User registered successfully");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

return (
  <div className="container">
    <h2>Register</h2>

    <form onSubmit={handleSubmit}>

      {/* <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={handleChange}
      /> */}
      <input
  type="text"
  name="name"
  placeholder="Name"
  value={formData.name}
  onChange={handleChange}
/>

      <br /><br />

      {/* <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      /> */}
      <input
  type="email"
  name="email"
  placeholder="Email"
  value={formData.email}
  onChange={handleChange}
/>

      <br /><br />

      {/* <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      /> */}
<input
  type="password"
  name="password"
  placeholder="Password"
  value={formData.password}
  onChange={handleChange}
/>
      <br /><br />

      <button type="submit">Signup</button>

    </form>
  </div>
);
}

export default Signup;