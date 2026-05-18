const express = require("express");
const router = express.Router();
const db = require("../database/db");
const authenticateToken = require("../middleware/auth");
// const authenticateToken = require("../middleware/authenticateToken");
router.get("/my-result", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get patient ID
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patient[0].id;

    // 2. Get latest triage + appointment
    const [result] = await db.promise().query(
  `
  SELECT 
    t.predicted_disease,
    t.severity,
    t.prediction_confidence,
    a.id AS appointment_id,
    a.appointment_date,
    u2.name AS doctor_name
  FROM triage_results t
  LEFT JOIN appointments a ON t.id = a.triage_id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN users u2 ON d.user_id = u2.id
  WHERE t.patient_id = ?
  ORDER BY t.created_at DESC
  LIMIT 1
  `,
  [patientId]
);

    if (result.length === 0) {
      return res.json(null);
    }

    res.json(result[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/my-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patient[0].id;

    const [history] = await db.promise().query(
      `
      SELECT 
        t.predicted_disease,
        t.severity,
        t.prediction_confidence,
        t.created_at,
        a.id AS appointment_id,
        a.appointment_date,
        a.status AS appointment_status,
        u2.name AS doctor_name
      FROM triage_results t
      LEFT JOIN appointments a ON t.id = a.triage_id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN users u2 ON d.user_id = u2.id
      WHERE t.patient_id = ?
      ORDER BY t.created_at DESC
      `,
      [patientId]
    );

    res.json(history);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});
router.put("/appointments/:id/cancel", authenticateToken, async (req, res) => {
  const appointmentId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. get patient id
    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patient[0].id;

    // 2. check ownership
    const [appointment] = await db.promise().query(
      "SELECT * FROM appointments WHERE id = ? AND patient_id = ?",
      [appointmentId, patientId]
    );

    if (appointment.length === 0) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 3. cancel
    await db.promise().query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
      [appointmentId]
    );

    res.json({ message: "Appointment cancelled successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cancel failed" });
  }
});
router.get("/patient/:id/profile-history", authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;

    const [rows] = await db.promise().query(
      `
      SELECT *
      FROM patient_profile_history
      WHERE patient_id = ?
      ORDER BY updated_at DESC
      `,
      [patientId]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/patients/:id/history", authenticateToken, (req, res) => {

  const patientId = req.params.id;

  const sql = `
    SELECT 
      p.id AS patient_id,
      t.predicted_disease,
      t.severity,
      t.prediction_confidence,
      a.appointment_date
    FROM patients p
    LEFT JOIN triage_results t ON p.id = t.patient_id
    LEFT JOIN appointments a ON t.id = a.triage_id
    WHERE p.id = ?
  `;

  db.query(sql, [patientId], (err, results) => {

    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json(results);

  });

});
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `
      SELECT 
  users.name,
  users.email,
  users.role,
  patients.age,
  patients.gender,
  patients.blood_group,
  patients.weight,
  patients.height,
  patients.allergies,
  patients.chronic_disease,
  patients.dob,
  patients.emergency_contact
      FROM users
      LEFT JOIN patients ON patients.user_id = users.id
      WHERE users.id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      age,
      gender,
      blood_group,
      weight,
      height,
      allergies,
      chronic_disease,
      dob,
      emergency_contact
    } = req.body;

    // update users table
    await db.promise().query(
      "UPDATE users SET name = ? WHERE id = ?",
      [name, userId]
    );

    // get current patient data BEFORE update
    const [currentPatient] = await db.promise().query(
      "SELECT * FROM patients WHERE user_id = ?",
      [userId]
    );

    if (currentPatient.length > 0) {
      const p = currentPatient[0];

      await db.promise().query(
        `INSERT INTO patient_profile_history
        (patient_id, weight, height, blood_group, allergies, chronic_disease)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.weight,
          p.height,
          p.blood_group,
          p.allergies,
          p.chronic_disease
        ]
      );
    }

    // update patients table
    await db.promise().query(
      `UPDATE patients
       SET age = ?, gender = ?, blood_group = ?, weight = ?, height = ?,
           allergies = ?, chronic_disease = ?, dob = ?, emergency_contact = ?
       WHERE user_id = ?`,
      [
        age,
        gender,
        blood_group,
        weight,
        height,
        allergies,
        chronic_disease,
        dob,
        emergency_contact,
        userId
      ]
    );

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});
router.get("/profile-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [patient] = await db.promise().query(
      "SELECT id FROM patients WHERE user_id = ?",
      [userId]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientId = patient[0].id;

    const [history] = await db.promise().query(
      `SELECT *
       FROM patient_profile_history
       WHERE patient_id = ?
       ORDER BY updated_at DESC`,
      [patientId]
    );

    res.json(history);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load history" });
  }
});
module.exports = router;