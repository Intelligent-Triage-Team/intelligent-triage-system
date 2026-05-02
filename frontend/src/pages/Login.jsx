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

    // ✅ Save token + user
    localStorage.setItem("token", token);

    const decoded = jwtDecode(token);
    localStorage.setItem("user", JSON.stringify(decoded));

    // ✅ Redirect based on role
    if (decoded.role === "admin") {
      navigate("/admin");
    } else if (decoded.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/predict");
    }

    // ✅ Refresh page AFTER redirect (for navbar update)
    setTimeout(() => {
      window.location.reload();
    }, 100);

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
  Forgot Password? <a href="/forgot-password">Click here</a>
</p>
<p style={{ marginTop: "10px" }}>
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/signup")}
    style={{
      color: "#1abc9c",
      cursor: "pointer",
      fontWeight: "600"
    }}
  >
    Signup
  </span>
</p>
    </div>
    
  );
}

export default Login;