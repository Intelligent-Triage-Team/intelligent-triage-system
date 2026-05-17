// Services.jsx

import "./Services.css";

import {
  FaBrain,
  FaAmbulance,
  FaCalendarCheck,
  FaFileMedical,
  FaBell,
  FaUserShield,
  FaCheckCircle,
} from "react-icons/fa";

function Services() {
  const services = [
    {
      title: "AI Disease Prediction",
      icon: <FaBrain />,
      description:
        "Our intelligent machine learning system analyzes patient symptoms and predicts possible diseases with high confidence to support faster medical decisions.",
    },

    {
      title: "Emergency Triage",
      icon: <FaAmbulance />,
      description:
        "Automatically classifies patients into emergency, urgent, and normal levels to help hospitals prioritize treatment efficiently.",
    },

    {
      title: "Doctor Scheduling",
      icon: <FaCalendarCheck />,
      description:
        "Smart appointment scheduling system that connects patients with available doctors based on severity and availability.",
    },

    {
      title: "Patient History",
      icon: <FaFileMedical />,
      description:
        "Securely stores patient records, prediction results, and appointment history for better healthcare management.",
    },

    {
      title: "Real-Time Notifications",
      icon: <FaBell />,
      description:
        "Instant notifications for doctors and patients regarding appointments, updates, and emergency cases.",
    },

    {
      title: "Admin Dashboard",
      icon: <FaUserShield />,
      description:
        "Advanced administration panel for managing doctors, patients, reports, and healthcare system operations.",
    },
  ];

  return (
    <div className="services-page">

      {/* HERO SECTION */}
      <section className="services-hero">

        <h1>Our Healthcare Services</h1>

        <p>
          Intelligent Triage System provides modern AI-powered healthcare
          solutions designed to improve patient care, reduce waiting time,
          and support doctors with smart medical decision tools.
        </p>

      </section>

      {/* SERVICES SECTION */}
      <section className="services-container">

        <div className="services-grid">

          {services.map((service, index) => (
            <div className="service-card" key={index}>

              <div className="service-icon">
                {service.icon}
              </div>

              <h2>{service.title}</h2>

              <p>{service.description}</p>

            </div>
          ))}

        </div>

      </section>

      {/* WHY CHOOSE US */}
      <section className="why-section">

        <div className="why-content">

          <div className="why-text">

            <h2>Why Choose Our System?</h2>

            <p>
              Our platform combines healthcare expertise with artificial
              intelligence to provide a secure, fast, and reliable triage
              experience for both hospitals and patients.
            </p>

            <div className="why-list">

              <div className="why-item">
                <FaCheckCircle className="check-icon" />
                <span>Fast patient prioritization and emergency handling</span>
              </div>

              <div className="why-item">
                <FaCheckCircle className="check-icon" />
                <span>AI-powered disease prediction system</span>
              </div>

              <div className="why-item">
                <FaCheckCircle className="check-icon" />
                <span>Modern dashboards for doctors and administrators</span>
              </div>

              <div className="why-item">
                <FaCheckCircle className="check-icon" />
                <span>Secure patient records and appointment management</span>
              </div>

            </div>

          </div>

          <div className="why-image">

            <img
    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1600&auto=format&fit=crop"
  alt="Doctor Healthcare System"



            />

          </div>

        </div>

      </section>

      {/* CTA SECTION */}
      <section className="cta-section">

        <h2>Transforming Healthcare With AI</h2>

        <p>
          Join our intelligent healthcare platform and experience faster,
          smarter, and more efficient patient triage and hospital management.
        </p>

        <button>Get Started</button>

      </section>

    </div>
  );
}

export default Services;