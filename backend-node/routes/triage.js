const express = require("express");
const router = express.Router();
const db = require("../database/db");
const axios = require("axios");
const authenticateToken = require("../middleware/auth");
const nodemailer = require("nodemailer");
router.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: "abebenega23@gmail.com",
      to: "abebenega23@gmail.com", // send to yourself
      subject: "Test Email",
      text: "Your email system is working!"
    });

    res.send("Email sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Email failed");
  }
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "abebenega23@gmail.com",   // your email
    pass: "saws ixdi iljr kvtm"         // app password (no spaces)
  }
});
router.get("/triage-queue", authenticateToken, async (req, res) => {
  try {

    const [doctor] = await db.promise().query(
      "SELECT id FROM doctors WHERE user_id = ?",
      [req.user.id]
    );

    if (doctor.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctorId = doctor[0].id;

    const sql = `
      SELECT  
  t.id AS triage_id,
  p.id AS patient_id,
  u.name AS patient_name,
        t.predicted_disease,
        t.status,
        t.severity,
        t.prediction_confidence,
        t.created_at,
        a.id AS appointment_id,
        a.doctor_id,
        a.status AS appointment_status
      FROM triage_results t
      JOIN patients p ON t.patient_id = p.id
      JOIN users u ON p.user_id = u.id
  LEFT JOIN appointments a ON t.id = a.triage_id
      WHERE t.status != 'completed'
AND (a.doctor_id = ? OR a.doctor_id IS NULL)
AND (a.status = 'scheduled' OR a.status IS NULL)
      ORDER BY
        FIELD(t.severity,'emergency','urgent','normal'),
        t.created_at DESC
    `;

    db.query(sql, [doctorId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json(results);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/patient/:id/profile", authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;

    const [rows] = await db.promise().query(
  `
  SELECT 
    p.id AS patient_id,
    u.name,
    u.email,
    p.age,
    p.gender,
    p.blood_group,
    p.weight,
    p.height,
    p.allergies,
    p.chronic_disease,
    p.emergency_contact
  FROM patients p
  JOIN users u ON p.user_id = u.id
  WHERE p.id = ?
  `,
  [patientId]
);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/predict", authenticateToken, async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === "") {
      return res.status(400).json({
        message: "Please enter symptoms"
      });
    }

    const userId = req.user.id;

    // ✅ Get patient
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patient[0].id;

    // ✅ Check active appointment
    const [active] = await db.promise().query(
      `SELECT * FROM appointments 
       WHERE patient_id = ? AND status = 'scheduled'`,
      [patientId]
    );

    if (active.length > 0) {
      return res.status(400).json({
        message: "You already have an active appointment"
      });
    }

    // ✅ Call ML API
    const mlResponse = await axios.post(
      "http://127.0.0.1:5000/predict",
      { text: symptoms }
    );

    const result = mlResponse.data;

    const predictedDisease = result.predicted_disease;
    const confidence = result.confidence;
    const severity = result.triage_level.toLowerCase();

    // ✅ Insert triage
    const [dbResult] = await db.promise().query(
      `INSERT INTO triage_results 
      (patient_id, predicted_disease, severity, prediction_confidence, status)
      VALUES (?, ?, ?, ?, ?)`,
      [patientId, predictedDisease, severity, confidence, "pending"]
    );

    const triageId = dbResult.insertId;

    // ✅ Get doctors (smart ordering)
  const [doctors] = await db.promise().query(`
  SELECT 
    d.id,
    u.name AS doctor_name,   -- ✅ get name from users
    d.available_from,
    d.available_to,
    COUNT(a.id) AS total_cases
  FROM doctors d
  JOIN users u ON d.user_id = u.id   -- ✅ JOIN
  LEFT JOIN appointments a 
    ON d.id = a.doctor_id AND a.status = 'scheduled'
  GROUP BY d.id, u.name, d.available_from, d.available_to
  ORDER BY total_cases ASC
`);

    let scheduled = null;

    for (const doctor of doctors) {

      const today = new Date().toISOString().split("T")[0];

      let startTime = new Date(`${today}T${doctor.available_from}`);
let endTime = new Date(`${today}T${doctor.available_to}`);
      

      while (startTime < endTime) {

  // clone startTime FIRST
  let appointmentDate = new Date(startTime);

  // ✅ apply severity correctly
  if (severity === "emergency") {
    // no delay
  } 
  else if (severity === "urgent") {
    appointmentDate.setMinutes(appointmentDate.getMinutes() + 30);
  } 
  else if (severity === "normal") {
    appointmentDate.setHours(appointmentDate.getHours() + 2);
  }

  // ❗ IMPORTANT: check using adjusted time
  const [existing] = await db.promise().query(
    "SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ?",
    [doctor.id, appointmentDate]
  );

  if (existing.length === 0) {

    const [resultApp] = await db.promise().query(
      `INSERT INTO appointments 
       (patient_id, doctor_id, triage_id, appointment_date, status)
       VALUES (?, ?, ?, ?, 'scheduled')`,
      [patientId, doctor.id, triageId, appointmentDate]
    );

    scheduled = {
      appointment_id: resultApp.insertId,
      doctor_id: doctor.id,
      doctor_name: doctor.doctor_name, 
      appointment_time: appointmentDate
    };
    // console.log("SENDING EMAIL...");
    const [userResult] = await db.promise().query(
  "SELECT email FROM users WHERE id = ?",
  [req.user.id]
);

const patientEmail = userResult[0].email;
await transporter.sendMail({
  from: '"Patient Triage System" <abebenega23@gmail.com>',
  to: patientEmail,
  subject: "Appointment Confirmation - Patient Triage System",
  html: `
    <div style="font-family: Arial; padding: 20px; background-color: #f4f4f4;">
      
      <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
        
        <h2 style="color: #2e7d32;">Appointment Confirmed ✅</h2>
        
        <p>Hello,</p>
        
        <p>Your appointment has been successfully scheduled.</p>
        
        <div style="background: #f1f8e9; padding: 10px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Doctor:</strong> ${doctor.doctor_name}</p>
          <p><strong>Date & Time:</strong> ${appointmentDate}</p>
        </div>
        
        <p>Please arrive on time.</p>
        
        <p style="margin-top: 20px;">Thank you,<br/>Patient Triage System</p>
      
      </div>
    
    </div>
  `
});
// console.log("EMAIL SENT");
    break;
  }

  // ✅ move base time forward
  startTime.setMinutes(startTime.getMinutes() + 30);
}

      if (scheduled) break;
    }
// ✅ SAVE NOTIFICATION
await db.promise().query(
  `INSERT INTO notifications (user_id, message)
   VALUES (?, ?)`,
  [userId, "Your appointment has been successfully scheduled!"]
);
    // ✅ FINAL RESPONSE
    res.json({
  message: "Prediction + Auto scheduled",
  prediction: result,
  triage_id: triageId,
  appointment: scheduled,
  notification: "✅ Your appointment has been successfully scheduled!"
});

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "ML or Server error"
    });
  }
});
router.post("/auto-schedule", authenticateToken, async (req, res) => {

  // const { triage_id, patient_id } = req.body;
  const { triage_id } = req.body;

const userId = req.user.id;

const [patient] = await db.promise().query(
  "SELECT id FROM patients WHERE user_id = ?",
  [userId]
);

if (patient.length === 0) {
  return res.status(404).json({ message: "Patient not found" });
}

const patient_id = patient[0].id;

  try {
// Check if already scheduled
const [existingAppointment] = await db.promise().query(
  "SELECT * FROM appointments WHERE patient_id = ? AND triage_id = ?",
  [patient_id, triage_id]
);

if (existingAppointment.length > 0) {
  return res.status(400).json({
    message: "Appointment already exists for this patient and triage"
  });
}
    // 1. Get severity
    const [triageResult] = await db.promise().query(
      "SELECT severity FROM triage_results WHERE id = ?",
      [triage_id]
    );

    if (triageResult.length === 0) {
      return res.status(404).json({ message: "Triage not found" });
    }

    const severity = triageResult[0].severity;

    // 2. Get doctors
  const [doctors] = await db.promise().query(
  "SELECT id, available_from, available_to FROM doctors ORDER BY available_from ASC"
);

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctors available" });
    }
    // 6. If no doctor available
    res.status(404).json({
      message: "No available time slots for any doctor"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

});
module.exports = router;