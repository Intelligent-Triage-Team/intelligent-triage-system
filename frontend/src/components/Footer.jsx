import { Link } from "react-router-dom";
import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Simulate API call for newsletter subscription
      console.log('Subscribing email:', email);
      setSubscribed(true);
      
      // Store subscription in localStorage for demo
      const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
      subscriptions.push({
        email: email,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
      
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const handleServiceClick = (service) => {
    // Navigate to unified services portal
    window.location.href = '/services';
  };

  const handleLegalClick = (page) => {
    // Create modal for legal pages
    const legalContent = {
      privacy: {
        title: 'Privacy Policy',
        content: `
          <h5>Privacy Policy for HealthCare AI</h5>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          
          <h6>1. Information We Collect</h6>
          <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
          
          <h6>2. How We Use Your Information</h6>
          <p>We use information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          
          <h6>3. Information Sharing</h6>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
          
          <h6>4. Data Security</h6>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access.</p>
          
          <h6>5. Contact Us</h6>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@healthcareai.com</p>
        `
      },
      terms: {
        title: 'Terms of Service',
        content: `
          <h5>Terms of Service for HealthCare AI</h5>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          
          <h6>1. Acceptance of Terms</h6>
          <p>By accessing and using HealthCare AI, you accept and agree to be bound by terms and provision of this agreement.</p>
          
          <h6>2. Use License</h6>
          <p>Permission is granted to temporarily download one copy of the materials on HealthCare AI for personal, non-commercial transitory viewing only.</p>
          
          <h6>3. Disclaimer</h6>
          <p>The materials on HealthCare AI are provided on an 'as is' basis. HealthCare AI makes no warranties, expressed or implied.</p>
          
          <h6>4. Limitations</h6>
          <p>In no event shall HealthCare AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit).</p>
          
          <h6>5. Contact Information</h6>
          <p>Questions about Terms of Service should be sent to legal@healthcareai.com</p>
        `
      },
      cookies: {
        title: 'Cookie Policy',
        content: `
          <h5>Cookie Policy for HealthCare AI</h5>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          
          <h6>What Are Cookies</h6>
          <p>Cookies are small text files that are placed on your computer or mobile device when you visit our website.</p>
          
          <h6>How We Use Cookies</h6>
          <p>We use cookies to make our website work, to personalize content and ads, to provide social media features, and to analyze our traffic.</p>
          
          <h6>Types of Cookies We Use</h6>
          <ul>
            <li>Essential cookies: Required for website to function</li>
            <li>Analytics cookies: Help us understand how visitors interact with our website</li>
            <li>Functional cookies: Enable enhanced functionality and personalization</li>
          </ul>
          
          <h6>Managing Cookies</h6>
          <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer.</p>
        `
      },
      accessibility: {
        title: 'Accessibility Statement',
        content: `
          <h5>Accessibility Statement for HealthCare AI</h5>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          
          <h6>Our Commitment</h6>
          <p>HealthCare AI is committed to ensuring digital accessibility for people with disabilities.</p>
          
          <h6>Measures to Support Accessibility</h6>
          <p>We are continuously improving the user experience for everyone and applying relevant accessibility standards.</p>
          
          <h6>Conformance Status</h6>
          <p>We aim to conform to Level AA of World Wide Web Consortium (W3C) Web Content Accessibility Guidelines.</p>
          
          <h6>Feedback</h6>
          <p>We welcome your feedback on accessibility of HealthCare AI. Please let us know if you encounter accessibility barriers.</p>
          
          <h6>Contact Us</h6>
          <p>Email: accessibility@healthcareai.com | Phone: +1 (555) 123-4567</p>
        `
      },
      sitemap: {
        title: 'Sitemap',
        content: `
          <h5>HealthCare AI Sitemap</h5>
          
          <h6>Main Pages</h6>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
          
          <h6>User Portals</h6>
          <ul>
            <li><a href="/login">Patient Login</a></li>
            <li><a href="/doctor">Doctor Portal</a></li>
            <li><a href="/admin">Admin Portal</a></li>
          </ul>
          
          <h6>Services</h6>
          <ul>
            <li>AI Diagnosis</li>
            <li>Emergency Triage</li>
            <li>Telemedicine</li>
            <li>Patient Monitoring</li>
            <li>Health Analytics</li>
            <li>Medical Research</li>
          </ul>
          
          <h6>Support</h6>
          <ul>
            <li>Help Center</li>
            <li>Contact Support</li>
            <li>FAQ</li>
            <li>Documentation</li>
          </ul>
        `
      }
    };

    const content = legalContent[page];
    if (!content) return;

    // Create modal
    const modalHtml = `
      <div class="modal fade" id="legalModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${content.title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              ${content.content}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="printLegalContent()">Print</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('legalModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('legalModal'));
    modal.show();

    // Add print function to window
    window.printLegalContent = () => {
      const printContent = document.getElementById('legalModal').querySelector('.modal-body').innerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${content.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h5 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              h6 { color: #555; margin-top: 20px; }
              ul { margin: 10px 0; }
              li { margin: 5px 0; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <footer className="professional-footer">
      {/* Top Section with Background Pattern */}
      <div className="footer-top">
        <div className="container-fluid">
          <div className="row">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-brand">
                <div className="brand-logo">
                  <i className="fas fa-heartbeat"></i>
                  <span>ግዕዝ Intelligent Healthcare triage  system </span>
                </div>
                <p className="brand-description">
                  Leading the future of healthcare with intelligent triage systems and AI-powered patient care solutions. 
                  We're committed to revolutionizing medical diagnosis and treatment through cutting-edge technology.
                </p>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>ግዕዝ Software Solution , አዲስ አበባ</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>+251 (000) 918-763378</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>info@ግዕዝhealthcareai.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h6 className="footer-heading">Quick Links</h6>
                <ul className="footer-links">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/services">Services</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/login">Patient Portal</Link></li>
                  <li><Link to="/doctor">Doctor Portal</Link></li>
                </ul>
              </div>
            </div>

            {/* Services */}
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="footer-section">
                <h6 className="footer-heading">Our Services</h6>
                <ul className="footer-links">
                  <li><a href="#ai-diagnosis" onClick={(e) => { e.preventDefault(); handleServiceClick('ai-diagnosis'); }}>AI Diagnosis</a></li>
                  <li><a href="#triage" onClick={(e) => { e.preventDefault(); handleServiceClick('triage'); }}>Emergency Triage</a></li>
                  <li><a href="#telemedicine" onClick={(e) => { e.preventDefault(); handleServiceClick('telemedicine'); }}>Telemedicine</a></li>
                  <li><a href="#monitoring" onClick={(e) => { e.preventDefault(); handleServiceClick('monitoring'); }}>Patient Monitoring</a></li>
                  <li><a href="#analytics" onClick={(e) => { e.preventDefault(); handleServiceClick('analytics'); }}>Health Analytics</a></li>
                  <li><a href="#research" onClick={(e) => { e.preventDefault(); handleServiceClick('research'); }}>Medical Research</a></li>
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="footer-section">
                <h6 className="footer-heading">Stay Updated</h6>
                <p className="newsletter-text">
                  Subscribe to our newsletter for the latest updates on healthcare technology and medical innovations.
                </p>
                
                {!subscribed ? (
                  <form className="newsletter-form" onSubmit={handleSubscribe}>
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <button className="btn btn-subscribe" type="submit">
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="success-message">
                    <i className="fas fa-check-circle"></i>
                    <span>Successfully subscribed!</span>
                  </div>
                )}

                <div className="social-media">
                  <h6 className="social-heading">Follow Us</h6>
                  <div className="social-icons" >
                    <a href="https://facebook.com/HealthCareAI" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow us on Facebook">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com/HealthCareAI" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow us on Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://instagram.com/healthcare.ai" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow us on Instagram">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://linkedin.com/company/healthcare-ai" target="_blank" rel="noopener noreferrer" className="social-icon" title="Connect on LinkedIn">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="https://youtube.com/@HealthCareAI" target="_blank" rel="noopener noreferrer" className="social-icon" title="Subscribe on YouTube">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://tiktok.com/@healthcare.ai" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow us on TikTok">
                      <i className="fab fa-tiktok"></i>
                    </a>
                    <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="social-icon" title="Join our Telegram channel">
                      <i className="fab fa-telegram-plane"></i>
                    </a>
                  </div>
                  <div className="social-stats">
                    <small className="text-muted">
                      <i className="fas fa-users me-1"></i>50K+ followers across platforms
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="copyright">
                <p className="mb-0">© {currentYear} ግዕዝHealthCare AI. All rights reserved.</p>
                <p className="mb-0 small">ግዕዝ Software Solution company:<br />Developed by Gebrye Amare</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <a href="#privacy" onClick={(e) => { e.preventDefault(); handleLegalClick('privacy'); }}>Privacy Policy</a>
                <a href="#terms" onClick={(e) => { e.preventDefault(); handleLegalClick('terms'); }}>Terms of Service</a>
                <a href="#cookies" onClick={(e) => { e.preventDefault(); handleLegalClick('cookies'); }}>Cookie Policy</a>
                <a href="#accessibility" onClick={(e) => { e.preventDefault(); handleLegalClick('accessibility'); }}>Accessibility</a>
                <a href="#sitemap" onClick={(e) => { e.preventDefault(); handleLegalClick('sitemap'); }}>Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="footer-decoration">
        <div className="wave-top"></div>
        <div className="particles"></div>
      </div>

      <style jsx>{`
        .professional-footer {
          position: relative;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #ffffff;
          overflow: hidden;
          margin-top: auto;
        }

        .footer-top {
          padding: 80px 0 40px;
          position: relative;
          z-index: 2;
        }

        .footer-brand .brand-logo {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: 700;
          color: #00d4ff;
        }

        .brand-logo i {
          margin-right: 12px;
          font-size: 28px;
          animation: heartbeat 2s infinite;
        }

        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .brand-description {
          color: #b8c5d6;
          line-height: 1.6;
          margin-bottom: 25px;
          font-size: 15px;
        }

        .contact-info {
          margin-top: 20px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          color: #b8c5d6;
          font-size: 14px;
        }

        .contact-item i {
          width: 20px;
          margin-right: 12px;
          color: #00d4ff;
        }

        .footer-section {
          padding-left: 30px;
        }

        .footer-heading {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #0099cc);
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links li a {
          color: #b8c5d6;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s ease;
          position: relative;
          padding-left: 15px;
        }

        .footer-links li a::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #00d4ff;
          transition: transform 0.3s ease;
        }

        .footer-links li a:hover {
          color: #00d4ff;
          padding-left: 20px;
        }

        .footer-links li a:hover::before {
          transform: translateX(5px);
        }

        .newsletter-text {
          color: #b8c5d6;
          font-size: 14px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .newsletter-form .input-group {
          position: relative;
          margin-bottom: 25px;
        }

        .newsletter-form .form-control {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 12px 15px;
          border-radius: 25px 0 0 25px;
          font-size: 14px;
        }

        .newsletter-form .form-control::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .newsletter-form .form-control:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: #00d4ff;
          box-shadow: 0 0 0 0.2rem rgba(0, 212, 255, 0.25);
          outline: none;
        }

        .btn-subscribe {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border: none;
          border-radius: 0 25px 25px 0;
          padding: 0 20px;
          color: white;
          transition: all 0.3s ease;
        }

        .btn-subscribe:hover {
          background: linear-gradient(135deg, #0099cc, #00d4ff);
          transform: translateY(-2px);
        }

        .success-message {
          display: flex;
          align-items: center;
          color: #4caf50;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .success-message i {
          margin-right: 8px;
        }

        .social-heading {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .social-icons {
          display: flex;
          gap: 12px;
        }

        .social-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b8c5d6;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border-color: #00d4ff;
          color: white;
          transform: translateY(-3px) scale(1.1);
        }

        .social-stats {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social-stats small {
          font-size: 12px;
          color: #b8c5d6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-stats i {
          color: #00d4ff;
          margin-right: 5px;
        }

        .footer-bottom {
          background: rgba(0, 0, 0, 0.3);
          padding: 25px 0;
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .copyright p {
          color: #b8c5d6;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .footer-bottom-links {
          display: flex;
          justify-content: flex-end;
          gap: 25px;
          flex-wrap: wrap;
        }

        .footer-bottom-links a {
          color: #b8c5d6;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.3s ease;
        }

        .footer-bottom-links a:hover {
          color: #00d4ff;
        }

        .footer-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .wave-top {
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 100px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.1' d='M0,96L48,112C96,128,192,160L288,160C384,160,480,128L576,122.7C672,117,768,139C864,139,1056,117C1248,75,1344,53L1392,42.7L1440,32L1440,0L1392,0C1344,0,1248,53C1152,75,1056,117C960,139,864,139C768,139,672,117C576,122.7,480,128L384,160L288,160C192,160,96,128L0,96Z'%3E%3C/path%3E%3C/svg%3E") no-repeat;
          background-size: cover;
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 153, 204, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(0, 212, 255, 0.05) 0%, transparent 50%);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .footer-top {
            padding: 60px 0 30px;
          }

          .footer-section {
            padding-left: 0;
            text-align: center;
            margin-bottom: 30px;
          }

          .footer-brand {
            text-align: center;
          }

          .brand-logo {
            justify-content: center;
          }

          .contact-item {
            justify-content: center;
          }

          .footer-bottom-links {
            justify-content: center;
            margin-top: 15px;
          }

          .social-icons {
            justify-content: center;
          }

          .social-stats {
            text-align: center;
          }
        }

        @media (max-width: 576px) {
          .footer-top {
            padding: 40px 0 20px;
          }

          .brand-description {
            font-size: 14px;
          }

          .footer-heading {
            font-size: 15px;
          }

          .footer-bottom .row {
            text-align: center;
          }

          .footer-bottom-links {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
