const express = require("express");
const router = express.Router();
const db = require("../database/db");
router.post("/appointments", async (req, res) => {

  const { patient_id, doctor_id, triage_id, appointment_date } = req.body;

  try {
  
    const [existing] = await db.promise().query(
      "SELECT * FROM appointments WHERE triage_id = ?",
      [triage_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Appointment already exists"
      });
    }

    // ✅ INSERT
    const [result] = await db.promise().query(
      `INSERT INTO appointments
      (patient_id, doctor_id, triage_id, appointment_date)
      VALUES (?, ?, ?, ?)`,
      [patient_id, doctor_id, triage_id, appointment_date]
    );

res.json({
  message: "Appointment scheduled successfully",
  appointment_id: result.insertId,
  notification: "✅ Your appointment is confirmed. Please check your schedule."
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Appointment creation failed" });
  }

});

router.put("/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { appointment_date } = req.body;

  try {
    await db.promise().query(
      "UPDATE appointments SET appointment_date = ? WHERE id = ?",
      [appointment_date, id]
    );
    res.json({ message: "Appointment updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});
module.exports = router;