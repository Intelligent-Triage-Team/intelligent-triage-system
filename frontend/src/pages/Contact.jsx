import React, { useState, useEffect } from 'react';
import "../contact.css";

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    useEffect(() => {
        // Load Google Maps script
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap';
        script.async = true;
        script.defer = true;

        // Define initMap function globally
        window.initMap = () => {
            setMapLoaded(true);

            // Haramaya Hiwote Fana Hospital coordinates (approximate)
            const hospitalLocation = { lat: 9.4103, lng: 42.0488 };

            const map = new window.google.maps.Map(document.getElementById('map'), {
                center: hospitalLocation,
                zoom: 15,
                styles: [
                    {
                        featureType: "all",
                        elementType: "geometry",
                        stylers: [{ color: "#f5f5f5" }]
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#c9eaf7" }]
                    },
                    {
                        featureType: "poi",
                        elementType: "geometry",
                        stylers: [{ color: "#e5e5e5" }]
                    }
                ]
            });

            // Add marker for hospital
            const marker = new window.google.maps.Marker({
                position: hospitalLocation,
                map: map,
                title: "Haramaya Hiwote Fana Hospital",
                icon: {
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="2"/>
                            <text x="20" y="25" text-anchor="middle" fill="white" font-size="20" font-weight="bold">H</text>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(40, 40)
                }
            });

            // Info window
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; max-width: 200px;">
                        <h3 style="margin: 0 0 10px 0; color: #2563eb;">Haramaya Hiwote Fana Hospital</h3>
                        <p style="margin: 5px 0; font-size: 14px;">
                            <strong>Address:</strong> Haramaya, Ethiopia<br>
                            <strong>Services:</strong> Emergency, General Medicine<br>
                            <strong>Hours:</strong> 24/7 Emergency
                        </p>
                        <a href="https://maps.google.com/?q=Haramaya+Hiwote+Fana+Hospital"
                           target="_blank"
                           style="color: #2563eb; text-decoration: none; font-weight: bold;">
                            Get Directions
                        </a>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        };

        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Simulate API call
        setTimeout(() => {
            setSubmitStatus('success');
            setIsSubmitting(false);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSubmitStatus(null), 5000);
        }, 2000);
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="container">
                        <div className="hero-text">
                            <h1 className="hero-title">Get In Touch</h1>
                            <p className="hero-subtitle">
                                We're here to help you with all your healthcare needs. Reach out to us anytime.
                            </p>
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Emergency Care</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">15min</div>
                                    <div className="stat-label">Response Time</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">100%</div>
                                    <div className="stat-label">Patient Care</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Contact Cards */}
            <section className="quick-contact">
                <div className="container">
                    <div className="contact-cards">
                        <div className="contact-card emergency">
                            <div className="card-icon">
                                <i className="fas fa-ambulance"></i>
                            </div>
                            <div className="card-content">
                                <h3>Emergency</h3>
                                <p>Call us immediately for urgent medical care</p>
                                <a href="tel:+251911223344" className="card-link">
                                    +251 111111111
                                </a>
                            </div>
                        </div>

                        <div className="contact-card appointment">
                            <div className="card-icon">
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <div className="card-content">
                                <h3>Appointments</h3>
                                <p>Schedule your visit with our specialists</p>
                                <a href="tel:+251123456789" className="card-link">
                                    +251 111111111
                                </a>
                            </div>
                        </div>

                        <div className="contact-card location">
                            <div className="card-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div className="card-content">
                                <h3>Location</h3>
                                <p>Find us in Haramaya, Ethiopia</p>
                                <a href="https://maps.google.com/?q=Haramaya+Hiwote+Fana+Hospital" target="_blank" rel="noopener noreferrer" className="card-link">
                                    Get Directions
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="contact-main">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Information */}
                        <div className="contact-info-section">
                            <div className="info-card">
                                <div className="card-header">
                                    <h2>Hospital Information</h2>
                                    <p>Everything you need to know about reaching us</p>
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="info-content">
                                            <h4>Address</h4>
                                            <p>Haramaya Hiwote Fana Hospital<br />Haramaya, Ethiopia</p>
                                            <small>15km from Harar city center</small>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="fas fa-phone"></i>
                                        </div>
                                        <div className="info-content">
                                            <h4>Phone Numbers</h4>
                                            <p><strong>Main:</strong> +251 111111111</p>
                                            <p><strong>Emergency:</strong> +251 111111111</p>
                                            <p><strong>WhatsApp:</strong> +251 911111111</p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <div className="info-content">
                                            <h4>Email</h4>
                                            <p><strong>General:</strong> info@hiwotefana.org.et</p>
                                            <p><strong>Emergency:</strong> emergency@hiwotefana.org.et</p>
                                            <p><strong>Appointments:</strong> appointments@hiwotefana.org.et</p>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <div className="info-icon">
                                            <i className="fas fa-clock"></i>
                                        </div>
                                        <div className="info-content">
                                            <h4>Operating Hours</h4>
                                            <div className="hours-list">
                                                <div className="hour-item">
                                                    <span>Emergency</span>
                                                    <span>24/7</span>
                                                </div>
                                                <div className="hour-item">
                                                    <span>Outpatient</span>
                                                    <span>8:00 AM - 6:00 PM</span>
                                                </div>
                                                <div className="hour-item">
                                                    <span>Laboratory</span>
                                                    <span>7:00 AM - 5:00 PM</span>
                                                </div>
                                                <div className="hour-item">
                                                    <span>Pharmacy</span>
                                                    <span>8:00 AM - 8:00 PM</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="services-preview">
                                    <h4>Our Services</h4>
                                    <div className="services-grid">
                                        <div className="service-tag">
                                            <i className="fas fa-ambulance"></i>
                                            Emergency Care
                                        </div>
                                        <div className="service-tag">
                                            <i className="fas fa-user-md"></i>
                                            General Medicine
                                        </div>
                                        <div className="service-tag">
                                            <i className="fas fa-flask"></i>
                                            Laboratory
                                        </div>
                                        <div className="service-tag">
                                            <i className="fas fa-brain"></i>
                                            AI Triage
                                        </div>
                                        <div className="service-tag">
                                            <i className="fas fa-baby"></i>
                                            Maternity Care
                                        </div>
                                        <div className="service-tag">
                                            <i className="fas fa-syringe"></i>
                                            Surgery
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-section">
                            <div className="form-card">
                                <div className="card-header">
                                    <h2>Send Us a Message</h2>
                                    <p>We'll get back to you within 24 hours</p>
                                </div>

                                {submitStatus === 'success' && (
                                    <div className="alert alert-success">
                                        <i className="fas fa-check-circle"></i>
                                        Thank you! Your message has been sent successfully.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address *</label>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                placeholder="Enter your phone number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Subject *</label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                required
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="appointment">Book Appointment</option>
                                                <option value="emergency">Emergency</option>
                                                <option value="inquiry">General Inquiry</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Message *</label>
                                        <textarea
                                            rows="6"
                                            placeholder="Tell us how we can help you..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="spinner"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane"></i>
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="container">
                    <div className="map-header">
                        <h2>Find Our Location</h2>
                        <p>Located in Haramaya, serving the community with quality healthcare</p>
                    </div>

                    <div className="map-container">
                        {!mapLoaded ? (
                            <div className="map-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading interactive map...</p>
                            </div>
                        ) : (
                            <div id="map" className="map"></div>
                        )}
                    </div>

                    <div className="map-actions">
                        <a
                            href="https://maps.google.com/?q=Haramaya+Hiwote+Fana+Hospital"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            <i className="fas fa-directions"></i>
                            Get Directions
                        </a>

                        <a
                            href="tel:+251111111111"
                            className="btn btn-outline"
                        >
                            <i className="fas fa-phone"></i>
                            Call for Directions
                        </a>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials">
                <div className="container">
                    <div className="testimonials-header">
                        <h2>What Our Patients Say</h2>
                        <p>Real experiences from our community</p>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                "The emergency response team was incredible. They saved my mother's life with their quick action and professional care."
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar">A</div>
                                <div className="author-info">
                                    <div className="author-name">Ahmed Hassan</div>
                                    <div className="author-title">Emergency Patient Family</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                "The AI triage system helped me get the right care quickly. The doctors were knowledgeable and caring throughout my treatment."
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar">M</div>
                                <div className="author-info">
                                    <div className="author-name">Marta Tadesse</div>
                                    <div className="author-title">Regular Patient</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                "Clean facility, friendly staff, and excellent maternity care. I felt safe and well-cared for during my pregnancy."
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar">S</div>
                                <div className="author-info">
                                    <div className="author-name">Sara Mohammed</div>
                                    <div className="author-title">New Mother</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .contact-page {
                    min-height: 100vh;
                }

                /* Hero Section */
                .contact-hero {
                    position: relative;
                    height: 60vh;
                    min-height: 500px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }

                .contact-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
                    opacity: 0.1;
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    color: white;
                    width: 100%;
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    margin-bottom: 3rem;
                    opacity: 0.9;
                    max-width: 600px;
                }

                .hero-stats {
                    display: flex;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #00d4ff;
                }

                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-top: 0.5rem;
                }

                /* Quick Contact Cards */
                .quick-contact {
                    padding: 4rem 0;
                    background: #f8fafc;
                }

                .contact-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .contact-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .contact-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .card-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .emergency .card-icon {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                }

                .appointment .card-icon {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                }

                .location .card-icon {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .card-content h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .card-content p {
                    margin: 0 0 1rem 0;
                    color: #64748b;
                }

                .card-link {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }

                .card-link:hover {
                    color: #1d4ed8;
                }

                /* Main Content */
                .contact-main {
                    padding: 4rem 0;
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: start;
                }

                .info-card, .form-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }

                .card-header {
                    padding: 2rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .card-header h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .card-header p {
                    margin: 0;
                    color: #64748b;
                }

                .info-grid {
                    padding: 2rem;
                    display: grid;
                    gap: 2rem;
                }

                .info-item {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .info-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .info-content h4 {
                    margin: 0 0 0.5rem 0;
                    font-weight: 600;
                    color: #1e293b;
                }

                .info-content p {
                    margin: 0 0 0.5rem 0;
                    color: #64748b;
                    line-height: 1.5;
                }

                .hours-list {
                    display: grid;
                    gap: 0.5rem;
                }

                .hour-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .hour-item:last-child {
                    border-bottom: none;
                }

                .services-preview {
                    padding: 0 2rem 2rem 2rem;
                }

                .services-preview h4 {
                    margin: 0 0 1rem 0;
                    font-weight: 600;
                    color: #1e293b;
                }

                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 0.75rem;
                }

                .service-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: #f1f5f9;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    color: #475569;
                }

                .service-tag i {
                    color: #667eea;
                }

                /* Contact Form */
                .contact-form {
                    padding: 2rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #374151;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: #fafafa;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .alert {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .alert-success {
                    background: #d1fae5;
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                }

                /* Map Section */
                .map-section {
                    padding: 4rem 0;
                    background: #f8fafc;
                }

                .map-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .map-header h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }

                .map-header p {
                    font-size: 1.1rem;
                    color: #64748b;
                }

                .map-container {
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    margin-bottom: 2rem;
                }

                .map {
                    height: 400px;
                    width: 100%;
                }

                .map-loading {
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                    color: #64748b;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                .map-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .map-actions .btn {
                    padding: 0.75rem 2rem;
                    border-radius: 25px;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }

                .btn-outline {
                    background: transparent;
                    color: #667eea;
                    border: 2px solid #667eea;
                }

                .btn-outline:hover {
                    background: #667eea;
                    color: white;
                }

                /* Testimonials */
                .testimonials {
                    padding: 4rem 0;
                    background: white;
                }

                .testimonials-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .testimonials-header h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1rem;
                }

                .testimonials-header p {
                    font-size: 1.1rem;
                    color: #64748b;
                }

                .testimonials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 2rem;
                }

                .testimonial-card {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 2rem;
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                }

                .testimonial-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }

                .testimonial-content {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #374151;
                    margin-bottom: 1.5rem;
                    font-style: italic;
                }

                .testimonial-content::before {
                    content: '"';
                    font-size: 3rem;
                    color: #667eea;
                    position: relative;
                    top: -10px;
                    margin-right: 5px;
                }

                .testimonial-author {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .author-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 1.25rem;
                }

                .author-info .author-name {
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                }

                .author-info .author-title {
                    font-size: 0.875rem;
                    color: #64748b;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }

                    .hero-stats {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .contact-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .contact-cards {
                        grid-template-columns: 1fr;
                    }

                    .testimonials-grid {
                        grid-template-columns: 1fr;
                    }

                    .map-actions {
                        flex-direction: column;
                        align-items: center;
                    }

                    .services-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 480px) {
                    .contact-hero {
                        height: 50vh;
                        min-height: 400px;
                    }

                    .hero-title {
                        font-size: 2rem;
                    }

                    .contact-card {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .info-item {
                        flex-direction: column;
                        text-align: center;
                        gap: 0.75rem;
                    }

                    .testimonial-author {
                        flex-direction: column;
                        text-align: center;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;
