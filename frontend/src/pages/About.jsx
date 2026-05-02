import React from 'react';

const About = () => {
    return (
        <div className="animate-fade-in">
            <div className="container">
                <div className="text-center mb-4">
                    <h1>About Haramaya Hiwote Fana Hospital</h1>
                    <p className="text-muted">Leading healthcare innovation in Eastern Ethiopia with AI-powered medical triage</p>
                </div>

                <div className="row">
                    <div className="col-md-8">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h2>Our Story</h2>
                            </div>
                            <div className="card-body">
                                <p>
                                    Established in 1998, Haramaya Hiwote Fana Hospital stands as a beacon of 
                                    medical excellence in Eastern Ethiopia. Located in the vibrant city of Haramaya, 
                                    our 350-bed tertiary hospital serves as the primary referral center for over 2.5 million people 
                                    across the Harari and Dire Dawa regions.
                                </p>
                                <p>
                                    As a teaching hospital affiliated with Haramaya University College of Health Sciences, 
                                    we train the next generation of healthcare professionals while delivering 
                                    compassionate care to our communities. Our commitment to excellence has earned us 
                                    recognition as one of Ethiopia's leading medical institutions.
                                </p>
                                <p>
                                    In 2023, we proudly launched Ethiopia's first AI-powered intelligent triage system, 
                                    reducing average patient wait times from 4 hours to just 15 minutes. This groundbreaking 
                                    technology has transformed emergency care delivery across our region.
                                </p>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-header">
                                <h3>Our Mission</h3>
                            </div>
                            <div className="card-body">
                                <p>
                                    To provide accessible, high-quality healthcare to all communities in Eastern Ethiopia 
                                    through innovative technology, compassionate care, and continuous medical education.
                                </p>
                                <div className="row mt-3">
                                    <div className="col-md-10">
                                        <div className="text-center">
                                            <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>24/7</div>
                                            <h5>Emergency Care</h5>
                                        </div>
                                        
                                    </div>
                                    <div className="col-md-10">
                                        <div className="text-center">
                                            <div style={{ fontSize: '2rem', color: 'var(--urgent)' }}>15min</div>
                                            <h5>Average Wait Time</h5>
                                        </div>
                                        
                                    </div>
                                    <div className="col-md-10">
                                        <div className="text-center">
                                            <div style={{ fontSize: '2rem', color: 'var(--normal)' }}>98%</div>
                                            <h5>Patient Satisfaction</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3>Quick Status</h3>
                            </div>
                            <div className="card-body p-0">
                                <div className="d-flex flex-column h-100">
                                    <div className="stat-item flex-fill p-3 border-bottom">
                                        <h4 className="mb-1">350 Beds</h4>
                                        <p className="text-muted mb-0">Total Hospital Capacity</p>
                                    </div>
                                    <div className="stat-item flex-fill p-3 border-bottom">
                                        <h4 className="mb-1">2.5M+</h4>
                                        <p className="text-muted mb-0">Population Served</p>
                                    </div>
                                    <div className="stat-item flex-fill p-3 border-bottom">
                                        <h4 className="mb-1">450+</h4>
                                        <p className="text-muted mb-0">Medical Professionals</p>
                                    </div>
                                    <div className="stat-item flex-fill p-3 border-bottom">
                                        <h4 className="mb-1">15+</h4>
                                        <p className="text-muted mb-0">Specialized Departments</p>
                                    </div>
                                    <div className="stat-item flex-fill p-3">
                                        <h4 className="mb-1">4.6★</h4>
                                        <p className="text-muted mb-0">Patient Satisfaction</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3>AI Triage System</h3>
                            </div>
                            <div className="card-body">
                                <p>
                                    Our revolutionary AI-powered triage system analyzes patient symptoms 
                                    and medical data to provide instant priority assessment, serving over 
                                    150,000 patients annually with 95% accuracy rate.
                                </p>
                                <div className="feature-list">
                                    <div className="feature-item">
                                        <span className="feature-icon">🤖</span>
                                        <div>
                                            <strong>AI Analysis</strong>
                                            <p className="text-muted small">Machine learning algorithms with 95% accuracy</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">⚡</span>
                                        <div>
                                            <strong>Instant Results</strong>
                                            <p className="text-muted small">Triage assessment in under 30 seconds</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">📊</span>
                                        <div>
                                            <strong>Smart Scheduling</strong>
                                            <p className="text-muted small">Automatic appointment booking with SMS reminders</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">🏥</span>
                                        <div>
                                            <strong>Emergency Response</strong>
                                            <p className="text-muted small">Critical cases flagged for immediate attention</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">📱</span>
                                        <div>
                                            <strong>Mobile Access</strong>
                                            <p className="text-muted small">Available on smartphones and tablets</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3>Achievements & Recognition</h3>
                            </div>
                            <div className="card-body">
                                <div className="achievement-item mb-3">
                                    <h4>🏆 Best Regional Hospital 2022</h4>
                                    <p className="text-muted">Awarded by Ethiopian Ministry of Health</p>
                                </div>
                                <div className="achievement-item mb-3">
                                    <h4>🎓 WHO Recognition</h4>
                                    <p className="text-muted">Excellence in healthcare delivery standards</p>
                                </div>
                                <div className="achievement-item mb-3">
                                    <h4>📚 Medical Training Excellence</h4>
                                    <p className="text-muted">Leading institution for medical education</p>
                                </div>
                                <div className="achievement-item mb-3">
                                    <h4>🌟 Digital Health Pioneer</h4>
                                    <p className="text-muted">First AI triage system in Ethiopia</p>
                                </div>
                                <div className="achievement-item">
                                    <h4>💉 Patient Safety Certified</h4>
                                    <p className="text-muted">International healthcare safety standards</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default About;
