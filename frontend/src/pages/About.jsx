import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-container">

      <div className="about-hero">
        <h1>About Patient Triage System</h1>
        <p>
          A smart, AI-assisted healthcare platform designed to help patients
          get faster preliminary medical assessment and improve doctor workflow.
        </p>
      </div>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          Our mission is to improve early disease detection and reduce waiting
          time in healthcare systems by providing an intelligent triage system
          that supports both patients and medical professionals.
        </p>
      </div>

      <div className="about-section">
        <h2>What We Do</h2>
        <ul>
          <li>Collect patient symptoms securely</li>
          <li>Provide AI-based preliminary prediction</li>
          <li>Help doctors prioritize urgent cases</li>
          <li>Store patient history for better diagnosis</li>
        </ul>
      </div>

      <div className="about-section">
        <h2>Why Choose Us?</h2>
        <p>
          We combine modern web technology with healthcare intelligence to
          ensure faster, more reliable, and accessible triage support for
          everyone.
        </p>
      </div>

      <div className="about-footer">
        <p>© {new Date().getFullYear()} Patient Triage System. All rights reserved.</p>
      </div>

    </div>
  );
}

export default About;