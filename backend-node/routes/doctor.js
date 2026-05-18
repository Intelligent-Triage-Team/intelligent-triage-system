const express = require("express");
const router = express.Router();
const db = require("../database/db");
const authenticateToken = require("../middleware/auth");

router.get("/doctor/:id/availability", (req, res) => {

  const doctorId = req.params.id;

  const sql = "SELECT available_from, available_to FROM doctors WHERE id = ?";

  db.query(sql, [doctorId], (err, result) => {

    if (err) {
      return res.status(500).json({ error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      doctor_id: doctorId,
      available_from: result[0].available_from,
      available_to: result[0].available_to
    });

  });

});
router.get("/doctor/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `SELECT 
        d.id,
        d.available_from,
        d.available_to
      FROM doctors d
      WHERE d.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctor data" });
  }
});
router.put("/doctor/update-availability", authenticateToken, async (req, res) => {
  const { available_from, available_to } = req.body;

  try {
    const userId = req.user.id;

    await db.promise().query(
      `UPDATE doctors 
       SET available_from = ?, available_to = ?
       WHERE user_id = ?`,
      [available_from, available_to, userId]
    );

    res.json({ message: "Availability updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});
router.put("/triage/:id/complete", authenticateToken, async (req, res) => {

  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Access denied. Doctor only." });
  }

  try {
    const triageId = req.params.id;
    const userId = req.user.id;

    // 1️⃣ Get doctor_id from logged-in user
    const [doctorRows] = await db.promise().query(
      "SELECT id FROM doctors WHERE user_id = ?",
      [userId]
    );

    if (doctorRows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctorId = doctorRows[0].id;

    // 2️⃣ Check if this triage belongs to this doctor via appointments
    const [check] = await db.promise().query(
      `SELECT * FROM appointments 
       WHERE triage_id = ? AND doctor_id = ?`,
      [triageId, doctorId]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: "Not your patient" });
    }

    // 3️⃣ Safe to update
    await db.promise().query(
      `UPDATE triage_results SET status = 'completed' WHERE id = ?`,
      [triageId]
    );

    await db.promise().query(
      `UPDATE appointments SET status = 'completed' WHERE triage_id = ?`,
      [triageId]
    );

    res.json({ message: "Case completed successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating case" });
  }
});
router.put("/patient/:id/medical", authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;

    const {
      blood_group,
      weight,
      height,
      allergies,
      chronic_disease,
      emergency_contact
    } = req.body;

    // update main table
    await db.promise().query(
      `
      UPDATE patients
      SET blood_group = ?,
          weight = ?,
          height = ?,
          allergies = ?,
          chronic_disease = ?,
          emergency_contact = ?
      WHERE id = ?
      `,
      [
        blood_group,
        weight,
        height,
        allergies,
        chronic_disease,
        emergency_contact,
        patientId
      ]
    );

    // add history row
    await db.promise().query(
      `
      INSERT INTO patient_profile_history
      (patient_id, blood_group, weight, height, allergies, chronic_disease, emergency_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        patientId,
        blood_group,
        weight,
        height,
        allergies,
        chronic_disease,
        emergency_contact
      ]
    );

    res.json({ message: "Medical info updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;