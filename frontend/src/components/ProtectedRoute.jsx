import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // ❌ Wrong role → smart redirect
  if (role && user.role !== role) {

    if (user.role === "admin") {
      return <Navigate to="/admin" />;
    } 
    else if (user.role === "doctor") {
      return <Navigate to="/doctor" />;
    } 
    else {
      return <Navigate to="/predict" />;
    }
  }

  // ✅ Allowed
  return children;
}

export default ProtectedRoute;