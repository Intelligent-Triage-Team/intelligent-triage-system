import React, { useState } from "react";
import "./Contact.css";
import API from "../api/api";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // API REQUEST
      await API.post("/contact", form);

      setSuccess("Message sent successfully!");

      // RESET FORM
      setForm({
        name: "",
        email: "",
        message: "",
      });

    } catch (error) {
      console.error(error);
      setSuccess("Failed to send message. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">

      {/* HERO SECTION */}
      <div className="contact-hero">
        <h1>Contact Us</h1>

        <p>
          Have questions or need assistance? Contact our support team
          anytime and we will respond as soon as possible.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="contact-content">

        {/* CONTACT FORM */}
        <form className="contact-form" onSubmit={handleSubmit}>

          <h2>Send Message</h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Write your message..."
            rows="6"
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && (
            <p className="status-message">
              {success}
            </p>
          )}
        </form>

        {/* CONTACT INFO */}
        <div className="contact-info">

          <h2>Get In Touch</h2>

          <p>
            <strong>Email:</strong><br />
            yosephagimassie@gmail.com
          </p>

          <p>
            <strong>Phone:</strong><br />
            +251 912 483 272
          </p>

          <p>
            <strong>Location:</strong><br />

            <a
              href="https://www.google.com/maps?q=Harar,Ethiopia"
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              Harar, Ethiopia
            </a>
          </p>

          <div className="note">
            We usually respond within 24 hours.
          </div>

          {/* GOOGLE MAP */}
          <div className="map-container">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps?q=Harar,Ethiopia&output=embed"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;