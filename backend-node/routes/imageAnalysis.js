const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const authenticateToken = require("../middleware/auth");
const db = require("../database/db");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, BMP, and TIFF files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
  },
  fileFilter: fileFilter
});

// Image analysis endpoint
router.post("/analyze", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image file provided",
        message: "Please upload an image file for analysis"
      });
    }

    const userId = req.user.id;
    const imagePath = req.file.path;

    // Get patient information
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(imagePath);
      return res.status(404).json({
        error: "Patient record not found",
        message: "Please complete your profile first"
      });
    }

    const patientId = patient[0].id;

    try {
      // Call image classification API
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append("image", fs.createReadStream(imagePath));

      const response = await axios.post("http://127.0.0.1:5001/classify-injury", formData, {
        headers: {
          ...formData.getHeaders(),
          // axios with native FormData handles boundaries automatically
          // but we might need to set it or just let axios do its thing
        },
        timeout: 60000, // Increase timeout to 60 seconds
      });

      const analysisResult = response.data;

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || "Image analysis failed");
      }

      // Save analysis result to database
      const [analysisRecord] = await db.promise().query(
        `INSERT INTO image_analyses 
         (patient_id, image_path, detected_injury, confidence, triage_level, 
          severity_assessment, recommendations, analysis_data, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          patientId,
          req.file.filename,
          analysisResult.injury_analysis.detected_injury,
          analysisResult.injury_analysis.confidence,
          analysisResult.injury_analysis.triage_level,
          analysisResult.injury_analysis.severity_assessment,
          JSON.stringify(analysisResult.injury_analysis.recommendations),
          JSON.stringify(analysisResult)
        ]
      );

      // Create triage result if injury detected
      if (analysisResult.injury_analysis.triage_level !== "normal") {
        await db.promise().query(
          `INSERT INTO triage_results 
           (patient_id, predicted_disease, severity, prediction_confidence, 
            image_analysis_id, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            patientId,
            analysisResult.injury_analysis.detected_injury,
            analysisResult.injury_analysis.triage_level,
            analysisResult.injury_analysis.confidence,
            analysisRecord.insertId
          ]
        );

        // Create appointment if urgent or emergency
        if (analysisResult.injury_analysis.triage_level === "urgent" || 
            analysisResult.injury_analysis.triage_level === "emergency") {
          
          // Get available doctor
          const [doctor] = await db.promise().query(
            "SELECT id FROM doctors ORDER BY RAND() LIMIT 1"
          );

          if (doctor.length > 0) {
            const appointmentTime = new Date();
            if (analysisResult.injury_analysis.triage_level === "emergency") {
              appointmentTime.setHours(appointmentTime.getHours() + 1); // 1 hour for emergency
            } else {
              appointmentTime.setDate(appointmentTime.getDate() + 1); // Next day for urgent
            }

            await db.promise().query(
              `INSERT INTO appointments 
               (patient_id, doctor_id, appointment_date, status, triage_id, created_at)
               VALUES (?, ?, ?, 'scheduled', ?, NOW())`,
              [patientId, doctor[0].id, appointmentTime, analysisRecord.insertId]
            );
          }
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(imagePath);

      res.json({
        success: true,
        analysis: {
          id: analysisRecord.insertId,
          detected_injury: analysisResult.injury_analysis.detected_injury,
          confidence: analysisResult.injury_analysis.confidence,
          triage_level: analysisResult.injury_analysis.triage_level,
          severity_assessment: analysisResult.injury_analysis.severity_assessment,
          recommendations: analysisResult.injury_analysis.recommendations,
          medical_guidance: analysisResult.medical_guidance,
          detailed_analysis: analysisResult.detailed_analysis
        },
        message: "Image analysis completed successfully"
      });

    } catch (apiError) {
      // Clean up uploaded file on API error
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      console.error("Image API Error:", apiError.message);
      return res.status(500).json({
        error: "Image analysis service unavailable",
        message: "Unable to process image at this time. Please try again later."
      });
    }

  } catch (error) {
    console.error("Image Analysis Error:", error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Analysis failed",
      message: error.message || "An error occurred during image analysis"
    });
  }
});

// Get patient's image analysis history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get patient information
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({
        error: "Patient record not found"
      });
    }

    const [analyses] = await db.promise().query(
      `SELECT id, detected_injury, confidence, triage_level, 
              severity_assessment, created_at
       FROM image_analyses 
       WHERE patient_id = ? 
       ORDER BY created_at DESC`,
      [patient[0].id]
    );

    res.json({
      success: true,
      analyses: analyses
    });

  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({
      error: "Failed to retrieve analysis history",
      message: error.message
    });
  }
});

// Get specific analysis details
router.get("/:analysisId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = req.params.analysisId;

    // Get patient information
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({
        error: "Patient record not found"
      });
    }

    // Get analysis details
    const [analysis] = await db.promise().query(
      `SELECT * FROM image_analyses 
       WHERE id = ? AND patient_id = ?`,
      [analysisId, patient[0].id]
    );

    if (analysis.length === 0) {
      return res.status(404).json({
        error: "Analysis not found"
      });
    }

    const analysisData = analysis[0];
    analysisData.recommendations = JSON.parse(analysisData.recommendations || "[]");
    analysisData.analysis_data = JSON.parse(analysisData.analysis_data || "{}");

    res.json({
      success: true,
      analysis: analysisData
    });

  } catch (error) {
    console.error("Analysis Details Error:", error);
    res.status(500).json({
      error: "Failed to retrieve analysis details",
      message: error.message
    });
  }
});

// Delete analysis
router.delete("/:analysisId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = req.params.analysisId;

    // Get patient information
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({
        error: "Patient record not found"
      });
    }

    // Delete analysis
    const [result] = await db.promise().query(
      "DELETE FROM image_analyses WHERE id = ? AND patient_id = ?",
      [analysisId, patient[0].id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Analysis not found"
      });
    }

    res.json({
      success: true,
      message: "Analysis deleted successfully"
    });

  } catch (error) {
    console.error("Delete Analysis Error:", error);
    res.status(500).json({
      error: "Failed to delete analysis",
      message: error.message
    });
  }
});

module.exports = router;
