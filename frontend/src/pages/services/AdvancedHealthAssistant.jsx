import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function AdvancedHealthAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    age: "",
    gender: "",
    medicalHistory: ""
  });
  const [showUserInfoForm, setShowUserInfoForm] = useState(true);
  const [conversationContext, setConversationContext] = useState({
    lastTopic: "",
    mood: "neutral",
    trustLevel: 0
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Friend-like greeting messages
  const friendGreeting = () => {
    const greetings = [
      "Hey there! I'm your health buddy! 🌟 How are you feeling today?",
      "Hi friend! I'm here to help you with any health concerns. What's on your mind?",
      "Hello! Your personal health assistant is here! How can I support you today?",
      "Hey! I'm so glad you reached out. I'm here to listen and help with your health journey!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Initialize conversation
  useEffect(() => {
    if (!showUserInfoForm) {
      setMessages([{
        id: 1,
        sender: "assistant",
        text: friendGreeting(),
        timestamp: new Date().toLocaleTimeString(),
        type: "greeting"
      }]);
    }
  }, [showUserInfoForm]);

  // Handle user info submission
  const handleUserInfoSubmit = () => {
    if (!userInfo.name || !userInfo.age || !userInfo.gender) {
      alert("Hey friend! Please fill in your basic info so I can give you the best advice! 💙");
      return;
    }
    setShowUserInfoForm(false);
  };

  // Advanced AI response generation
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const message = userMessage.toLowerCase();
    let response = {
      text: "",
      type: "general",
      suggestions: [],
      followUpQuestions: []
    };

    // Medical symptom analysis
    if (message.includes("headache") || message.includes("pain") || message.includes("hurt")) {
      response = {
        text: `Oh no, ${userInfo.name}! I'm sorry to hear you're not feeling well. Let me help you understand what might be going on. Based on what you've told me, it sounds like you might be experiencing some discomfort. Headaches can be caused by many things - stress, dehydration, lack of sleep, or even eye strain from screens. Have you been getting enough rest lately?`,
        type: "medical",
        suggestions: [
          "💧 Drink plenty of water and stay hydrated",
          "😴 Try to get 7-8 hours of quality sleep",
          "🧘‍♀️ Practice relaxation techniques or gentle stretching",
          "📱 Take regular breaks from screens",
          "💊 Consider over-the-counter pain relievers if appropriate"
        ],
        followUpQuestions: [
          "How long have you been experiencing this?",
          "Is the pain sharp or dull?",
          "Have you noticed any triggers that make it worse?"
        ]
      };
    }
    // Emotional support
    else if (message.includes("sad") || message.includes("depressed") || message.includes("anxious") || message.includes("stress")) {
      response = {
        text: `I hear you, ${userInfo.name}. It takes courage to share these feelings, and I'm really proud of you for reaching out. You're not alone in this - many people go through tough times. I'm here to support you every step of the way. Remember, it's okay to not be okay sometimes. What's been weighing on your mind lately?`,
        type: "emotional",
        suggestions: [
          "🤝 Talk to someone you trust about your feelings",
          "📝 Try journaling to express your thoughts",
          "🌞 Get some fresh air and gentle exercise",
          "🎵 Listen to calming music or nature sounds",
          "🧘‍♀️ Practice deep breathing exercises",
          "⏰ Establish a comforting daily routine"
        ],
        followUpQuestions: [
          "How long have you been feeling this way?",
          "Is there something specific that's been bothering you?",
          "Have you talked to anyone about this before?"
        ]
      };
    }
    // Mental health support
    else if (message.includes("tired") || message.includes("fatigue") || message.includes("exhausted")) {
      response = {
        text: `I totally get it, ${userInfo.name}. Feeling exhausted can really impact everything in your life. Let's work together to figure out what might be causing this fatigue. Sometimes it's physical, sometimes it's mental, and sometimes it's both. Have you been burning the candle at both ends lately?`,
        type: "mental",
        suggestions: [
          "⏰ Prioritize getting 7-9 hours of quality sleep",
          "🥗 Eat nutritious foods and stay hydrated",
          "🏃‍♀️ Get regular physical activity, even just walking",
          "📱 Reduce screen time, especially before bed",
          "☕ Limit caffeine, especially in the afternoon",
          "🧘‍♀️ Try mindfulness or meditation"
        ],
        followUpQuestions: [
          "How has your sleep been lately?",
          "Are you feeling overwhelmed with responsibilities?",
          "Have you had your iron levels checked recently?"
        ]
      };
    }
    // Lifestyle advice
    else if (message.includes("diet") || message.includes("food") || message.includes("eat") || message.includes("weight")) {
      response = {
        text: `That's a great topic, ${userInfo.name}! Taking care of your nutrition is so important for overall health. I'm here to help you make sustainable, healthy choices without being too restrictive. What's your current relationship with food like? Are there specific concerns or goals you'd like to discuss?`,
        type: "lifestyle",
        suggestions: [
          "🥦 Eat a colorful variety of fruits and vegetables",
          "💧 Drink plenty of water throughout the day",
          "🍽️ Practice mindful eating - enjoy your food slowly",
          "🥜 Include healthy proteins and healthy fats",
          "🍎 Choose whole foods over processed options",
          "⏰ Eat regular meals to maintain energy"
        ],
        followUpQuestions: [
          "What does your typical day of eating look like?",
          "Are there any foods you particularly love or dislike?",
          "Do you have any specific health goals in mind?"
        ]
      };
    }
    // Sleep issues
    else if (message.includes("sleep") || message.includes("insomnia") || message.includes("can't sleep")) {
      response = {
        text: `Sleep issues can be so frustrating, ${userInfo.name}. I understand how important good rest is for your wellbeing. Let's work together to improve your sleep quality. Poor sleep can affect everything from your mood to your physical health. What's been keeping you up at night?`,
        type: "sleep",
        suggestions: [
          "🌙 Stick to a consistent sleep schedule",
          "📱 Avoid screens 1 hour before bedtime",
          "☕ Limit caffeine after 2 PM",
          "🧘‍♀️ Try relaxation techniques before bed",
          "🌡️ Keep your bedroom cool and dark",
          "📚 Read a book instead of scrolling"
        ],
        followUpQuestions: [
          "What time do you usually go to bed and wake up?",
          "Do you have trouble falling asleep or staying asleep?",
          "How do you feel when you wake up in the morning?"
        ]
      };
    }
    // Exercise and fitness
    else if (message.includes("exercise") || message.includes("workout") || message.includes("fitness") || message.includes("gym")) {
      response = {
        text: `That's awesome that you're thinking about fitness, ${userInfo.name}! Movement is such a key part of health and happiness. I'm here to help you find activities you actually enjoy - exercise shouldn't feel like punishment! What kind of movement sounds fun to you?`,
        type: "fitness",
        suggestions: [
          "🚶‍♀️ Start with daily walks - aim for 30 minutes",
          "🧘‍♀️ Try yoga or stretching for flexibility",
          "🏃‍♀️ Mix cardio and strength training",
          "🎵 Find workouts you enjoy - dancing, sports, swimming",
          "👯‍♀️ Exercise with friends for motivation",
          "⏰ Schedule workouts like appointments"
        ],
        followUpQuestions: [
          "What activities have you enjoyed in the past?",
          "How much time can you dedicate to exercise?",
          "Do you prefer working out alone or with others?"
        ]
      };
    }
    // General health check
    else if (message.includes("check") || message.includes("health") || message.includes("how am i")) {
      response = {
        text: `I'm so glad you're taking care of yourself, ${userInfo.name}! That's really important. Based on our conversation, I can tell you're being proactive about your health - that's amazing! Remember, health is a journey, not a destination. How are you feeling overall right now, physically and emotionally?`,
        type: "checkup",
        suggestions: [
          "📅 Schedule regular check-ups with your doctor",
          "💉 Stay up to date with vaccinations",
          "🦷 Don't forget dental health!",
          "👁️ Get regular eye exams",
          "🩺 Know your family health history",
          "💊 Review medications with your doctor regularly"
        ],
        followUpQuestions: [
          "When was your last general check-up?",
          "Are there any health concerns running in your family?",
          "How do you feel about your current health habits?"
        ]
      };
    }
    // Stress management
    else if (message.includes("overwhelmed") || message.includes("busy") || message.includes("stressful")) {
      response = {
        text: `I completely understand, ${userInfo.name}. Life can get really overwhelming sometimes, and it's so important to have strategies to cope. You're doing the right thing by reaching out. Let's find some ways to make things feel more manageable. What's been the most stressful part lately?`,
        type: "stress",
        suggestions: [
          "📝 Make a to-do list and prioritize what's most important",
          "🧘‍♀️ Take 5-minute breathing breaks throughout the day",
          "🚶‍♀️ Step outside for fresh air when feeling overwhelmed",
          "📱 Set boundaries with work and social media",
          "👯‍♀️ Don't be afraid to ask for help",
          "🎯 Focus on one thing at a time"
        ],
        followUpQuestions: [
          "What's taking up most of your energy right now?",
          "Do you feel like you have enough time for yourself?",
          "What helps you relax when you're stressed?"
        ]
      };
    }
    // Default friendly response
    else {
      response = {
        text: `I'm here for you, ${userInfo.name}! Thanks for sharing that with me. I'm your health buddy, and I want to help you in any way I can. Could you tell me a bit more about what's on your mind? Whether it's physical health, emotional wellbeing, or just life in general - I'm here to listen and support you!`,
        type: "general",
        suggestions: [
          "💙 Remember to be kind to yourself",
          "🌟 You're doing great by taking care of your health",
          "🤝 I'm here to support you anytime",
          "📱 Don't hesitate to reach out when you need help",
          "🌈 Every small step toward better health counts!"
        ],
        followUpQuestions: [
          "How are you feeling right now?",
          "Is there something specific you'd like to work on?",
          "What would be most helpful for you today?"
        ]
      };
    }

    return response;
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: "user"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Generate AI response
    const aiResponse = await generateAIResponse(inputMessage);
    
    const assistantMessage = {
      id: Date.now() + 1,
      sender: "assistant",
      text: aiResponse.text,
      suggestions: aiResponse.suggestions,
      followUpQuestions: aiResponse.followUpQuestions,
      timestamp: new Date().toLocaleTimeString(),
      type: aiResponse.type
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);

    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      lastTopic: aiResponse.type,
      trustLevel: Math.min(prev.trustLevel + 1, 10)
    }));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  // Handle follow-up question click
  const handleFollowUpClick = (question) => {
    setInputMessage(question);
  };

  // User info form
  if (showUserInfoForm) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-gradient bg-primary bg-opacity-10 rounded-circle p-4 mb-3">
                    <i className="fas fa-heart fa-3x text-primary"></i>
                  </div>
                  <h2 className="fw-bold mb-3">Let's Get Acquainted! 💙</h2>
                  <p className="text-muted">
                    Hey friend! I'm your personal health assistant. To give you the best advice, 
                    I'd love to know a little about you first.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Your Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="What should I call you?"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Age *</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Your age"
                      value={userInfo.age}
                      onChange={(e) => setUserInfo({...userInfo, age: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Gender *</label>
                    <select
                      className="form-select form-select-lg"
                      value={userInfo.gender}
                      onChange={(e) => setUserInfo({...userInfo, gender: e.target.value})}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Medical History (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Any conditions, medications, or allergies I should know about?"
                    value={userInfo.medicalHistory}
                    onChange={(e) => setUserInfo({...userInfo, medicalHistory: e.target.value})}
                  ></textarea>
                </div>

                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleUserInfoSubmit}
                >
                  <i className="fas fa-heart me-2"></i>
                  Let's Start Our Health Journey!
                </button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Your information is kept private and helps me provide better advice 💙
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="container-fluid py-4" style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <div className="row flex-grow-1">
        <div className="col-lg-8 mx-auto d-flex flex-column">
          {/* Header */}
          <div className="card shadow-sm mb-3">
            <div className="card-body py-3">
              <div className="d-flex align-items-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="fas fa-heart fa-lg text-success"></i>
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-0 fw-bold">Your Health Assistant 💙</h5>
                  <small className="text-muted">Always here to support you, {userInfo.name}</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-2">Online</span>
                  <span className="badge bg-primary">Trust Level: {conversationContext.trustLevel}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="card shadow-sm flex-grow-1 d-flex flex-column" style={{minHeight: '400px'}}>
            <div className="card-body flex-grow-1 overflow-auto">
              <div className="chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message mb-3 ${message.sender === 'user' ? 'text-end' : 'text-start'}`}>
                    <div className={`d-inline-block p-3 rounded-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : message.type === 'greeting'
                        ? 'bg-success bg-opacity-10 border border-success'
                        : 'bg-light'
                    }`} style={{maxWidth: '80%'}}>
                      <div className="fw-bold mb-1">
                        {message.sender === 'user' ? 'You' : 'Health Assistant 💙'}
                      </div>
                      <div>{message.text}</div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3">
                          <small className="fw-bold">Here are some suggestions that might help:</small>
                          <div className="mt-2 d-flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up questions */}
                      {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="mt-3">
                          <small className="fw-bold">To help me better, could you tell me:</small>
                          <div className="mt-2 d-flex flex-wrap gap-2">
                            {message.followUpQuestions.map((question, index) => (
                              <button
                                key={index}
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleFollowUpClick(question)}
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="small mt-2 opacity-75">
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="message mb-3 text-start">
                    <div className="d-inline-block p-3 rounded-3 bg-light" style={{maxWidth: '80%'}}>
                      <div className="fw-bold mb-1">Health Assistant 💙</div>
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="card-footer bg-white">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Tell me what's on your mind, friend..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  className="btn btn-primary btn-lg px-4"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              
              {/* Quick actions */}
              <div className="mt-2 d-flex flex-wrap gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setInputMessage("I'm feeling stressed lately")}>
                  😟 Feeling Stressed
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setInputMessage("I have a headache")}>
                  🤕 Physical Pain
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setInputMessage("How can I sleep better?")}>
                  😴 Sleep Issues
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setInputMessage("I want to eat healthier")}>
                  🥗 Healthy Eating
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setInputMessage("I feel sad today")}>
                  😢 Emotional Support
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Resources */}
          <div className="card shadow-sm mt-3">
            <div className="card-body py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted fw-bold">Emergency Resources:</small>
                  <div className="d-flex gap-3 mt-1">
                    <Link to="/emergency" className="btn btn-sm btn-danger">
                      <i className="fas fa-ambulance me-1"></i>Emergency
                    </Link>
                    <button className="btn btn-sm btn-info" onClick={() => window.open('tel:988', '_blank')}>
                      <i className="fas fa-phone me-1"></i>Crisis Helpline
                    </button>
                    <Link to="/contact" className="btn btn-sm btn-primary">
                      <i className="fas fa-user-md me-1"></i>Consult Doctor
                    </Link>
                  </div>
                </div>
                <small className="text-muted">
                  Available 24/7 for emergencies
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6c757d;
          animation: typing 1.4s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        
        .chat-messages {
          min-height: 300px;
        }
        
        .message {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default AdvancedHealthAssistant;
