from flask import Flask, jsonify, request
from nlp_processor import extract_symptoms
import joblib

app = Flask(__name__)

# Load model + encoder
model = joblib.load("models/disease_model.pkl")
encoder = joblib.load("models/symptom_encoder.pkl")

# Disease → triage mapping
triage_map = {
    "Common Cold": "normal",
    "Allergy": "normal",
    "Acne": "normal",
    "Fungal infection": "normal",
    "GERD": "normal",
    "Impetigo": "normal",

    "Bronchial Asthma": "urgent",
    "Pneumonia": "urgent",
    "Tuberculosis": "urgent",
    "Malaria": "urgent",
    "Dengue": "urgent",
    "Typhoid": "urgent",
    "Hepatitis B": "urgent",
    "Hepatitis C": "urgent",
    "Hepatitis D": "urgent",
    "Hepatitis E": "urgent",
    "Jaundice": "urgent",
    "Urinary tract infection": "urgent",

    "Heart attack": "emergency",
    "Paralysis (brain hemorrhage)": "emergency",
    "Hypoglycemia": "emergency"
}

critical_symptoms = [
    "chest_pain",
    "difficulty_breathing",
    "unconsciousness",
    "severe_bleeding"
]


@app.route("/")
def home():
    return jsonify({"message": "ML Triage API is running"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        text = data.get("text", "").lower()

        symptoms = extract_symptoms(text)
        if not symptoms:
            return jsonify({
                "predicted_disease": "Unknown",
                "confidence": 0,
                "triage_level": "normal",
                "top3_predictions": []
            }), 200

        valid_symptoms = [s for s in symptoms if s in encoder.classes_]

        if not valid_symptoms:
            return jsonify({
                "predicted_disease": "Unknown",
                "confidence": 0,
                "triage_level": "normal",
                "top3_predictions": []
            }), 200

        encoded = encoder.transform([valid_symptoms])

        prediction = model.predict(encoded)
        probabilities = model.predict_proba(encoded)

        disease = prediction[0]
        confidence = float(probabilities.max() * 100)

        # top 3 predictions
        top3_idx = probabilities[0].argsort()[-3:][::-1]

        top3 = []
        for i in range(3):
            top3.append({
                "disease": model.classes_[top3_idx[i]],
                "prob": round(float(probabilities[0][top3_idx[i]] * 100), 2)
            })

        # triage level (safe lowercase)
        triage_level = triage_map.get(disease, "normal").lower()

        # emergency override
        if any(sym in critical_symptoms for sym in symptoms):
            triage_level = "emergency"

        return jsonify({
            "predicted_disease": disease,
            "confidence": round(confidence, 2),
            "triage_level": triage_level,
            "top3_predictions": top3
        })

    except Exception as e:
        print("ERROR:", e)

        # 
        return jsonify({
            "predicted_disease": "Unknown",
            "confidence": 0,
            "triage_level": "normal",
            "top3_predictions": []
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)