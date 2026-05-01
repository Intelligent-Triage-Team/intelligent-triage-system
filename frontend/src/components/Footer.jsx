import React from "react";
import { Link } from "react-router-dom";

import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* ================= LEFT SECTION ================= */}
        <div className="footer-section">

          <h2 className="footer-logo">
            Patient Triage System
          </h2>

          <p className="footer-description">
            Smart healthcare support platform designed to improve
            patient triage, disease prediction, and medical workflow
            using modern technology and machine learning solutions.
          </p>

        </div>

        {/* ================= QUICK LINKS ================= */}
        <div className="footer-section">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login">Login</Link>

        </div>

        {/* ================= CONTACT INFO ================= */}
        <div className="footer-section">

          <h3>Contact Info</h3>

          {/* EMAIL */}
          <a
            href="mailto:yosephagimassie25@gmail.com"
            className="contact-item"
          >
            <FaEnvelope className="email-icon" />
            yosephagimassie25@gmail.com
          </a>

          {/* PHONE */}
          <a
            href="tel:+251912483272"
            className="contact-item"
          >
            <FaPhoneAlt className="phone-icon" />
            +251 912 483 272
          </a>

          {/* LOCATION */}
          <a
            href="https://www.google.com/maps?q=Harar,Ethiopia"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-item"
          >
            <FaMapMarkerAlt className="location-icon" />
            Harar, Ethiopia
          </a>

        </div>

        {/* ================= SOCIAL MEDIA ================= */}
        <div className="footer-section">

          <h3>Follow Us</h3>

          <div className="social-icons">

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedinIn />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
            </a>

          </div>

        </div>

      </div>

      {/* ================= FOOTER BOTTOM ================= */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Patient Triage System.
        All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;