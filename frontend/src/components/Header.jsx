import { Link } from "react-router-dom";

function Header() {
  return (
    <header
      style={{
        backgroundColor: "#222",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "center",
        gap: "30px"
      }}
    >
      <Link to="/" style={linkStyle}>Home</Link>
      <Link to="/about" style={linkStyle}>About</Link>
      <Link to="/services" style={linkStyle}>Services</Link>
      <Link to="/contact" style={linkStyle}>Contact</Link>
      <Link to="/services-portal" style={linkStyle}>Portal</Link>
    </header>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "15px"
};

export default Header;