import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRobot } from "react-icons/fa";
import { BsX, BsMicFill } from "react-icons/bs";
import "./VoiceChatbot.css";

function VoiceChatbot() {

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [speaking, setSpeaking] = useState(false);

  // ================= TOGGLE CHAT =================
  const toggleChat = () => {
    setOpen(prev => !prev);
  };

  // ================= LOAD VOICES (IMPORTANT FIX) =================
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  // ================= TEXT TO SPEECH =================
  const speak = (text, lang = "en-US") => {

    // stop previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // load voices
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find(v => v.lang.includes(lang)) || voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    setSpeaking(true);

    utterance.onstart = () => {
      console.log("🔊 speaking...");
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    try {

      const res = await axios.post("http://localhost:3000/api/chat", {
        message: input,
      });

      const reply = res.data.reply;

      setMessages(prev => [
        ...prev,
        { role: "bot", text: reply }
      ]);

      speak(reply);

    } catch (error) {

      console.error(error);

      const errMsg = "AI service error";

      setMessages(prev => [
        ...prev,
        { role: "bot", text: errMsg }
      ]);

      speak(errMsg);
    }

    setInput("");
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <div className="chat-fab" onClick={toggleChat}>
        {open ? <BsX size={22} /> : <FaRobot size={22} />}
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div className="chat-wrapper">

          {/* HEADER */}
          <div className="chat-header">
            <FaRobot />
            <span>AI Voice Assistant</span>
          </div>

          {/* CHAT BODY */}
          <div className="chat-body">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`msg ${msg.role === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}

            {speaking && (
              <div className="typing">
                🔊 AI is speaking...
              </div>
            )}

          </div>

          {/* INPUT */}
          <div className="chat-footer">

            <button className="mic-btn">
              <BsMicFill />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI..."
            />

            <button className="send-btn" onClick={sendMessage}>
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default VoiceChatbot;