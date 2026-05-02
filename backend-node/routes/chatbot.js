const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const db = require("../database/db");
const axios = require("axios");

// Advanced Holistic & Emotional Knowledge Base
const healthKnowledge = {
    // Physical Conditions
    "common cold": "Treatment: Rest, hydration, and over-the-counter decongestants. Advice: Take it easy, drink some warm tea, and let your body heal.",
    "flu": "Treatment: Antiviral drugs if caught early, rest, and plenty of fluids. Advice: Make sure to stay warm and get plenty of sleep.",
    "pneumonia": "Treatment: Antibiotics (prescribed by a doctor) and rest. Advice: Please seek medical care if your breathing feels heavy.",
    "malaria": "Treatment: Antimalarial medications. Advice: This is urgent! Please get a blood test immediately, okay?",
    "heart attack": "Treatment: EMERGENCY medical care required. Advice: Call emergency services right now! Please don't wait.",
    "diabetes": "Treatment: Insulin or oral medications, balanced diet, and exercise. Advice: Keep a close eye on your blood sugar, and remember to be kind to yourself.",
    "asthma": "Treatment: Rescue inhalers and long-term control meds. Advice: Try to avoid smoke or pollen, and keep your inhaler close by.",
    "hypertension": "Treatment: Blood pressure medications, low-sodium diet, and exercise. Advice: Deep breathing and reducing salt can really help.",
    "migraine": "Treatment: Pain relievers, resting in a dark, quiet room. Advice: I know how awful migraines can be. Find a dark, quiet place and try to rest.",
    
    // Psychological Support & Empathy (Friendly Tone)
    "stress": "I can hear how stressed you are, and that's completely valid. Life can be so overwhelming sometimes. Take a deep breath with me... Inhale... and exhale. Try to step away from whatever you're doing for just 5 minutes. You deserve a break.",
    "anxiety": "Anxiety is really tough, but you are safe right now. Let's try to ground ourselves. Can you look around and name 3 things you can see, and 2 things you can touch? I'm right here with you.",
    "depression": "I am so sorry you're feeling this heavy weight. Please know that you are not alone, even if it feels that way right now. Sometimes just getting out of bed is a huge victory. I'm proud of you for being here and talking to me.",
    "sad": "It's okay to feel sad. You don't always have to be strong. If you need to cry, let it out. I'm here to listen, as a friend.",
    "lonely": "Loneliness can ache so deeply. I may be an AI, but I'm here for you, and I care about how you feel. Have you considered calling a family member or a friend today? Even a small text might help you feel connected.",
    "panic attack": "Okay, listen to my voice. You are having a panic attack, but it WILL pass. You are safe. Breathe in for 4 seconds... hold for 4... exhale for 6. Keep doing that. I'm right here.",
    "overwhelmed": "When everything hits at once, it's so easy to feel overwhelmed. Let's not worry about the big picture right now. What is just *one* small thing you can do right now? Even if it's just drinking a glass of water.",
    "tired": "It sounds like you need some serious rest. Not just sleep, but mental rest too. Be gentle with yourself today.",
    "scared": "It's completely normal to feel scared. Whatever is frightening you, we can face it step by step. You don't have to carry it all by yourself.",
    
    // Treatments & General Advice
    "fever": "Treatment: Acetaminophen or Ibuprofen, cool compresses. Advice: Stay hydrated. If it gets too high, please see a doctor.",
    "headache": "Treatment: Rest, hydration. Advice: Drink a big glass of water, sometimes headaches are just your body asking for hydration!",
    "stomach": "Treatment: Bland diet (BRAT: Bananas, Rice, Applesauce, Toast). Advice: Try some ginger tea, it's very soothing for the stomach.",
};

