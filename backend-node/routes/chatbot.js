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
    "insomnia": "I understand you're having trouble sleeping. Try a calming bedtime routine: dim lights, limit screens, deep breathing, and maybe a warm drink. If it continues, consider talking to a doctor about sleep hygiene or potential underlying issues.",
};

const getChatResponse = async (message, history = [], userId) => {
    const msg = message.toLowerCase();

    // 1. 🚨 Emergency detection FIRST
    if (msg.includes("chest pain") || msg.includes("can't breathe")) {
        return "🚨 This sounds serious. Please go to a hospital immediately.";
    }

    // 2. 🧠 Try ML prediction (MAIN LOGIC)
    try {
        const mlResponse = await axios.post("http://127.0.0.1:5000/predict", { text: message });
        const result = mlResponse.data;

        if (result?.predicted_disease) {
            return `Based on your symptoms, this may be ${result.predicted_disease}. 
Triage: ${result.triage_level}. 
Advice: Please consider seeing a doctor.`;
        }
    } catch (e) {
        console.log("ML not available");
    }

    // 3. ❤️ Emotional support
    if (msg.includes("stress") || msg.includes("sad") || msg.includes("anxiety")) {
        return "I understand how you feel. Take a deep breath. You are not alone.";
    }

    // 4. 📚 Knowledge base
    if (msg.includes("sleep") || msg.includes("insomnia")) {
        return "Try reducing screen time, drink warm tea, and relax before bed.";
    }

    // 5. 🧠 Smart fallback (IMPORTANT)
    return "Can you explain your symptoms or feelings a bit more so I can help you better?";
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
