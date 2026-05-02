const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const db = require("../database/db");
const axios = require("axios");

// Holistic Knowledge Base (Physical & Psychological)
const healthKnowledge = {
    // Physical Conditions
    "common cold": "Treatment: Rest, hydration, and over-the-counter decongestants. Advice: Avoid spreading by washing hands frequently.",
    "pneumonia": "Treatment: Antibiotics (prescribed by a doctor) and rest. Advice: Seek immediate care if breathing becomes difficult.",
    "malaria": "Treatment: Antimalarial medications. Advice: This is urgent! A blood test is required immediately.",
    "heart attack": "Treatment: EMERGENCY medical care required. Advice: Call emergency services and chew an aspirin if not allergic.",
    "diabetes": "Treatment: Insulin or oral medications, balanced diet, and exercise. Advice: Monitor blood sugar daily.",
    "asthma": "Treatment: Rescue inhalers and long-term control meds. Advice: Avoid triggers like smoke or pollen.",
    
    // Psychological Support
    "stress": "It sounds like you're under a lot of pressure. Advice: Try the 4-7-8 breathing technique: Inhale for 4s, hold for 7s, exhale for 8s. Take a short walk or practice mindfulness.",
    "anxiety": "Anxiety can be overwhelming. Advice: Focus on things you can control. Try the 5-4-3-2-1 grounding technique: Identify 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.",
    "depression": "I'm sorry you're feeling this way. You're not alone. Advice: Reach out to a trusted friend or professional. Physical activity and regular sleep can help, but professional counseling is often key.",
    "insomnia": "Treatment: Better sleep hygiene (no screens before bed). Advice: Keep your room cool and dark. Try a consistent wake-up time.",
    "loneliness": "Connecting with others is vital for mental health. Advice: Try joining a local group or calling a family member. Small interactions can make a big difference.",
    
    // Treatments & General Advice
    "fever": "Treatment: Acetaminophen or Ibuprofen, cool compresses. Advice: Stay hydrated. If fever exceeds 103°F (39.4°C), contact a doctor.",
    "headache": "Treatment: Rest in a dark room, hydration. Advice: If it's a 'thunderclap' headache (sudden and severe), seek emergency care.",
    "stomach": "Treatment: Bland diet (BRAT: Bananas, Rice, Applesauce, Toast). Advice: Avoid caffeine and spicy foods until you feel better.",
};

const getChatResponse = async (message, userId) => {
    const msg = message.toLowerCase();
    
    // 1. Fetch user context (latest triage)
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

    // 2. Psychological & Holistic Search
    for (const [key, value] of Object.entries(healthKnowledge)) {
        if (msg.includes(key)) return value;
    }

    // 3. Treatment-Specific Detection
    if (msg.includes("treat") || msg.includes("cure") || msg.includes("medicine") || msg.includes("help with")) {
        const query = msg.replace("how to", "").replace("treat", "").replace("cure", "").replace("medicine for", "").trim();
        return `For ${query}, I recommend checking our Results page if you've done a check, or consulting a specialist. Generally, rest and hydration are first steps for many conditions, but specific treatments require a doctor's prescription.`;
    }

    // 4. Symptom Detection (AI)
    const symptomKeywords = ["pain", "feel", "have", "ache", "sore", "cough", "fever", "nausea", "dizzy", "bleeding"];
    const looksLikeSymptoms = msg.length > 15 || symptomKeywords.some(kw => msg.includes(kw));

    if (looksLikeSymptoms && !msg.includes("how") && !msg.includes("what is") && !msg.includes("thank")) {
        try {
            const mlResponse = await axios.post("http://127.0.0.1:5000/predict", { text: message });
            const result = mlResponse.data;

            if (result && result.predicted_disease) {
                let advice = "You should schedule an appointment for a professional evaluation.";
                if (result.triage_level === 'Emergency') {
                    advice = "🚨 EMERGENCY: This requires immediate hospital care. Please call emergency services now!";
                } else if (result.triage_level === 'Urgent') {
                    advice = "⚠️ This is Urgent. Please use the 'New Check' form to get an appointment within 24 hours.";
                }
                
                const conditionInfo = healthKnowledge[result.predicted_disease.toLowerCase()] || "";
                return `My analysis suggests ${result.predicted_disease} (${result.triage_level}). ${conditionInfo} ${advice}`;
            }
        } catch (error) {
            console.error("ML Error:", error.message);
        }
    }

    // 5. System & Navigation
    if (msg.includes("how") && (msg.includes("use") || msg.includes("work"))) {
        return "I can help with disease detection, psychological support, and treatment advice. Describe your symptoms or how you're feeling, and I'll guide you!";
    }

    if (msg.includes("my result") || msg.includes("last check")) {
        if (userContext) {
            return `On ${new Date(userContext.created_at).toLocaleDateString()}, you were assessed with ${userContext.predicted_disease}. Check your 'Result' page for treatment plans.`;
        }
    }

    // 6. Greetings & Empathy
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        return "Hello! I'm your Holistic Health Assistant. Whether you're feeling physically unwell or mentally stressed, I'm here to listen and help. What's on your mind?";
    }

    if (msg.includes("thank")) {
        return "You're very welcome. Remember, I'm here for you 24/7. Take care!";
    }

    return "I'm here to support both your physical and mental health. Please describe your symptoms or feelings, or ask me about a specific treatment.";
};

router.post("/chat", authenticateToken, async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    const response = await getChatResponse(message, userId);
    
    res.json({
        reply: response,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
