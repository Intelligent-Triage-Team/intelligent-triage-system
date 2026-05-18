const express = require("express");
const router = express.Router();
const db = require("../database/db");
router.post("/appointments", async (req, res) => {

  console.log("APPOINTMENT ROUTE CALLED");

  const { patient_id, doctor_id, triage_id, triage_level } = req.body;

  try {

    // ✅ GET TRIAGE TIME
    const [triage] = await db.promise().query(
      "SELECT created_at FROM triage_results WHERE id = ?",
      [triage_id]
    );

    if (!triage.length) {
      return res.status(404).json({ error: "Triage not found" });
    }

    // ✅ SAFE BASE TIME (NO setHours BUG)
    const baseTime = new Date(triage[0].created_at).getTime();

    // ✅ SMART SCHEDULING USING MILLISECONDS
    let appointment_date;

    if (triage_level.toLowerCase() === "emergency") {
      appointment_date = new Date(baseTime + 1 * 60 * 60 * 1000);
    } 
    else if (triage_level.toLowerCase() === "urgent") {
      appointment_date = new Date(baseTime + 6 * 60 * 60 * 1000);
    } 
    else {
      appointment_date = new Date(baseTime + 24 * 60 * 60 * 1000);
    }

    // ✅ CHECK EXISTING APPOINTMENT
    const [existing] = await db.promise().query(
      "SELECT * FROM appointments WHERE triage_id = ?",
      [triage_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Appointment already exists"
      });
    }

    // ✅ INSERT SAFE MYSQL FORMAT
    const formattedDate =
    appointment_date.getFullYear() + "-" +
    String(appointment_date.getMonth() + 1).padStart(2, "0") + "-" +
    String(appointment_date.getDate()).padStart(2, "0") + " " +
    String(appointment_date.getHours()).padStart(2, "0") + ":" +
    String(appointment_date.getMinutes()).padStart(2, "0") + ":" +
    String(appointment_date.getSeconds()).padStart(2, "0");
    console.log("TRIAGE TIME:", triage[0].created_at);
console.log("APPOINTMENT TIME:", formattedDate);
      const [result] = await db.promise().query(
        `INSERT INTO appointments
        (patient_id, doctor_id, triage_id, appointment_date)
        VALUES (?, ?, ?, ?)`,
        [
          patient_id,
          doctor_id,
          triage_id,
          formattedDate
        ]
      );

    res.json({
      message: "Appointment scheduled successfully",
      appointment_id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Appointment creation failed" });
  }

});

module.exports = router;