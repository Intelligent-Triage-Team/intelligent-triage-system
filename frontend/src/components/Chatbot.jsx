import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Health Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0); // For visualizer
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    // Initialize Advanced Voice Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            // Enable continuous mode so it doesn't cut off mid-sentence
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let finalTranscript = '';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                // Update input box with what is being said
                setInputValue(finalTranscript + interimTranscript);
                
                // Simulate audio visualizer intensity based on speech
                setAudioLevel(Math.random() * 50 + 50);

                // Auto-send if there's a long enough pause on final result
                if (event.results[event.results.length - 1].isFinal) {
                    setTimeout(() => {
                        handleSend(finalTranscript);
                        finalTranscript = ''; // reset for next burst
                    }, 1500);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error !== 'no-speech') setIsListening(false);
                setAudioLevel(0);
            };

            recognition.onend = () => {
                // Restart listening automatically if it disconnected but we still want to listen
                if (isListening) {
                    try { recognition.start(); } catch(e) {}
                } else {
                    setAudioLevel(0);
                }
            };

            recognitionRef.current = recognition;
        }

        // Cleanup
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthRef.current) synthRef.current.cancel();
        };
    }, [isListening]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textOverride = null) => {
        const messageText = (textOverride || inputValue).trim();
        if (!messageText) return;

        const userMessage = { text: messageText, sender: 'user' };
        // We capture the history BEFORE adding the new message so the backend understands context
        const currentHistory = [...messages]; 
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Pause listening while AI processes to prevent hearing itself
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
        }

        try {
            const res = await API.post('/chatbot/chat', { 
                message: messageText,
                history: currentHistory.slice(-5) // Send last 5 messages for context
            }, {
                headers: { Authorization: localStorage.getItem('token') }
            });

            const aiMessage = { text: res.data.reply, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);

            if (isSpeaking) {
                speak(res.data.reply);
            } else if (isListening) {
                // Resume listening if we aren't speaking the reply
                setTimeout(() => {
                    try { recognitionRef.current.start(); } catch(e) {}
                }, 500);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' }]);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Advanced Speech recognition is not supported in your browser.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            recognitionRef.current.stop();
            setAudioLevel(0);
        } else {
            setIsListening(true);
            setInputValue('');
            try { recognitionRef.current.start(); } catch(e) {}
        }
    };

    // Advanced Text-to-Speech
    const speak = (text) => {
        if (synthRef.current) {
            synthRef.current.cancel(); // Stop current speech
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Try to find a premium/natural English voice (like Google UK Female or similar)
            const voices = synthRef.current.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;
            
            utterance.rate = 0.95; // Slightly slower for empathy
            utterance.pitch = 1.0;
            
            utterance.onstart = () => {
                setIsSpeaking(true);
                // Fake visualizer interval while speaking
                window.speakInterval = setInterval(() => setAudioLevel(Math.random() * 60 + 40), 100);
            };
            
            utterance.onend = () => {
                clearInterval(window.speakInterval);
                setAudioLevel(0);
                // If user was in continuous listen mode, resume listening after AI finishes speaking
                if (isListening && recognitionRef.current) {
                    try { recognitionRef.current.start(); } catch(e) {}
                }
            };
            
            synthRef.current.speak(utterance);
        }
    };

    const toggleVoiceOutput = () => {
        setIsSpeaking(!isSpeaking);
        if (isSpeaking && synthRef.current) {
            synthRef.current.cancel();
            clearInterval(window.speakInterval);
            setAudioLevel(0);
        }
    };

    if (!localStorage.getItem('token')) return null;

    return (
        <div className="chatbot-container">
            <button 
                className={`chatbot-fab ${isOpen ? 'active' : ''} ${isListening ? 'listening-pulse' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                title="Advanced Health Assistant"
            >
                {isOpen ? '✕' : (isListening ? '🎤' : '💬')}
            </button>

            {isOpen && (
                <div className="chatbot-window animate-slide-up">
                    <div className="chatbot-header">
                        <div className="d-flex align-items-center">
                            <i className="fas fa-robot fs-4 me-2"></i>
                            <div>
                                <h3 className="mb-0">ግዕዝ Health Assistant</h3>
                                <small className="text-white-50">Powered by Advanced NLP</small>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button 
                                className={`voice-toggle ${isSpeaking ? 'active' : ''}`}
                                onClick={toggleVoiceOutput}
                                title={isSpeaking ? "Disable Voice Output" : "Enable Voice Output"}
                            >
                                {isSpeaking ? <i className="fas fa-volume-up"></i> : <i className="fas fa-volume-mute"></i>}
                            </button>
                            <button onClick={() => setIsOpen(false)}><i className="fas fa-times"></i></button>
                        </div>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-bubble ai typing">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Audio Visualizer */}
                    {(isListening || (isSpeaking && audioLevel > 0)) && (
                        <div className="audio-visualizer">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div 
                                    key={i} 
                                    className="wave-bar" 
                                    style={{ height: `${Math.max(10, audioLevel * Math.random())}%` }}
                                ></div>
                            ))}
                            <span className="visualizer-text">
                                {isListening ? "Listening..." : "Speaking..."}
                            </span>
                        </div>
                    )}

                    <div className="chatbot-input">
                        <button 
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={toggleListening}
                            title="Continuous Voice Input"
                        >
                            <i className="fas fa-microphone"></i>
                        </button>
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your symptoms..."
                        />
                        <button className="send-btn" onClick={() => handleSend()}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
