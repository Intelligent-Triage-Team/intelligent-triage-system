from flask import Flask, jsonify, request
import joblib

triage_map = {
    "Common Cold": "Normal",
    "Allergy": "Normal",
    "Acne": "Normal",
    "Fungal infection": "Normal",
    "GERD": "Normal",
    "Impetigo": "Normal",

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

    "Heart attack": "Emergency",
    "Paralysis (brain hemorrhage)": "Emergency",
    "Hypoglycemia": "Emergency"
}
critical_symptoms = [
    "chest_pain",
    "difficulty_breathing",
    "unconsciousness",
    "severe_bleeding"
]
app = Flask(__name__)

model = joblib.load("models/disease_model.pkl")
encoder = joblib.load("models/symptom_encoder.pkl")


@app.route("/")
def home():
    return jsonify({"message": "ML Triage API is running"})
@app.route("/health")
def health():
    return jsonify({"status": "ML service running"})


# @app.route("/predict", methods=["POST"])
# def predict():

#     data = request.get_json()

#     # symptoms = data.get("symptoms", [])
    

# symptoms_text = data.get("symptoms", "").lower()

# # split into words
# words = symptoms_text.split()

# # create 2-word combinations
# symptoms = []
# for i in range(len(words)):
#     symptoms.append(words[i])
#     if i < len(words) - 1:
#         symptoms.append(words[i] + "_" + words[i+1])

#     # encode symptoms
#     encoded = encoder.transform([symptoms])

#     # predict disease
#     prediction = model.predict(encoded)
#     probabilities = model.predict_proba(encoded)

#     disease = prediction[0]

#     # confidence
#     confidence = probabilities.max() * 100

#     # top 3 predictions
#     top3_idx = probabilities[0].argsort()[-3:][::-1]

#     top3_diseases = model.classes_[top3_idx]
#     top3_probs = probabilities[0][top3_idx] * 100

#     triage_level = triage_map.get(disease, "Normal")

#     # emergency override
#     if any(sym in critical_symptoms for sym in symptoms):
#         triage_level = "Emergency"

#     return jsonify({
#         "predicted_disease": disease,
#         "confidence": round(confidence,2),
#         "triage_level": triage_level,
#         "top3_predictions": [
#             {"disease": top3_diseases[0], "prob": round(top3_probs[0],2)},
#             {"disease": top3_diseases[1], "prob": round(top3_probs[1],2)},
#             {"disease": top3_diseases[2], "prob": round(top3_probs[2],2)}
#         ]
#     })
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    symptoms_text = data.get("symptoms", "").lower()

    # split into words
    words = symptoms_text.split()

    # create 2-word combinations
    symptoms = []
    for i in range(len(words)):
        symptoms.append(words[i])
        if i < len(words) - 1:
            symptoms.append(words[i] + "_" + words[i+1])

    # encode symptoms
    encoded = encoder.transform([symptoms])

    # predict disease
    prediction = model.predict(encoded)
    probabilities = model.predict_proba(encoded)

    disease = prediction[0]

    # confidence
    confidence = probabilities.max() * 100

    # top 3 predictions
    top3_idx = probabilities[0].argsort()[-3:][::-1]

    top3_diseases = model.classes_[top3_idx]
    top3_probs = probabilities[0][top3_idx] * 100

    triage_level = triage_map.get(disease, "Normal")

    # emergency override
    if any(sym in critical_symptoms for sym in symptoms):
        triage_level = "Emergency"

    return jsonify({
        "predicted_disease": disease,
        "confidence": round(confidence, 2),
        "triage_level": triage_level,
        "top3_predictions": [
            {"disease": top3_diseases[0], "prob": round(top3_probs[0], 2)},
            {"disease": top3_diseases[1], "prob": round(top3_probs[1], 2)},
            {"disease": top3_diseases[2], "prob": round(top3_probs[2], 2)}
        ]
    })
if __name__ == "__main__":
    app.run(debug=True, port=5000)