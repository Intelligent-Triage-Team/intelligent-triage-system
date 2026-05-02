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
        u.name AS patient_name,
        t.predicted_disease,
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
      WHERE (a.doctor_id = ? OR a.doctor_id IS NULL)
      AND (a.status = 'scheduled' OR a.status IS NULL)
      AND (t.status = 'pending' OR t.status IS NULL)
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

    // Call ML API
    const mlResponse = await axios.post(
      "http://127.0.0.1:5000/predict",
      { text: symptoms }
    );

    const result = mlResponse.data;

    // Check if ML service returned an error
    if (result.error) {
      return res.status(400).json({
        message: result.error
      });
    }

    const predictedDisease = result.predicted_disease;
    const confidence = result.confidence;
    const severity = result.triage_level ? result.triage_level.toLowerCase() : 'normal';

    // Insert triage
    const [dbResult] = await db.promise().query(
      `INSERT INTO triage_results 
      (patient_id, predicted_disease, severity, prediction_confidence)
      VALUES (?, ?, ?, ?)`,
      [patientId, predictedDisease, severity, confidence]
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
  const { triage_id } = req.body;

  try {
    // 1. Get triage result and patient info
    const [triageResults] = await db.promise().query(
      "SELECT patient_id, severity FROM triage_results WHERE id = ?",
      [triage_id]
    );

    if (triageResults.length === 0) {
      return res.status(404).json({ message: "Triage results not found" });
    }

    const { patient_id, severity } = triageResults[0];

    // 2. Check if already scheduled
    const [existingAppointment] = await db.promise().query(
      "SELECT * FROM appointments WHERE triage_id = ? AND status = 'scheduled'",
      [triage_id]
    );

    if (existingAppointment.length > 0) {
      return res.status(400).json({
        message: "Appointment already exists for this triage"
      });
    }

    // 3. Get all doctors and their availability
    const [doctors] = await db.promise().query(`
      SELECT 
        d.id,
        u.name AS doctor_name,
        d.available_from,
        d.available_to,
        COUNT(a.id) AS total_cases
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN appointments a ON d.id = a.doctor_id AND a.status = 'scheduled'
      GROUP BY d.id, u.name, d.available_from, d.available_to
      ORDER BY total_cases ASC
    `);

    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctors available" });
    }

    let scheduledAppointment = null;
    const today = new Date().toISOString().split("T")[0];

    // 4. Try to find a slot for each doctor (starting with the least busy)
    for (const doctor of doctors) {
      let startTime = new Date(`${today}T${doctor.available_from}`);
      let endTime = new Date(`${today}T${doctor.available_to}`);
      
      // Slot finding logic
      while (startTime < endTime) {
        let appointmentDate = new Date(startTime);

        // Adjust based on severity (mimicking predict route logic)
        if (severity === "urgent") {
          appointmentDate.setMinutes(appointmentDate.getMinutes() + 30);
        } else if (severity === "normal") {
          appointmentDate.setHours(appointmentDate.getHours() + 2);
        }

        const [existing] = await db.promise().query(
          "SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ?",
          [doctor.id, appointmentDate]
        );

        if (existing.length === 0) {
          const [resultApp] = await db.promise().query(
            `INSERT INTO appointments 
             (patient_id, doctor_id, triage_id, appointment_date, status)
             VALUES (?, ?, ?, ?, 'scheduled')`,
            [patient_id, doctor.id, triage_id, appointmentDate, 'scheduled']
          );

          scheduledAppointment = {
            appointment_id: resultApp.insertId,
            doctor_id: doctor.id,
            doctor_name: doctor.doctor_name,
            appointment_time: appointmentDate
          };

          // Send confirmation email to patient
          const [patientUser] = await db.promise().query(
            "SELECT u.email FROM users u JOIN patients p ON u.id = p.user_id WHERE p.id = ?",
            [patient_id]
          );

          if (patientUser.length > 0) {
            await transporter.sendMail({
              from: '"Patient Triage System" <abebenega23@gmail.com>',
              to: patientUser[0].email,
              subject: "Appointment Scheduled by Doctor",
              html: `<p>An appointment has been scheduled for you with <b>Dr. ${doctor.doctor_name}</b> at ${appointmentDate}.</p>`
            }).catch(e => console.error("Email error:", e));
          }

          break;
        }
        startTime.setMinutes(startTime.getMinutes() + 30);
      }
      if (scheduledAppointment) break;
    }

    if (!scheduledAppointment) {
      return res.status(404).json({ message: "No available time slots found for any doctor" });
    }

    res.json({
      message: "Appointment auto-scheduled successfully",
      appointment: scheduledAppointment
    });

  } catch (error) {
    console.error("Auto-schedule error:", error);
    res.status(500).json({ error: "Server error during scheduling" });
  }
});
module.exports = router;