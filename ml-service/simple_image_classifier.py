import os
import random
import json
from PIL import Image
import numpy as np

class SimpleInjuryClassifier:
    """Mock injury classifier that works without TensorFlow for testing"""
    def __init__(self):
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
        
        # Mock CNN patterns based on image characteristics
        self.injury_patterns = {
            "red": ["Burn - First Degree", "Rash/Skin Irritation", "Infection/Inflammation"],
            "dark": ["Bruise/Contusion", "Fracture/Sprain", "Severe Injury - Emergency"],
            "bright": ["Minor Cut/Scrape", "Burn - Second Degree"],
            "normal": ["Normal - No Injury", "Rash/Skin Irritation"]
        }
    def build_model(self):
        print("Mock model structure initialized.")
        return True
    def analyze_image_features(self, image_path):
        """Analyze basic image features for mock classification"""
        try:
            img = Image.open(image_path)
            img = img.convert('RGB')
            img_array = np.array(img)
            
            # Basic color analysis
            avg_red = np.mean(img_array[:, :, 0])
            avg_green = np.mean(img_array[:, :, 1])
            avg_blue = np.mean(img_array[:, :, 2])
            
            # Determine dominant color characteristics
            if avg_red > avg_green + 20 and avg_red > avg_blue + 20:
                color_type = "red"
            elif avg_red < 100 and avg_green < 100 and avg_blue < 100:
                color_type = "dark"
            elif avg_red > 150 and avg_green > 150 and avg_blue > 150:
                color_type = "bright"
            else:
                color_type = "normal"
            
            # Image size analysis (mock feature)
            width, height = img.size
            size_factor = (width * height) / (224 * 224)
            
            return {
                "color_type": color_type,
                "avg_colors": (avg_red, avg_green, avg_blue),
                "size_factor": size_factor,
                "brightness": np.mean(img_array)
            }
            
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return None
    
    def predict_injury(self, image_path):
        """Mock prediction based on image analysis"""
        print(f"Analyzing image: {image_path}")
        
        # Analyze image features
        features = self.analyze_image_features(image_path)
        if features is None:
            return {
                "error": "Failed to process image",
                "prediction": None,
                "confidence": 0
            }
        
        # Get possible injuries based on color analysis
        possible_injuries = self.injury_patterns.get(features["color_type"], self.injury_patterns["normal"])
        
        # Weighted random selection based on features
        weights = []
        for injury in possible_injuries:
            # Adjust weights based on image characteristics
            weight = 1.0
            
            # Red images more likely to be burns/rashes
            if features["color_type"] == "red" and "Burn" in injury:
                weight *= 1.5
            elif features["color_type"] == "red" and "Rash" in injury:
                weight *= 1.3
                
            # Dark images more likely to be bruises/fractures
            if features["color_type"] == "dark" and ("Bruise" in injury or "Fracture" in injury):
                weight *= 1.4
                
            # Bright images more likely to be normal/minor injuries
            if features["color_type"] == "bright" and injury in ["Normal - No Injury", "Minor Cut/Scrape"]:
                weight *= 1.2
            
            weights.append(weight)
        
        # Normalize weights
        total_weight = sum(weights)
        if total_weight > 0:
            weights = [w / total_weight for w in weights]
        else:
            weights = [1.0 / len(possible_injuries)] * len(possible_injuries)
        
        # Select injury based on weights
        selected_injury = random.choices(possible_injuries, weights=weights)[0]
        
        # Generate confidence based on how "clear" the image appears
        base_confidence = 0.6 + (features["brightness"] / 255.0) * 0.3
        confidence = min(0.95, max(0.5, base_confidence + random.uniform(-0.1, 0.1)))
        
        # Get triage level
        triage_level = self.triage_mapping[selected_injury]
        
        # Generate mock probabilities for all classes
        probabilities = np.zeros(10)
        selected_index = list(self.class_labels.values()).index(selected_injury)
        probabilities[selected_index] = confidence
        
        # Distribute remaining probability
        remaining_prob = 1.0 - confidence
        for i in range(10):
            if i != selected_index:
                probabilities[i] = remaining_prob / 9 * random.uniform(0.5, 1.5)
        
        # Normalize probabilities
        probabilities = probabilities / np.sum(probabilities)
        
        # Generate detailed analysis
        analysis = self.generate_analysis(selected_injury, confidence, probabilities)
        
        return {
            "success": True,
            "injury_type": selected_injury,
            "triage_level": triage_level,
            "confidence": float(confidence),
            "class_probabilities": {
                self.class_labels[i]: float(prob) for i, prob in enumerate(probabilities)
            },
            "analysis": analysis,
            "recommendations": self.get_recommendations(selected_injury, triage_level),
            "image_features": features
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

# Initialize global classifier
injury_classifier = SimpleInjuryClassifier()
print("Simple Injury Classifier initialized (Mock CNN)")
