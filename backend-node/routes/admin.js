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
router.post("/admin/create-staff", authenticateToken, authorizeRole("admin"), async (req, res) => {
  const { name, email, password, role, specialization, available_from, available_to } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const targetRole = role || 'doctor';

    const [userResult] = await db.promise().query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, targetRole]
    );

    const userId = userResult.insertId;

    if (targetRole === 'doctor') {
      await db.promise().query(
        `INSERT INTO doctors (user_id, specialization, available_from, available_to)
         VALUES (?, ?, ?, ?)`,
        [userId, specialization || 'General', available_from || '08:00:00', available_to || '17:00:00']
      );
    }

    res.json({ message: `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} created successfully` });

  } catch (error) {
    console.error("Staff creation error:", error);
    res.status(500).json({ message: "Error creating staff member", error: error.message });
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
        d.id AS doctor_id,
        d.available_from,
        d.available_to,
        (SELECT COUNT(*) FROM appointments a 
         WHERE a.doctor_id = d.id 
         AND a.status IN ('scheduled', 'pending') 
         AND DATE(a.appointment_date) = CURDATE()
        ) AS active_cases
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      ORDER BY u.role, u.name
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

    res.json({
      total_users: users[0].total,
      total_patients: patients[0].total,
      total_doctors: doctors[0].total,
      total_appointments: appointments[0].total,
      emergency_cases: emergency[0].total,
      urgent_cases: urgent[0].total,
      normal_cases: normal[0].total
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
module.exports = router;