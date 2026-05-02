import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:3000/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setMessageType("success");
        
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message || "Password reset failed");
        setMessageType("error");
      }

    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Network error. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="animate-fade-in">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card">
              <div className="card-header text-center">
                <h3>Reset Password</h3>
                <p className="text-muted mb-0">Enter your new password</p>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength="6"
                    />
                    <small className="form-text text-muted">
                      Password must be at least 6 characters long
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength="6"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading || !password || !confirmPassword}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
                
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Remember your password? 
                  </small>
                  <br />
                  <Link to="/login" className="text-decoration-none">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;