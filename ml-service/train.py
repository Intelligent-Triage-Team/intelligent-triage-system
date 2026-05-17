import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
import warnings
warnings.filterwarnings("ignore")

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
# 1. Load Dataset
# =====================================================
df = pd.read_csv("data/dataset.csv")

print("Columns:\n", df.columns)

# =====================================================
# 2. Clean Dataset
# =====================================================
df["Disease"] = df["Disease"].astype(str).str.strip()

df = df[df["Disease"] != ""]
df = df[df["Disease"] != "nan"]

df.fillna("", inplace=True)

print("Number of unique diseases:", df["Disease"].nunique())

print("Duplicate rows before removal:", df.duplicated().sum())
df = df.drop_duplicates()
print("Duplicate rows after removal:", df.duplicated().sum())

# =====================================================
# 3. Prepare Symptoms
# =====================================================
target_column = "Disease"
symptom_columns = df.columns[1:]

df["all_symptoms"] = df[symptom_columns].values.tolist()

df["all_symptoms"] = df["all_symptoms"].apply(
    lambda row: [
        str(sym).strip()
        for sym in row
        if str(sym).strip() != ""
    ]
)

# remove rows with zero symptoms
df = df[df["all_symptoms"].map(len) > 0]

# =====================================================
# 4. Encode Symptoms
# =====================================================
mlb = MultiLabelBinarizer()

X = mlb.fit_transform(df["all_symptoms"])
y = df[target_column]

# =====================================================
# 5. Train Test Split
# =====================================================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

# =====================================================
# 6. Model Comparison
# =====================================================
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        random_state=42
    )
}

best_model = None
best_name = ""
best_f1 = 0

print("\n==============================")
print("MODEL COMPARISON")
print("==============================")

for name, model in models.items():

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")

    try:
        cv_scores = cross_val_score(
            model,
            X,
            y,
            cv=2
        )
        cv_mean = round(cv_scores.mean(), 4)
    except:
        cv_mean = "Skipped"

    print(f"\n{name}")
    print("Accuracy :", round(acc, 4))
    print("F1 Score :", round(f1, 4))
    print("CV Score :", cv_mean)

    # if f1 > best_f1:
    #     best_f1 = f1
    #     best_model = model
    #     best_name = name
    # Prefer Random Forest for stronger probability confidence
    if name == "Random Forest":
        best_f1 = f1
        best_model = model
        best_name = name

# =====================================================
# 7. Final Best Model
# =====================================================
print("\n==============================")
print("Best Model:", best_name)
print("Best F1 Score:", round(best_f1, 4))

# =====================================================
# 8. Save Model
# =====================================================
joblib.dump(best_model, "models/disease_model.pkl")
joblib.dump(mlb, "models/symptom_encoder.pkl")

print("Model saved successfully!")
print("==============================")

# =====================================================
# 9. Final Evaluation
# =====================================================
final_pred = best_model.predict(X_test)

print("\nClassification Report:\n")
print(classification_report(y_test, final_pred))

# =====================================================
# 10. Example Prediction Test
# =====================================================
sample_index = 0

sample_symptoms = X_test[sample_index].reshape(1, -1)

prediction = best_model.predict(sample_symptoms)
probabilities = best_model.predict_proba(sample_symptoms)

disease = prediction[0]

confidence = probabilities.max() * 100

top3_idx = probabilities[0].argsort()[-3:][::-1]

top3_diseases = best_model.classes_[top3_idx]
top3_probs = probabilities[0][top3_idx] * 100

# actual symptoms from test row
input_symptoms = []

for i, value in enumerate(X_test[sample_index]):
    if value == 1:
        input_symptoms.append(mlb.classes_[i])

triage_level = triage_map.get(disease, "Normal")

# critical symptom override
if any(sym in critical_symptoms for sym in input_symptoms):
    triage_level = "Emergency"

print("\n--- TRIAGE TEST ---")

print("\nTop 3 Predictions:")
for i in range(3):
    print(
        f"{i+1}. {top3_diseases[i]} - {round(top3_probs[i],2)}%"
    )

print("\nFinal Disease:", disease)
print("Confidence:", round(confidence, 2), "%")
print("Symptoms:", input_symptoms)
print("Triage Level:", triage_level)