const getChatResponse = async (message, history = [], userId) => {
    const msg = message.toLowerCase();
    
    // 1. Contextual Memory (Analyzing history)
    if (history.length > 0) {
        const lastBotMessage = history[history.length - 1].text.toLowerCase();
        
        // Empathy contextual responses
        if (msg.includes("thank")) {
            if (lastBotMessage.includes("friend") || lastBotMessage.includes("here for you")) {
                return "Anytime, my friend. Truly, I mean it. Whenever you need to talk, I'll be here.";
            }
        }
        
        if (msg === "yes" || msg === "yeah" || msg === "yep") {
            if (lastBotMessage.includes("emergency") || lastBotMessage.includes("severe")) {
                return "🚨 Please, for your safety, call emergency services right now. I want you to be safe.";
            }
        }
    }

    // 2. Fetch user context
    let userContext = null;
    try {
        const [patient] = await db.promise().query("SELECT id FROM patients WHERE user_id = ?", [userId]);
        if (patient.length > 0) {
            const [triage] = await db.promise().query(
                "SELECT * FROM triage_results WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1",
                [patient[0].id]
            );
            if (triage.length > 0) {
                userContext = triage[0];
            }
        }
    } catch (err) {
        console.error("DB Error in chatbot:", err);
    }

    // 3. Greetings & Friendship Intent
    if (msg === "hello" || msg === "hi" || msg === "hey" || msg.includes("good morning")) {
        return "Hi there! I'm so glad you reached out. How are you doing today? You can tell me about your physical health, or just vent about how you're feeling emotionally. I'm your friend, first and foremost.";
    }

    if (msg.includes("how are you") || msg.includes("who are you")) {
        return "I'm your holistic health companion! I'm doing great, but I'm much more interested in how *you* are doing. What's on your mind today?";
    }

    if (msg.includes("thank")) {
        return "You're so very welcome. Always remember that taking care of your mind is just as important as your body. I'm always here for you.";
    }

    // 4. Emotional & Psychological Check (Prioritized)
    const emotionalKeywords = ["sad", "depress", "lonely", "stress", "anxi", "panic", "overwhelm", "scared", "fear", "cry", "hate", "worthless"];
    if (emotionalKeywords.some(kw => msg.includes(kw))) {
        for (const [key, value] of Object.entries(healthKnowledge)) {
            if (msg.includes(key)) return value;
        }
        return "I hear you, and I want you to know your feelings are completely valid. It takes courage to talk about this. I'm here to listen—do you want to tell me more about what's making you feel this way?";
    }

    // 5. Physical Holistic Search
    for (const [key, value] of Object.entries(healthKnowledge)) {
        if (msg.includes(key)) return value;
    }

    // 6. Symptom Detection (AI / Heuristics)
    const symptomKeywords = ["pain", "ache", "sore", "cough", "fever", "nausea", "dizzy", "bleeding", "vomit", "weak"];
    const looksLikeSymptoms = msg.length > 5 && symptomKeywords.some(kw => msg.includes(kw));

    if (looksLikeSymptoms) {
        try {
            const mlResponse = await axios.post("http://127.0.0.1:5000/predict", { text: message }, { timeout: 3000 });
            const result = mlResponse.data;

            if (result && result.predicted_disease) {
                let advice = "I think it would be a good idea to chat with one of our doctors to be safe.";
                if (result.triage_level === 'Emergency') {
                    advice = "🚨 This sounds very serious. Please, don't wait. Call emergency services right now.";
                } else if (result.triage_level === 'Urgent') {
                    advice = "⚠️ This sounds a bit urgent. Let's get you an appointment to see a doctor today, okay?";
                }
                
                return `Based on what you're telling me, this might be related to ${result.predicted_disease}. ${advice} How are you holding up otherwise?`;
            }
        } catch (error) {
            console.log("ML Service unavailable, using heuristic fallback.");
            if (msg.includes("chest pain") || msg.includes("can't breathe")) {
                return "🚨 Your symptoms sound severe. If you are having crushing chest pain or can't breathe, please call emergency services immediately!";
            }
            return "That sounds really uncomfortable. I'm sorry you're going through that. It might be best to schedule a quick Telemedicine call with one of our doctors so they can help you feel better.";
        }
    }

    // 7. System & Navigation Intent
    if (msg.includes("my result") || msg.includes("last check")) {
        if (userContext) {
            return `I looked up your last checkup on ${new Date(userContext.created_at).toLocaleDateString()}. You were diagnosed with ${userContext.predicted_disease}. If you're still feeling unwell, let's book a follow-up visit.`;
        } else {
            return "I couldn't find any recent medical checks on your profile. Would you like to use the AI Diagnosis tool?";
        }
    }

    // Fallback response - Friendly and open-ended
    return "I'm right here with you. Whether you want to talk about a physical symptom, or if you just need a friend to vent to about your day, I'm listening. Take your time.";
};

router.post("/chat", authenticateToken, async (req, res) => {
    const { message, history } = req.body;
    const userId = req.user.id;
    
    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    const response = await getChatResponse(message, history || [], userId);
    
    res.json({
        reply: response,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
