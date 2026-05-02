import { useState } from "react";
import { Link } from "react-router-dom";

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

  const availableDoctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Practice", rating: 4.8, available: true },
    { id: 2, name: "Dr. Michael Chen", specialty: "Internal Medicine", rating: 4.9, available: true },
    { id: 3, name: "Dr. Emily Rodriguez", specialty: "Family Medicine", rating: 4.7, available: false },
    { id: 4, name: "Dr. James Wilson", specialty: "Pediatrics", rating: 4.9, available: true },
    { id: 5, name: "Dr. Lisa Anderson", specialty: "Women's Health", rating: 4.8, available: true }
  ];

  const handleBooking = () => {
    if (!selectedService || !appointmentData.name || !appointmentData.email || !appointmentData.date || !appointmentData.time) {
      alert("Please fill in all required fields");
      return;
    }

    setIsBooking(true);

    setTimeout(() => {
      setBookingSuccess(true);
      setIsBooking(false);
      
      // Store booking in localStorage
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
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      reason: "",
      consultationType: "video"
    });
    setSelectedService("");
    setBookingSuccess(false);
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

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

          {/* Success Message */}
          {bookingSuccess && (
            <div className="card shadow-sm">
              <div className="card-body p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-4 mb-3">
                  <i className="fas fa-check fa-3x text-success"></i>
                </div>
                <h5 className="card-title mb-3">Appointment Booked Successfully!</h5>
                <p className="text-muted mb-4">
                  Your telemedicine appointment has been scheduled. You will receive a confirmation email shortly.
                </p>
                <div className="alert alert-info">
                  <strong>Appointment Details:</strong><br />
                  Service: {telemedicineServices.find(s => s.id === selectedService)?.name}<br />
                  Date: {appointmentData.date}<br />
                  Time: {appointmentData.time}<br />
                  Type: {appointmentData.consultationType.charAt(0).toUpperCase() + appointmentData.consultationType.slice(1)} consultation
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button className="btn btn-primary" onClick={resetForm}>
                    <i className="fas fa-plus me-2"></i>Book Another Appointment
                  </button>
                  <Link to="/contact" className="btn btn-outline-primary">
                    <i className="fas fa-phone me-2"></i>Contact Support
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Available Doctors */}
          <div className="card shadow-sm mt-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                <i className="fas fa-user-md me-2"></i>Available Healthcare Providers
              </h5>
              <div className="row">
                {availableDoctors.map((doctor, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex align-items-center p-3 border rounded">
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
