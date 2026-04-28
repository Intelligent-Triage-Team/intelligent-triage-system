import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#333",
        padding: "10px",
        display: "flex",
        gap: "20px"
      }}
    >
      <Link to="/patient" style={{ color: "white", textDecoration: "none" }}>
        Patient Form
      </Link>

      <Link to="/result" style={{ color: "white", textDecoration: "none" }}>
        Result
      </Link>

      <Link to="/history" style={{ color: "white", textDecoration: "none" }}>
        History
      </Link>
    </nav>
  );
}

export default Navbar;