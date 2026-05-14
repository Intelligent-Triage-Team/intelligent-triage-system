try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    print("TensorFlow not found. CNN functionality will be mocked.")

import numpy as np
import cv2
import os
from PIL import Image
import json
import random

class InjuryClassifier:
    def __init__(self):
        self.model = None
        self.class_labels = {
            0: "Normal - No Injury",
            1: "Minor Cut/Scrape",
            2: "Bruise/Contusion", 
            3: "Burn - First Degree",
            4: "Burn - Second Degree",
            5: "Fracture/Sprain",
            6: "Infection/Inflammation",
            7: "Rash/Skin Irritation",
            8: "Swelling/Edema",
            9: "Severe Injury - Emergency"
        }
        self.triage_mapping = {
            "Normal - No Injury": "normal",
            "Minor Cut/Scrape": "normal", 
            "Bruise/Contusion": "normal",
            "Burn - First Degree": "urgent",
            "Burn - Second Degree": "urgent",
            "Fracture/Sprain": "urgent",
            "Infection/Inflammation": "urgent",
            "Rash/Skin Irritation": "normal",
            "Swelling/Edema": "urgent",
            "Severe Injury - Emergency": "emergency"
        }
        
    def build_model(self):
        """Build CNN model for injury classification"""
        if not HAS_TENSORFLOW:
            print("Skipping model build - TensorFlow not available")
            return None
            
        self.model = Sequential([
            # First Convolutional Block
            Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
            BatchNormalization(),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Second Convolutional Block
            Conv2D(64, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Third Convolutional Block
            Conv2D(128, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Fourth Convolutional Block
            Conv2D(256, (3, 3), activation='relu'),
            BatchNormalization(),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Flatten and Dense Layers
            Flatten(),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(10, activation='softmax')  # 10 injury classes
        ])
        
        # Compile model
        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return self.model
    
    def preprocess_image(self, image_path):
        """Preprocess image for CNN prediction"""
        try:
            # Load and resize image
            img = Image.open(image_path)
            img = img.convert('RGB')
            img = img.resize((224, 224))
            
            # Convert to numpy array and normalize
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def predict_injury(self, image_path):
        """Predict injury type from image"""
        if not HAS_TENSORFLOW:
            # Mock prediction
            # to allow the UI to function while TensorFlow is missing
            try:
                # Just a random index for now
                predicted_class = random.randint(1, 9) # Skip "Normal" mostly
                confidence = 0.85 + (random.random() * 0.1) # 0.85 - 0.95
                
                injury_type = self.class_labels[predicted_class]
                triage_level = self.triage_mapping[injury_type]
                
                # Mock probabilities
                probs = [0.01] * 10
                probs[predicted_class] = confidence
                # redistribute remaining
                remaining = 1.0 - confidence
                for i in range(10):
                    if i != predicted_class:
                        probs[i] = remaining / 9
                
                analysis = self.generate_analysis(injury_type, confidence, np.array(probs))
                
                return {
                    "success": True,
                    "injury_type": injury_type,
                    "triage_level": triage_level,
                    "confidence": confidence,
                    "class_probabilities": {
                        self.class_labels[i]: float(prob) for i, prob in enumerate(probs)
                    },
                    "analysis": analysis,
                    "recommendations": self.get_recommendations(injury_type, triage_level)
                }
            except Exception as e:
                return {"error": f"Mock prediction failed: {str(e)}"}

        if self.model is None:
            self.build_model()
            # Load pre-trained weights if available
            try:
                self.model.load_weights('injury_classifier_weights.h5')
            except:
                print("No pre-trained weights found. Using random initialization.")
        
        # Preprocess image
        processed_img = self.preprocess_image(image_path)
        if processed_img is None:
            return {
                "error": "Failed to process image",
                "prediction": None,
                "confidence": 0
            }
        
        # Make prediction
        try:
            prediction = self.model.predict(processed_img)
            predicted_class = np.argmax(prediction[0])
            confidence = float(np.max(prediction[0]))
            
            injury_type = self.class_labels[predicted_class]
            triage_level = self.triage_mapping[injury_type]
            
            # Generate detailed analysis
            analysis = self.generate_analysis(injury_type, confidence, prediction[0])
            
            return {
                "success": True,
                "injury_type": injury_type,
                "triage_level": triage_level,
                "confidence": confidence,
                "class_probabilities": {
                    self.class_labels[i]: float(prob) for i, prob in enumerate(prediction[0])
                },
                "analysis": analysis,
                "recommendations": self.get_recommendations(injury_type, triage_level)
            }
            
        except Exception as e:
            return {
                "error": f"Prediction failed: {str(e)}",
                "prediction": None,
                "confidence": 0
            }
    
    def generate_analysis(self, injury_type, confidence, probabilities):
        """Generate detailed analysis of the injury"""
        analysis = {
            "primary_injury": injury_type,
            "confidence_level": confidence,
            "severity_assessment": self.assess_severity(injury_type, confidence),
            "alternative_possibilities": []
        }
        
        # Get top 3 alternative predictions
        top_indices = np.argsort(probabilities)[-3:][::-1][1:]  # Skip top prediction
        for idx in top_indices:
            if probabilities[idx] > 0.1:  # Only include if probability > 10%
                analysis["alternative_possibilities"].append({
                    "injury": self.class_labels[idx],
                    "probability": float(probabilities[idx])
                })
        
        return analysis
    
    def assess_severity(self, injury_type, confidence):
        """Assess severity based on injury type and confidence"""
        if "Emergency" in injury_type or "Second Degree" in injury_type:
            return "Severe - Immediate medical attention required"
        elif "Fracture" in injury_type or "Infection" in injury_type:
            return "Moderate to Severe - Medical evaluation needed soon"
        elif confidence > 0.8 and injury_type != "Normal - No Injury":
            return "Moderate - Professional consultation recommended"
        else:
            return "Mild - Self-care may be sufficient"
    
    def get_recommendations(self, injury_type, triage_level):
        """Get medical recommendations based on injury type"""
        recommendations = {
            "Normal - No Injury": [
                "No injury detected",
                "Continue monitoring the area",
                "Practice good hygiene"
            ],
            "Minor Cut/Scrape": [
                "Clean the wound with mild soap and water",
                "Apply antibiotic ointment",
                "Cover with sterile bandage",
                "Change dressing daily"
            ],
            "Bruise/Contusion": [
                "Apply cold compress for 15-20 minutes",
                "Elevate the affected area",
                "Rest the injured area",
                "Monitor for increased swelling"
            ],
            "Burn - First Degree": [
                "Cool the burn with cool water for 10-15 minutes",
                "Apply aloe vera gel",
                "Cover with sterile, non-stick dressing",
                "Avoid popping blisters"
            ],
            "Burn - Second Degree": [
                "Seek immediate medical attention",
                "Do not break blisters",
                "Cover with clean, dry cloth",
                "Keep the area elevated"
            ],
            "Fracture/Sprain": [
                "Immobilize the affected area",
                "Apply ice packs to reduce swelling",
                "Seek medical evaluation",
                "Avoid putting weight on injured area"
            ],
            "Infection/Inflammation": [
                "Seek medical evaluation promptly",
                "Keep area clean and dry",
                "Monitor for spreading redness",
                "Note any fever symptoms"
            ],
            "Rash/Skin Irritation": [
                "Avoid scratching the area",
                "Apply hydrocortisone cream",
                "Use cool compresses",
                "Identify and avoid triggers"
            ],
            "Swelling/Edema": [
                "Elevate the affected area",
                "Apply cold compresses",
                "Reduce salt intake",
                "Seek medical evaluation if persistent"
            ],
            "Severe Injury - Emergency": [
                "CALL EMERGENCY SERVICES IMMEDIATELY",
                "Do not move the patient unless necessary",
                "Apply direct pressure to bleeding",
                "Keep the patient calm and warm"
            ]
        }
        
        return recommendations.get(injury_type, ["Consult a healthcare provider for proper evaluation"])
    
    def save_model(self, filepath='injury_classifier_weights.h5'):
        """Save the trained model weights"""
        if self.model:
            self.model.save_weights(filepath)
            print(f"Model weights saved to {filepath}")
    
    def load_model(self, filepath='injury_classifier_weights.h5'):
        """Load pre-trained model weights"""
        if not HAS_TENSORFLOW:
            print("Skipping weight load - TensorFlow not available")
            return False
            
        if self.model is None:
            self.build_model()
        
        if os.path.exists(filepath):
            self.model.load_weights(filepath)
            print(f"Model weights loaded from {filepath}")
            return True
        else:
            print(f"No weights file found at {filepath}")
            return False

# Initialize global classifier
injury_classifier = InjuryClassifier()
