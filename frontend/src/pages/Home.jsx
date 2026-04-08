import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // const user = JSON.parse(localStorage.getItem("user"));
  const user = (() => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Invalid user:", error);
    return null;
  }
})();

  const goToDashboard = () => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/predict");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out");
    navigate("/login");
  };

  return (
    <div className="container">
      <h1>Healthcare Triage System</h1>

      <p>AI-based system to prioritize patients based on urgency.</p>

      <br />

      {!token ? (
        <>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Signup</button>
        </>
      ) : (
        <>
          <button onClick={goToDashboard}>Go to Dashboard</button>
          <button onClick={logout}>Logout</button>
        </>
      )}

    </div>
  );
}

export default Home;