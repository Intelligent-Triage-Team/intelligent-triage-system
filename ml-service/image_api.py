from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import tempfile
from werkzeug.utils import secure_filename
try:
    from image_classifier import injury_classifier
    print("Using TensorFlow-based CNN classifier")
except ImportError:
    from simple_image_classifier import injury_classifier
    print("Using simple mock classifier (TensorFlow not available)")
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "image-classification-api",
        "version": "1.0.0"
    })

@app.route('/classify-injury', methods=['POST'])
def classify_injury():
    """Classify injury from uploaded image"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({
                "error": "No image file provided",
                "message": "Please upload an image file"
            }), 400
        
        file = request.files['image']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                "error": "No file selected",
                "message": "Please select an image file"
            }), 400
        
        # Check file type
        if not allowed_file(file.filename):
            return jsonify({
                "error": "Invalid file type",
                "message": f"Allowed file types: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save uploaded file
        file.save(filepath)
        logger.info(f"Image saved: {filepath}")
        
        # Classify injury
        result = injury_classifier.predict_injury(filepath)
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
            logger.info(f"Cleaned up file: {filepath}")
        except Exception as e:
            logger.warning(f"Failed to cleanup file {filepath}: {e}")
        
        if result.get("error"):
            return jsonify({
                "error": result["error"],
                "message": "Failed to analyze image"
            }), 500
        
        # Format response for triage integration
        response = {
            "success": True,
            "injury_analysis": {
                "detected_injury": result["injury_type"],
                "confidence": result["confidence"],
                "triage_level": result["triage_level"],
                "severity_assessment": result["analysis"]["severity_assessment"],
                "recommendations": result["recommendations"]
            },
            "detailed_analysis": {
                "primary_injury": result["injury_type"],
                "confidence_level": result["confidence"],
                "class_probabilities": result["class_probabilities"],
                "alternative_possibilities": result["analysis"]["alternative_possibilities"]
            },
            "medical_guidance": {
                "immediate_actions": result["recommendations"][:3],  # First 3 recommendations
                "follow_up_care": result["recommendations"][3:] if len(result["recommendations"]) > 3 else [],
                "emergency_indicators": result["triage_level"] == "emergency"
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in classify_injury: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": "Failed to process image classification"
        }), 500

@app.route('/batch-classify', methods=['POST'])
def batch_classify():
    """Classify multiple images (for training/validation)"""
    try:
        if 'images' not in request.files:
            return jsonify({"error": "No images provided"}), 400
        
        files = request.files.getlist('images')
        results = []
        
        for file in files:
            if file and allowed_file(file.filename):
                # Generate unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                
                # Save and classify
                file.save(filepath)
                result = injury_classifier.predict_injury(filepath)
                
                # Clean up
                os.remove(filepath)
                
                results.append({
                    "filename": file.filename,
                    "result": result
                })
        
        return jsonify({
            "success": True,
            "processed": len(results),
            "results": results
        })
        
    except Exception as e:
        logger.error(f"Error in batch_classify: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        "model_type": "Convolutional Neural Network",
        "input_shape": [224, 224, 3],
        "num_classes": 10,
        "classes": list(injury_classifier.class_labels.values()),
        "supported_formats": list(ALLOWED_EXTENSIONS),
        "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB"
    })

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        "error": "File too large",
        "message": f"Maximum file size is {MAX_FILE_SIZE // (1024*1024)}MB"
    }), 413

@app.errorhandler(404)
def not_found(e):
    """Handle not found error"""
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist"
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error"""
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

if __name__ == '__main__':
    # Initialize the classifier
    injury_classifier.build_model()
    
    # Try to load pre-trained weights
    injury_classifier.load_model()
    
    print("Image Classification API starting...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Allowed extensions: {ALLOWED_EXTENSIONS}")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
