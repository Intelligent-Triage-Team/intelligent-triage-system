import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Invalid user data:", error);
    return <Navigate to="/login" />;
  }

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Token expired check
  try {
    const decoded = jwtDecode(token);
    // eslint-disable-next-line react-hooks/purity
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.clear();
      return <Navigate to="/login" />;
    }
  } catch {
    console.error("Invalid token:");
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  // Role mismatch
  if (role && user.role !== role) {

    // Strict fallback (safer)
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" />;
      case "doctor":
        return <Navigate to="/doctor" />;
      case "patient":
        return <Navigate to="/predict" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  //  Allowed
  return children;
}

export default ProtectedRoute;