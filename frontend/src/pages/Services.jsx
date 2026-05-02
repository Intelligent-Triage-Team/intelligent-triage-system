import React from 'react';
import { Link } from 'react-router-dom';

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
        <div className="container" style={{ padding: '50px 0' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '50px', color: 'var(--primary-color)' }}>Our Digital Services</h1>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '30px' 
            }}>
                {services.map((s, i) => (
                    <Link 
                        key={i} 
                        to={s.route}
                        style={{ 
                            padding: s.featured ? '50px 40px' : '40px', 
                            background: s.featured ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white', 
                            borderRadius: '20px', 
                            boxShadow: s.featured ? '0 20px 40px -10px rgba(102, 126, 234, 0.4)' : '0 10px 25px -5px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            textDecoration: 'none',
                            color: s.featured ? 'white' : 'inherit',
                            position: 'relative',
                            overflow: 'hidden'
                        }} 
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)';
                            e.currentTarget.style.boxShadow = s.featured 
                                ? '0 25px 50px -15px rgba(102, 126, 234, 0.5)' 
                                : '0 15px 35px -10px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = s.featured 
                                ? '0 20px 40px -10px rgba(102, 126, 234, 0.4)' 
                                : '0 10px 25px -5px rgba(0,0,0,0.1)';
                        }}
                    >
                        {s.featured && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255,255,255,0.2)',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                ⭐ FEATURED
                            </div>
                        )}
                        <div style={{ fontSize: s.featured ? '4rem' : '3rem', marginBottom: '20px' }}>{s.icon}</div>
                        <h3 style={{ color: s.featured ? 'white' : 'var(--nav-bg)', marginBottom: '15px' }}>{s.title}</h3>
                        <p style={{ 
                            color: s.featured ? 'rgba(255,255,255,0.9)' : 'var(--gray-600)', 
                            lineHeight: '1.6',
                            marginBottom: '20px'
                        }}>{s.desc}</p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            color: s.featured ? 'white' : 'var(--primary-color)'
                        }}>
                            Get Started
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Services;
