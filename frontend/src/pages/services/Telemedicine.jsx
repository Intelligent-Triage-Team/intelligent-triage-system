import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api";

function Telemedicine() {
  const [selectedService, setSelectedService] = useState("");
  const [appointmentData, setAppointmentData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    reason: "",
    consultationType: "video"
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [activeSession, setActiveSession] = useState(null); // 'video' | 'chat' | null
  const [chatMessages, setChatMessages] = useState([
    { sender: 'system', text: 'Connected to secure chat server.' },
    { sender: 'doctor', text: 'Hello! I am reviewing your case now. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [availableDoctors, setAvailableDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get("/doctors", {
          headers: { Authorization: localStorage.getItem("token") }
        });
        setAvailableDoctors(res.data);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  const telemedicineServices = [
    {
      id: "video-consultation",
      name: "Video Consultation",
      description: "Face-to-face virtual consultation with healthcare providers",
      duration: "30-45 minutes",
      price: "$75",
      icon: "fa-video"
    },
    {
      id: "phone-consultation",
      name: "Phone Consultation",
      description: "Telephone consultation with medical professionals",
      duration: "20-30 minutes",
      price: "$50",
      icon: "fa-phone"
    },
    {
      id: "chat-consultation",
      name: "Chat Consultation",
      description: "Text-based consultation with healthcare providers",
      duration: "15-20 minutes",
      price: "$35",
      icon: "fa-comments"
    },
    {
      id: "second-opinion",
      name: "Second Opinion",
      description: "Get expert second opinion on your medical condition",
      duration: "45-60 minutes",
      price: "$150",
      icon: "fa-user-md"
    },
    {
      id: "follow-up",
      name: "Follow-up Visit",
      description: "Post-treatment follow-up with your healthcare provider",
      duration: "20-30 minutes",
      price: "$40",
      icon: "fa-calendar-check"
    },
    {
      id: "prescription-refill",
      name: "Prescription Refill",
      description: "Quick prescription refill consultation",
      duration: "10-15 minutes",
      price: "$25",
      icon: "fa-prescription"
    }
  ];

  // Doctors are now fetched dynamically via useEffect

  const handleBooking = () => {
    if (!selectedService || !appointmentData.name || !appointmentData.email || !appointmentData.date || !appointmentData.time) {
      alert("Please fill in all required fields");
      return;
    }

    setIsBooking(true);

    setTimeout(() => {
      setBookingSuccess(true);
      setIsBooking(false);
      
      const booking = {
        ...appointmentData,
        service: selectedService,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      const bookings = JSON.parse(localStorage.getItem('telemedicine_bookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('telemedicine_bookings', JSON.stringify(bookings));
    }, 2000);
  };

  const resetForm = () => {
    setAppointmentData({
      name: "", email: "", phone: "", date: "", time: "", reason: "", consultationType: "video"
    });
    setSelectedService("");
    setBookingSuccess(false);
    setActiveSession(null);
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, { sender: 'patient', text: chatInput }]);
    setChatInput("");

    // Simulate doctor reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'doctor', text: 'I see. Can you provide more details about when this started?' }]);
    }, 1500);
  };

  // --- SUB-VIEWS ---

  if (activeSession === 'video') {
    return (
      <div className="tele-session-container video-session">
        <div className="video-main-feed">
          <div className="doctor-feed-placeholder">
            <i className="fas fa-user-md fa-5x text-white opacity-50 mb-3"></i>
            <h3 className="text-white">{availableDoctors.length > 0 ? availableDoctors[0].name : "Assigned Doctor"}</h3>
            <p className="text-white-50">{availableDoctors.length > 0 ? availableDoctors[0].specialty : "Medical Professional"}</p>
            <div className="live-badge">LIVE</div>
          </div>
          <div className="patient-pip">
            <i className="fas fa-user text-white"></i>
          </div>
        </div>
        <div className="video-controls">
          <button className="control-btn"><i className="fas fa-microphone"></i></button>
          <button className="control-btn"><i className="fas fa-video"></i></button>
          <button className="control-btn end-call" onClick={() => setActiveSession(null)}>
            <i className="fas fa-phone-slash"></i> End Call
          </button>
          <button className="control-btn"><i className="fas fa-desktop"></i></button>
          <button className="control-btn"><i className="fas fa-cog"></i></button>
        </div>

        <style jsx>{`
          .tele-session-container { height: calc(100vh - 80px); background: #111827; display: flex; flex-direction: column; }
          .video-main-feed { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #1f2937 0%, #111827 100%); }
          .doctor-feed-placeholder { text-align: center; }
          .live-badge { position: absolute; top: 20px; left: 20px; background: #ef4444; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; animation: pulse 2s infinite; }
          @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
          .patient-pip { position: absolute; bottom: 20px; right: 20px; width: 200px; height: 150px; background: #374151; border-radius: 12px; border: 2px solid #4b5563; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .video-controls { height: 90px; background: #1f2937; display: flex; justify-content: center; align-items: center; gap: 1.5rem; }
          .control-btn { width: 50px; height: 50px; border-radius: 50%; border: none; background: #374151; color: white; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
          .control-btn:hover { background: #4b5563; }
          .control-btn.end-call { background: #ef4444; width: auto; padding: 0 1.5rem; border-radius: 25px; font-weight: bold; gap: 0.5rem; }
          .control-btn.end-call:hover { background: #dc2626; }
        `}</style>
      </div>
    );
  }

  if (activeSession === 'chat') {
    return (
      <div className="tele-session-container chat-session container py-4">
        <div className="chat-card shadow">
          <div className="chat-header">
            <div className="d-flex align-items-center">
              <div className="doctor-avatar"><i className="fas fa-user-md"></i></div>
              <div className="ms-3">
                <h5 className="mb-0">{availableDoctors.length > 0 ? availableDoctors[0].name : "Assigned Doctor"}</h5>
                <small className="text-success"><i className="fas fa-circle me-1" style={{fontSize: '8px'}}></i>Online</small>
              </div>
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={() => setActiveSession(null)}>End Chat</button>
          </div>
          <div className="chat-body">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form className="chat-footer" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type your message..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
            />
            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i></button>
          </form>
        </div>

        <style jsx>{`
          .chat-session { height: calc(100vh - 100px); display: flex; justify-content: center; }
          .chat-card { width: 100%; max-width: 800px; background: white; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; }
          .chat-header { padding: 1.25rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .doctor-avatar { width: 45px; height: 45px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
          .chat-body { flex: 1; padding: 1.5rem; overflow-y: auto; background: #f1f5f9; display: flex; flex-direction: column; gap: 1rem; }
          .message-bubble { max-width: 75%; padding: 0.75rem 1.25rem; border-radius: 16px; font-size: 0.95rem; }
          .message-bubble.system { align-self: center; background: #e2e8f0; color: #475569; font-size: 0.8rem; border-radius: 20px; }
          .message-bubble.doctor { align-self: flex-start; background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .message-bubble.patient { align-self: flex-end; background: #3b82f6; color: white; border-bottom-right-radius: 4px; box-shadow: 0 2px 4px rgba(59,130,246,0.2); }
          .chat-footer { padding: 1rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 0.5rem; }
        `}</style>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-12">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle p-4 mb-3">
              <i className="fas fa-laptop-medical fa-3x text-info"></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Telemedicine Services</h1>
            <p className="lead text-muted">
              Connect with healthcare providers from the comfort of your home
            </p>
          </div>

          {/* Services Grid */}
          <div className="row mb-5">
            {telemedicineServices.map((service, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <div className={`card h-100 ${selectedService === service.id ? 'border-primary' : ''}`}>
                  <div className="card-body text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle p-3 mb-3">
                      <i className={`fas ${service.icon} fa-2x text-info`}></i>
                    </div>
                    <h5 className="card-title">{service.name}</h5>
                    <p className="card-text text-muted">{service.description}</p>
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>{service.duration}
                      </small>
                    </div>
                    <div className="mb-3">
                      <span className="badge bg-info fs-6">{service.price}</span>
                    </div>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setSelectedService(service.id)}
                    >
                      Select Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Form */}
          {selectedService && !bookingSuccess && (
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">
                  <i className="fas fa-calendar-plus me-2"></i>Book Your Appointment
                </h5>

                {/* Selected Service Info */}
                <div className="alert alert-info mb-4">
                  <strong>Selected Service:</strong> {telemedicineServices.find(s => s.id === selectedService)?.name}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={appointmentData.name}
                      onChange={(e) => setAppointmentData({...appointmentData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={appointmentData.email}
                      onChange={(e) => setAppointmentData({...appointmentData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your phone number"
                      value={appointmentData.phone}
                      onChange={(e) => setAppointmentData({...appointmentData, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Consultation Type</label>
                    <select
                      className="form-select"
                      value={appointmentData.consultationType}
                      onChange={(e) => setAppointmentData({...appointmentData, consultationType: e.target.value})}
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="chat">Text Chat</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Preferred Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      min={getMinDate()}
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Preferred Time *</label>
                    <select
                      className="form-select"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                    >
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Reason for Visit *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Briefly describe why you need this consultation..."
                    value={appointmentData.reason}
                    onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                  ></textarea>
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Booking Appointment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Book Appointment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message & Launch Buttons */}
          {bookingSuccess && (
            <div className="card shadow-sm border-0 bg-light">
              <div className="card-body p-5 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle p-4 mb-4" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-check fa-2x"></i>
                </div>
                <h3 className="card-title fw-bold mb-3">Appointment Scheduled!</h3>
                <p className="text-muted mb-4 fs-5">
                  Your {appointmentData.consultationType} consultation is ready. You can join the virtual room now or wait until your scheduled time.
                </p>
                
                <div className="d-flex justify-content-center gap-3 mb-4">
                  {appointmentData.consultationType === 'video' && (
                    <button className="btn btn-success btn-lg px-4" onClick={() => setActiveSession('video')}>
                      <i className="fas fa-video me-2"></i> Join Video Room Now
                    </button>
                  )}
                  {appointmentData.consultationType === 'chat' && (
                    <button className="btn btn-success btn-lg px-4" onClick={() => setActiveSession('chat')}>
                      <i className="fas fa-comments me-2"></i> Start Live Chat Now
                    </button>
                  )}
                  {appointmentData.consultationType === 'phone' && (
                    <div className="alert alert-success d-inline-block m-0">
                      <i className="fas fa-phone-alt me-2"></i> The doctor will call you at {appointmentData.phone}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-outline-secondary" onClick={resetForm}>
                    Book Another Service
                  </button>
                  <Link to="/history" className="btn btn-outline-primary">
                    View My History
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Available Doctors */}
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-user-md me-2"></i>Available Healthcare Providers
              </h5>
              <div className="row">
                {availableDoctors.map((doctor, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 border rounded bg-white">
                      <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3" style={{width: "50px", height: "50px"}}>
                        <i className="fas fa-user-md"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{doctor.name}</h6>
                        <small className="text-muted">{doctor.specialty}</small>
                        <div className="mt-1">
                          <span className="text-warning">
                            {"★".repeat(Math.floor(doctor.rating))}
                          </span>
                          <small className="text-muted"> ({doctor.rating})</small>
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${doctor.available ? 'bg-success' : 'bg-secondary'}`}>
                          {doctor.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="card shadow-sm mt-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-info-circle me-2"></i>How Telemedicine Works
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-2">
                      <i className="fas fa-calendar-plus fa-2x text-primary"></i>
                    </div>
                    <h6>1. Book Appointment</h6>
                    <p className="text-muted small">Choose your service and schedule a convenient time</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-2">
                      <i className="fas fa-video fa-2x text-primary"></i>
                    </div>
                    <h6>2. Connect Virtually</h6>
                    <p className="text-muted small">Join the video call or phone consultation at your scheduled time</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 mb-2">
                      <i className="fas fa-prescription fa-2x text-primary"></i>
                    </div>
                    <h6>3. Get Treatment</h6>
                    <p className="text-muted small">Receive diagnosis, treatment plan, and prescription if needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="alert alert-info mt-4">
            <h6 className="alert-heading">
              <i className="fas fa-laptop me-2"></i>Technical Requirements
            </h6>
            <p className="mb-2">For video consultations, you'll need:</p>
            <ul className="mb-0">
              <li>Stable internet connection</li>
              <li>Device with camera and microphone (smartphone, tablet, or computer)</li>
              <li>Updated web browser or our mobile app</li>
              <li>Quiet, well-lit space for consultation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Telemedicine;
