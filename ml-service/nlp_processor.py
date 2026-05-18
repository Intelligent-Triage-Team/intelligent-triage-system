import spacy
import re
from spellchecker import SpellChecker
nlp = spacy.load("en_core_web_sm")
nlp = spacy.load("en_core_web_sm")
spell = SpellChecker()
# ==========================
# Symptom dictionary
# ==========================
SYMPTOM_MAP = {
    # fever
    "fever": "high_fever",
    "high fever": "high_fever",
    "temperature": "high_fever",

    # pain
    "headache": "headache",
    "head pain": "headache",

    "chest pain": "chest_pain",
    "heart pain": "chest_pain",

    "abdominal pain": "abdominal_pain",
    "stomach pain": "abdominal_pain",
    "belly pain": "belly_pain",

    "flank pain": "severe_flank_pain",

    # stomach issues
    "nausea": "nausea",
    "vomiting": "vomiting",
    "throwing up": "vomiting",
    "constipation": "constipation",
    "diarrhea": "diarrhoea",

    # breathing
    "cough": "cough",
    "breathlessness": "breathlessness",
    "shortness of breath": "breathlessness",
    "difficulty breathing": "difficulty_breathing",

    # body
    "fatigue": "fatigue",
    "weakness": "muscle_weakness",
    "dizziness": "dizziness",
    "chills": "chills",
    "shivering": "chills",

    # skin
    "rash": "skin_rash",
    "skin rash": "skin_rash",
    "itching": "itching",

    # urine
    "burning urine": "burning_micturition",
    "pain urinating": "burning_micturition",

    # swelling
    "leg swelling": "leg_swelling",
    "swollen legs": "leg_swelling"
}

# ==========================
# Emergency override words
# ==========================
EMERGENCY_WORDS = {
    "unconscious": "unconsciousness",
    "cannot breathe": "difficulty_breathing",
    "can't breathe": "difficulty_breathing",
    "severe bleeding": "severe_bleeding",
    "bleeding heavily": "severe_bleeding",
    "collapse": "unconsciousness"
}

# ==========================
# Text normalization
# ==========================
def normalize_text(text):
    corrected_words = []

    for word in text.split():

        # keep medical underscore words
        if "_" in word:
            corrected_words.append(word)
            continue

        corrected = spell.correction(word)

        corrected_words.append(corrected if corrected else word)

    return " ".join(corrected_words)
def extract_symptoms(text):
    text = text.lower()
    text = normalize_text(text)

    # keep _ and ()
    text = re.sub(r"[^a-zA-Z0-9_\s()]", " ", text)

    text = re.sub(r"\s+", " ", text).strip()

    found = []

    # phrase matching first
    for phrase, symptom in SYMPTOM_MAP.items():
        if phrase in text:
            found.append(symptom)

    # emergency words
    for phrase, symptom in EMERGENCY_WORDS.items():
        if phrase in text:
            found.append(symptom)

    # single token fallback
    doc = nlp(text)

    for token in doc:
        word = token.lemma_.lower()

        if word in SYMPTOM_MAP:
            found.append(SYMPTOM_MAP[word])

    return list(set(found))