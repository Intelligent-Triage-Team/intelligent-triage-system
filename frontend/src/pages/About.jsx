import React from 'react';

const About = () => {
  return (
    <div className="animate-fade-in">

      <div className="container">

        {/* HERO */}
        <div className="text-center mb-4">
          <h1>About Haramaya Hiwote Fana Hospital</h1>

          <p className="text-muted">
            Leading healthcare innovation in Eastern Ethiopia with AI-powered medical triage
          </p>
        </div>

        {/* OUR STORY */}
        <div className="card mb-4">

          <div className="card-header">
            <h2>Our Story</h2>
          </div>

          <div className="card-body">

            <p>
              Established in 1998, Haramaya Hiwote Fana Hospital stands as a beacon of
              medical excellence in Eastern Ethiopia. Located in the vibrant city of Haramaya,
              our 350-bed tertiary hospital serves as the primary referral center for over
              2.5 million people across the Harari and Dire Dawa regions.
            </p>

            <p>
              As a teaching hospital affiliated with Haramaya University College of Health Sciences,
              we train the next generation of healthcare professionals while delivering
              compassionate care to our communities.
            </p>

            <p>
              In 2023, we proudly launched Ethiopia's first AI-powered intelligent triage system,
              reducing average patient wait times from 4 hours to just 15 minutes.
            </p>

          </div>
        </div>

        {/* OUR MISSION */}
        <div className="card mb-4">

          <div className="card-header">
            <h3>Our Mission</h3>
          </div>

          <div className="card-body">

            <p>
              To provide accessible, high-quality healthcare to all communities in Eastern Ethiopia
              through innovative technology, compassionate care, and continuous medical education.
            </p>

            <div className="mission-stats">

              <div className="mission-box">
                <h4>24/7</h4>
                <h5>Emergency Care</h5>
              </div>

              <div className="mission-box">
                <h4>15min</h4>
                <h5>Average Wait Time</h5>
              </div>

              <div className="mission-box">
                <h4>98%</h4>
                <h5>Patient Satisfaction</h5>
              </div>

            </div>

          </div>
        </div>

        {/* QUICK STATUS + AI TRIAGE */}
        <div className="about-double-section">

          {/* QUICK STATUS */}
          <div className="card">

            <div className="card-header">
              <h3>Quick Status</h3>
            </div>

            <div className="card-body">

              <div className="stat-item">
                <h4>350 Beds</h4>
                <p>Total Hospital Capacity</p>
              </div>

              <div className="stat-item">
                <h4>2.5M+</h4>
                <p>Population Served</p>
              </div>

              <div className="stat-item">
                <h4>450+</h4>
                <p>Medical Professionals</p>
              </div>

              <div className="stat-item">
                <h4>15+</h4>
                <p>Specialized Departments</p>
              </div>

              <div className="stat-item">
                <h4>4.6★</h4>
                <p>Patient Satisfaction</p>
              </div>

            </div>
          </div>

          {/* AI TRIAGE */}
          <div className="card">

            <div className="card-header">
              <h3>AI Triage System</h3>
            </div>

            <div className="card-body">

              <p>
                Our revolutionary AI-powered triage system analyzes patient symptoms
                and medical data to provide instant priority assessment.
              </p>

              <div className="feature-item">
                <span className="feature-icon">🤖</span>

                <div>
                  <strong>AI Analysis</strong>
                  <p>Machine learning algorithms with 95% accuracy</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">⚡</span>

                <div>
                  <strong>Instant Results</strong>
                  <p>Triage assessment in under 30 seconds</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">📊</span>

                <div>
                  <strong>Smart Scheduling</strong>
                  <p>Automatic appointment booking with SMS reminders</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🏥</span>

                <div>
                  <strong>Emergency Response</strong>
                  <p>Critical cases flagged for immediate attention</p>
                </div>
              </div>

              <div className="feature-item">
                <span className="feature-icon">📱</span>

                <div>
                  <strong>Mobile Access</strong>
                  <p>Available on smartphones and tablets</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ACHIEVEMENTS */}
        <div className="card mb-4">

          <div className="card-header">
            <h3>Achievements & Recognition</h3>
          </div>

          <div className="card-body achievements-grid">

            <div className="achievement-item">
              <h4>🏆 Best Regional Hospital 2022</h4>
              <p>Awarded by Ethiopian Ministry of Health</p>
            </div>

            <div className="achievement-item">
              <h4>🎓 WHO Recognition</h4>
              <p>Excellence in healthcare delivery standards</p>
            </div>

            <div className="achievement-item">
              <h4>📚 Medical Training Excellence</h4>
              <p>Leading institution for medical education</p>
            </div>

            <div className="achievement-item">
              <h4>🌟 Digital Health Pioneer</h4>
              <p>First AI triage system in Ethiopia</p>
            </div>

            <div className="achievement-item">
              <h4>💉 Patient Safety Certified</h4>
              <p>International healthcare safety standards</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default About;