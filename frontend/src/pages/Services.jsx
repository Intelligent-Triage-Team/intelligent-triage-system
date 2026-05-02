import React from 'react';

const Services = () => {
    const services = [
        {
            title: "AI Symptom Triage",
            icon: "🧠",
            desc: "Advanced machine learning analysis of your symptoms to determine urgency levels."
        },
        {
            title: "Voice Assistant",
            icon: "🎤",
            desc: "Full voice-to-text integration for patients who prefer speaking over typing."
        },
        {
            title: "Smart Scheduling",
            icon: "📅",
            desc: "Automatic appointment booking with the right specialist based on your triage result."
        },
        {
            title: "24/7 Chatbot Support",
            icon: "💬",
            desc: "Instant answers to health queries, psychological support, and system guidance."
        },
        {
            title: "Patient History",
            icon: "📋",
            desc: "Secure storage and easy access to all your previous assessments and medical records."
        },
        {
            title: "Real-time Notifications",
            icon: "🔔",
            desc: "Stay updated on your appointment status and health alerts via email and app."
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
                    <div key={i} style={{ 
                        padding: '40px', 
                        background: 'white', 
                        borderRadius: '20px', 
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s'
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{s.icon}</div>
                        <h3 style={{ color: 'var(--nav-bg)' }}>{s.title}</h3>
                        <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Services;
