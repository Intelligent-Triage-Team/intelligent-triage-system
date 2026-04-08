import { useState } from "react";
import API from "../api/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Login() {

  const [formData, setFormData] = useState({
    
    email: "",
    password: ""
  });
const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/login", formData);

      const token = res.data.token;

      // ✅ Save token
      localStorage.setItem("token", token);

      // ✅ Decode token
      const decoded = jwtDecode(token);
      // ✅ Save user info
// localStorage.setItem("user", JSON.stringify(decoded));

localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(decoded));
window.location.reload();

      alert("Login successful");

      // ✅ Redirect based on role
      if (decoded.role === "admin") {
        navigate("/admin");
      } else if (decoded.role === "doctor") {
        navigate("/doctor");
      } else {
        navigate("/predict");
      }

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
    
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <br /><br />

        <div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}   // 👈 ONLY this changes
    name="password"
    placeholder="Password"
    value={formData.password}                  // 👈 keep this SAME
    onChange={handleChange}                    // 👈 keep this SAME
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer"
    }}
  >
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>

        <br /><br />

        <button type="submit">Login</button>

      </form>
      <p>
  Forgot Password? <a href="/forgot">Click here</a>
</p>
    </div>
  );
}

export default Login;