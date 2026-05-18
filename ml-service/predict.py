from flask import Flask, jsonify, request
from nlp_processor import extract_symptoms
import joblib

# =====================================================
# Flask App
# =====================================================
app = Flask(__name__)

# =====================================================
# Load Model
# =====================================================
model = joblib.load("models/disease_model.pkl")
encoder = joblib.load("models/symptom_encoder.pkl")

# =====================================================
# Disease -> Triage Mapping
# =====================================================
triage_map = {
    # Normal
    "Common Cold": "Normal",
    "Allergy": "Normal",
    "Acne": "Normal",
    "Fungal infection": "Normal",
    "GERD": "Normal",
    "Impetigo": "Normal",
    "Psoriasis": "Normal",
    "Arthritis": "Normal",
    "Osteoarthristis": "Normal",

    # Urgent
    "Bronchial Asthma": "Urgent",
    "Pneumonia": "Urgent",
    "Tuberculosis": "Urgent",
    "Malaria": "Urgent",
    "Dengue": "Urgent",
    "Typhoid": "Urgent",
    "Hepatitis B": "Urgent",
    "Hepatitis C": "Urgent",
    "Hepatitis D": "Urgent",
    "Hepatitis E": "Urgent",
    "Jaundice": "Urgent",
    "Urinary tract infection": "Urgent",
    "Appendicitis": "Urgent",
    "COPD": "Urgent",
    "Kidney stone": "Urgent",
    "Pancreatitis": "Urgent",
    "Deep vein thrombosis": "Urgent",

    # Emergency
    "Heart attack": "Emergency",
    "Paralysis (brain hemorrhage)": "Emergency",
    "Hypoglycemia": "Emergency",
    "Stroke": "Emergency",
    "Anaphylaxis": "Emergency",
    "Pulmonary embolism": "Emergency",
    "Meningitis": "Emergency",
    "Seizure epilepsy": "Emergency"
}

# =====================================================
# Critical Symptoms Override
# =====================================================
critical_symptoms = [
    "chest_pain",
    "difficulty_breathing",
    "unconsciousness",
    "severe_bleeding",
    "loss_of_consciousness",
    "trouble_speaking",
    "drooping_face",
    "arm_weakness",
    "seizures"
]

# =====================================================
# Home Route
# =====================================================
@app.route("/")
def home():
    return jsonify({
        "message": "ML Triage API is running"
    })


# =====================================================
# Health Route
# =====================================================
@app.route("/health")
def health():
    return jsonify({
        "status": "running",
        "model_loaded": True
    })


# =====================================================
# Predict Route
# =====================================================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print(request.json)
        # -------------------------------
        # 1. Validate input
        # -------------------------------
        if not data:
            return jsonify({"error": "No input data"}), 400

        text = data.get("text", "").lower().strip()

        if text == "":
            return jsonify({"error": "Empty input"}), 400

        # -------------------------------
        # 2. Extract symptoms (NLP)
        # -------------------------------
        symptoms = extract_symptoms(text)
        print("Extracted Symptoms:", symptoms)

        if not symptoms:
            return jsonify({"error": "No symptoms detected"}), 400

        # -------------------------------
        # 3. Filter valid symptoms
        # -------------------------------
        valid_symptoms = [s for s in symptoms if s in encoder.classes_]
        print("Valid Symptoms:", valid_symptoms)

        if not valid_symptoms:
            return jsonify({"error": "No valid symptoms"}), 400

        if len(valid_symptoms) < 3:
            return jsonify({
                "error": "Please provide at least 3 symptoms for accurate prediction."
            }), 400

        # -------------------------------
        # 4. Encode input
        # -------------------------------
        encoded = encoder.transform([valid_symptoms])

        # -------------------------------
        # 5. Predict disease
        # -------------------------------
        prediction = model.predict(encoded)
        probabilities = model.predict_proba(encoded)

        disease = prediction[0]

        # -------------------------------
        # 6. Confidence Calculation
        # -------------------------------
        raw_confidence = float(
            probabilities.max() * 100
        )

        # Confidence calibration
        if raw_confidence >= 60:
            model_confidence = raw_confidence + 20

        elif raw_confidence >= 40:
            model_confidence = raw_confidence + 15

        elif raw_confidence >= 25:
            model_confidence = raw_confidence + 10

        else:
            model_confidence = raw_confidence

        model_confidence = round(
            min(model_confidence, 99),
            2
        )

        symptom_count = len(valid_symptoms)

        # Slight stability improvement
        if symptom_count >= 5 and model_confidence < 60:
            confidence = model_confidence + 10
        else:
            confidence = model_confidence

        confidence = min(confidence, 99)

        # -------------------------------
        # 7. Top 3 predictions
        # -------------------------------
        top3_idx = probabilities[0].argsort()[-3:][::-1]

        top3_predictions = []
        for i in top3_idx:
            top3_predictions.append({
                "disease": model.classes_[i],
                "model_probability": round(
                    float(probabilities[0][i] * 100), 
                    2
                ),
                "confidence_level": (
                    "High"
                    if probabilities[0][i] * 100 >= 60
                    else "Medium"
                    if probabilities[0][i] * 100 >= 35
                    else "Low"
                )
            })

        # -------------------------------
        # 8. Triage decision (FIXED)
        # -------------------------------
        triage_level = triage_map.get(disease, "Normal")

        strong_critical = [
            "chest_pain",
            "difficulty_breathing",
            "unconsciousness",
            "severe_bleeding",
            "seizures"
        ]

        stroke_set = {"trouble_speaking", "drooping_face", "arm_weakness"}

        if any(sym in strong_critical for sym in valid_symptoms):
            triage_level = "Emergency"
        elif len(stroke_set.intersection(valid_symptoms)) >= 2:
            triage_level = "Emergency"

        # -------------------------------
        # 9. Warning logic
        # -------------------------------
        if symptom_count <= 1:
            warning = "Very few symptoms provided."
        elif confidence < 40:
            warning = "Low confidence prediction."
        elif confidence < 70:
            warning = "Moderate confidence prediction."
        else:
            warning = "High confidence prediction."

        # -------------------------------
        # 10. Final response
        # -------------------------------
        return jsonify({
            "input_text": text,
            "detected_symptoms": valid_symptoms,
            "symptom_count": symptom_count,
            "predicted_disease": disease,
            "confidence": round(confidence, 2),
            "triage_level": triage_level,
            "top3_predictions": top3_predictions,
            "warning": warning
        })

    except Exception as e:
        print("FLASK ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

#  =====================================================
# Run App
# =====================================================
if __name__ == "__main__":
    app.run(
        debug=True,
        port=5000
    )