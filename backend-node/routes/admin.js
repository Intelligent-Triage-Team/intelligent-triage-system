const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");
router.put("/admin/user/:id/role", authenticateToken, authorizeRole("admin"), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const sql = "UPDATE users SET role = ? WHERE id = ?";

  db.query(sql, [role, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error updating role" });
    }

    res.json({ message: "Role updated successfully" });
  });
});
router.post("/admin/create-doctor", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const { name, email, password, specialization, available_from, available_to } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await db.promise().query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'doctor')",
      [name, email, hashedPassword]
    );

    const userId = userResult.insertId;

    await db.promise().query(
      `INSERT INTO doctors (user_id, specialization, available_from, available_to)
       VALUES (?, ?, ?, ?)`,
      [userId, specialization, available_from, available_to]
    );

    res.json({ message: "Doctor created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating doctor" });
  }
});
router.put("/admin/doctor/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const doctorId = req.params.id;

  const {
    name,
    email,
    specialization,
    available_from,
    available_to
  } = req.body;

  try {
    await db.promise().query(
      "UPDATE users SET name = ?, email = ? WHERE id = (SELECT user_id FROM doctors WHERE id = ?)",
      [name, email, doctorId]
    );

    await db.promise().query(
      "UPDATE doctors SET specialization = ?, available_from = ?, available_to = ? WHERE id = ?",
      [specialization, available_from, available_to, doctorId]
    );

    res.json({ message: "Doctor updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
});
router.get("/admin/users", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
 const [rows] = await db.promise().query(`
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  d.id AS doctor_id
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id

ORDER BY
  CASE
    WHEN u.role = 'admin' THEN 1
    WHEN u.role = 'doctor' THEN 2
    WHEN u.role = 'patient' THEN 3
    ELSE 4
  END,
  u.name ASC
`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/admin/doctor/:id", authenticateToken,
  authorizeRole("admin"), async (req, res) => {
  const doctorId = req.params.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT 
        u.name, 
        u.email,
        d.specialization,
        d.available_from,
        d.available_to
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?`,
      [doctorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.delete(
  "/admin/user/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const userId = req.params.id;

    try {
      // 1. Get patient
      const [patientRows] = await db.promise().query(
        "SELECT id FROM patients WHERE user_id = ?",
        [userId]
      );

      if (patientRows.length > 0) {
        const patientId = patientRows[0].id;

        // 2. Get all triage IDs
        const [triageRows] = await db.promise().query(
          "SELECT id FROM triage_results WHERE patient_id = ?",
          [patientId]
        );

        const triageIds = triageRows.map(t => t.id);

        // 3. Delete appointments linked to triage_ids
        if (triageIds.length > 0) {
          await db.promise().query(
            `DELETE FROM appointments WHERE triage_id IN (?)`,
            [triageIds]
          );
        }

        // 4. Delete appointments linked to patient
        await db.promise().query(
          "DELETE FROM appointments WHERE patient_id = ?",
          [patientId]
        );

        // 5. Delete triage results
        await db.promise().query(
          "DELETE FROM triage_results WHERE patient_id = ?",
          [patientId]
        );

        // 6. Delete patient
        await db.promise().query(
          "DELETE FROM patients WHERE id = ?",
          [patientId]
        );
      }

      // 7. Delete user
      const [result] = await db.promise().query(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);
router.get("/admin/stats", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {

    const [users] = await db.promise().query("SELECT COUNT(*) AS total FROM users");
    const [patients] = await db.promise().query("SELECT COUNT(*) AS total FROM patients");
    const [doctors] = await db.promise().query("SELECT COUNT(*) AS total FROM doctors");
    const [appointments] = await db.promise().query("SELECT COUNT(*) AS total FROM appointments");

    const [emergency] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM triage_results WHERE severity = 'emergency'"
    );

    const [urgent] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM triage_results WHERE severity = 'urgent'"
    );

    const [normal] = await db.promise().query(
      "SELECT COUNT(*) AS total FROM triage_results WHERE severity = 'normal'"
    );
const [predictions] = await db.promise().query(
  "SELECT COUNT(*) AS total FROM triage_results"
);
const [waiting] = await db.promise().query(`
SELECT COUNT(*) AS total
FROM triage_results t
LEFT JOIN appointments a ON a.triage_id = t.id
WHERE t.status != 'completed'
AND a.id IS NULL
`);

const [scheduled] = await db.promise().query(
  "SELECT COUNT(*) AS total FROM appointments WHERE status = 'scheduled'"
);

const [completed] = await db.promise().query(
  "SELECT COUNT(*) AS total FROM triage_results WHERE status = 'completed'"
);
    res.json({
      total_users: users[0].total,
      total_patients: patients[0].total,
      total_doctors: doctors[0].total,
      total_appointments: appointments[0].total,
      emergency_cases: emergency[0].total,
      urgent_cases: urgent[0].total,
      normal_cases: normal[0].total,
      total_predictions: predictions[0].total,
      waiting_cases: waiting[0].total,
scheduled_cases: scheduled[0].total,
completed_cases: completed[0].total,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/admin/doctors-availability", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        d.id,
        u.name,
        d.specialization,
        d.available_from,
        d.available_to
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY u.name ASC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/admin/doctor-workload", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
  d.id,
  u.name,
  d.specialization,
  COUNT(a.id) AS total_appointments
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN appointments a
  ON a.doctor_id = d.id
  AND a.status = 'scheduled'
GROUP BY d.id
ORDER BY total_appointments DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/admin/emergency-list", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        t.id,
        u.name AS patient_name,
        t.predicted_disease,
        t.status,
        t.created_at
      FROM triage_results t
      JOIN patients p ON t.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE t.severity = 'emergency'
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;