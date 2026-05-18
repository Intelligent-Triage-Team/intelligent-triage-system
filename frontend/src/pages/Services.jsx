import React from 'react';
import { Link } from 'react-router-dom';
import "./Services.css";

const Services = () => {
    const services = [
        {
            title: "Advanced Health Assistant",
            icon: "💙",
            desc: "Your personal health buddy! Get friendly, conversational support for medical symptoms, emotional well-being, mental health, and lifestyle advice.",
            route: "/services/advanced-health-assistant",
            featured: true
        },
        {
            title: "AI Symptom Triage",
            icon: "🧠",
            desc: "Advanced machine learning analysis of your symptoms to determine urgency levels.",
            route: "/services/ai-diagnosis"
        },
        {
            title: "Voice Assistant",
            icon: "🎤",
            desc: "Full voice-to-text integration for patients who prefer speaking over typing.",
            route: "/services/voice-assistant"
        },
        {
            title: "Smart Scheduling",
            icon: "📅",
            desc: "Automatic appointment booking with the right specialist based on your triage result.",
            route: "/services/scheduling"
        },
        {
            title: "24/7 Chatbot Support",
            icon: "💬",
            desc: "Instant answers to health queries, psychological support, and system guidance.",
            route: "/services/chatbot"
        },
        {
            title: "Patient History",
            icon: "📋",
            desc: "Secure storage and easy access to all your previous assessments and medical records.",
            route: "/services/history"
        },
        {
            title: "Real-time Notifications",
            icon: "🔔",
            desc: "Stay updated on your appointment status and health alerts via email and app.",
            route: "/services/notifications"
        },
        {
            title: "Emergency Triage",
            icon: "🚑",
            desc: "Immediate assessment and routing for urgent medical situations.",
            route: "/services/emergency-triage"
        }
    ];

    return (
    <div className="services-page">

        <div className="container">

            {/* TITLE */}
            <div className="services-header">
                <h1>Our Digital Services</h1>
            </div>

            {/* SERVICES GRID */}
            <div className="services-grid">

                {services.map((s, i) => (

                    <Link
                        key={i}
                        to={s.route}
                        className={s.featured ? "service-card featured-card" : "service-card"}
                    >

                        {s.featured && (
                            <div className="featured-badge">
                                ⭐ FEATURED
                            </div>
                        )}

                        <div className="service-icon">
                            {s.icon}
                        </div>

                        <h3 className="service-title">
                            {s.title}
                        </h3>

                        <p className="service-desc">
                            {s.desc}
                        </p>

                        <div className="service-link">
                            Get Started →
                        </div>

                    </Link>

                ))}

            </div>

        </div>

    </div>
);
};

export default Services;
