import spacy
import re

nlp = spacy.load("en_core_web_sm")

SYMPTOMS = [
    "itching", "skin_rash", "nodal_skin_eruptions",
    "continuous_sneezing", "shivering", "headache",
    "vomiting", "fatigue", "cough",
    "fever", "chest_pain"
]

EMERGENCY_WORDS = [
    "unconscious",
    "cannot breathe",
    "severe pain",
    "bleeding",
    "heart attack",
    "collapse"
]

from difflib import get_close_matches

def extract_symptoms(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    doc = nlp(text)

    found = []

    for token in doc:
        word = token.lemma_

        matches = get_close_matches(word, SYMPTOMS, n=1, cutoff=0.7)

        if matches:
            found.append(matches[0])

    # ✅ emergency detection
    for word in EMERGENCY_WORDS:
        if word in text:
            found.append("chest_pain")

    return list(set(found))