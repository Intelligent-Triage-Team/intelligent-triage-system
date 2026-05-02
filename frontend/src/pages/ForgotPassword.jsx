import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResetLink("");

    try {
      const res = await fetch("http://localhost:3000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message);
        setMessageType("success");
        
        // Always show reset link for immediate access
        if (data.resetLink) {
          setResetLink(data.resetLink);
          setEmail(data.email);
        }
      } else {
        setMessage(data.message || "Something went wrong");
        setMessageType("error");
      }

    } catch (error) {
      console.error("Forgot password error:", error);
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
                <h3>Forgot Password</h3>
                <p className="text-muted mb-0">Enter your email to reset your password</p>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {message}
                    {messageType === 'success' && (
                      <div className="mt-3 p-3 bg-success bg-opacity-25 border border-success rounded">
                        <p className="mb-2 text-dark fw-bold">🔗 Your Password Reset Link:</p>
                        <div className="mb-2">
                          <code className="d-block p-2 bg-white border rounded small text-break">{resetLink}</code>
                        </div>
                        <a href={resetLink} target="_blank" rel="noopener noreferrer" className="btn btn-success w-100">
                          🚀 Click Here to Reset Password Now
                        </a>
                        <p className="mt-2 mb-0 text-muted small">
                          This link will expire in 1 hour for security
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
                
                <div className="text-center mt-3">
                  <Link to="/login" className="text-decoration-none">
                    ← Back to Login
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

export default ForgotPassword;