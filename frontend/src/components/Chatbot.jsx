import React, { useState, useEffect, useRef } from 'react';
import API from '../api/api';
import './Chatbot.css'; // I will create this next

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Health Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
                handleSend(transcript); // Automatically send after speaking
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []); // Only initialize once

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text) => {
        const messageText = text || inputValue;
        if (!messageText.trim()) return;

        const userMessage = { text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await API.post('/chatbot/chat', { message: messageText }, {
                headers: { Authorization: localStorage.getItem('token') }
            });

            const aiMessage = { text: res.data.reply, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);

            if (isSpeaking) {
                speak(res.data.reply);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' }]);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleSpeaking = () => {
        setIsSpeaking(!isSpeaking);
        if (isSpeaking) {
            window.speechSynthesis.cancel();
        }
    };

    if (!localStorage.getItem('token')) return null;

    return (
        <div className="chatbot-container">
            {/* FAB Button */}
            <button 
                className={`chatbot-fab ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                title="Health Assistant"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window animate-slide-up">
                    <div className="chatbot-header">
                        <h3>ግዕዝ Health Assistant</h3>
                        <div className="header-actions">
                            <button 
                                className={`voice-toggle ${isSpeaking ? 'active' : ''}`}
                                onClick={toggleSpeaking}
                                title={isSpeaking ? "Disable Voice Output" : "Enable Voice Output"}
                            >
                                🔊
                            </button>
                            <button onClick={() => setIsOpen(false)}>✕</button>
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

                    <div className="chatbot-input">
                        <button 
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={toggleListening}
                            title="Voice Input"
                        >
                            🎤
                        </button>
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type or speak your symptoms..."
                        />
                        <button className="send-btn" onClick={() => handleSend()}>
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
