import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import classification_report, accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier

# ==========================
# Disease → Triage mapping
# ==========================
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
# ==========================
# 1️⃣ Load dataset
# ==========================
df = pd.read_csv("data/dataset.csv")

print("Columns:\n", df.columns)

# ==========================
# 2️⃣ Clean data properly
# ==========================

# Clean disease names
df["Disease"] = df["Disease"].astype(str).str.strip()

# Remove empty disease rows
df = df[df["Disease"] != ""]
df = df[df["Disease"] != "nan"]

# Fill missing symptom values
df.fillna("", inplace=True)

print("Number of unique diseases:", df["Disease"].nunique())

# ✅ Check duplicates BEFORE creating list column
print("Duplicate rows before removal:", df.duplicated().sum())
df = df.drop_duplicates()
print("Duplicate rows after removal:", df.duplicated().sum())

# ==========================
# 3️⃣ Prepare features & target
# ==========================
target_column = "Disease"
symptom_columns = df.columns[1:]  # Symptom_1 to Symptom_17

# Combine symptoms into list
df["all_symptoms"] = df[symptom_columns].values.tolist()

# Remove empty strings and strip spaces
df["all_symptoms"] = df["all_symptoms"].apply(
    lambda x: [sym.strip() for sym in x if sym != ""]
)

# ==========================
# 4️⃣ Encode symptoms
# ==========================
mlb = MultiLabelBinarizer()
X = mlb.fit_transform(df["all_symptoms"])

y = df[target_column]

# ==========================
# 5️⃣ Train-test split
# ==========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ==========================
# 6️⃣ Train model
# ==========================
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)
from sklearn.model_selection import cross_val_score

cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=5
)

print("\nCross-validation accuracy:", cv_scores.mean())
model.fit(X_train, y_train)

# ==========================
# 7️⃣ Evaluate
# ==========================
y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))


models = {
    "Logistic Regression": LogisticRegression(max_iter=500),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42)
}

for name, model in models.items():
    print("\n==========================")
    print(f"Training: {name}")
    print("==========================")

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    print("Accuracy:", accuracy_score(y_test, y_pred))

# ==========================
# ==========================
# 8️⃣ Save final model (Random Forest)
# ==========================
final_model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

final_model.fit(X_train, y_train)

joblib.dump(final_model, "models/disease_model.pkl")
joblib.dump(mlb, "models/symptom_encoder.pkl")

print("\nModel saved successfully!")
# ==========================

# ==========================
# Example prediction test
# ==========================

# take one example from test data
sample_symptoms = X_test[0].reshape(1, -1)

# predict disease
prediction = final_model.predict(sample_symptoms)
probabilities = final_model.predict_proba(sample_symptoms)
# get top 3 predictions
top3_idx = probabilities[0].argsort()[-3:][::-1]

top3_diseases = final_model.classes_[top3_idx]
top3_probs = probabilities[0][top3_idx] * 100

disease = prediction[0]

# confidence score
confidence = probabilities.max() * 100

triage_level = triage_map.get(disease, "Normal")

# original symptom list
input_symptoms = df["all_symptoms"].iloc[0]

# emergency override
if any(sym in critical_symptoms for sym in input_symptoms):
    triage_level = "Emergency"

print("\n--- TRIAGE TEST ---")

print("\nTop 3 Predicted Diseases:")
for i in range(3):
    print(f"{i+1}. {top3_diseases[i]} — {round(top3_probs[i],2)}%")

print("\nFinal Selected Disease:", disease)
print("Confidence:", round(confidence, 2), "%")

print("\nSymptoms:", input_symptoms)
print("Triage Level:", triage_level)