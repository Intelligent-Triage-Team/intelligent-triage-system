const express = require("express");
const db = require("./database/db");
const cors = require("cors");
const axios = require("axios");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mysecretkey";

const app = express();
// import nodemailer from "nodemailer";
// import crypto from "crypto";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend server running" });
});

// app.get("/triage-queue",(req, res) => {
  app.get("/triage-queue", authenticateToken, (req, res) => {
  // app.get("/triage-queue", authenticateToken, (req, res) => {

  const sql = `
    SELECT 
      t.id AS triage_id,
      u.name AS patient_name,
      t.predicted_disease,
      t.severity,
      t.prediction_confidence,
      t.created_at
    FROM triage_results t
    JOIN patients p ON t.patient_id = p.id
    JOIN users u ON p.user_id = u.id
    ORDER BY
      FIELD(t.severity,'emergency','urgent','normal'),
      t.created_at DESC
  `;

  db.query(sql, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);

  });

});
app.post("/login", (req, res) => {

 const { email, password } = req.body;

 const sql = "SELECT * FROM users WHERE email = ?";

 db.query(sql, [email], async (err, results) => {

   if (err) return res.status(500).json(err);

   if (results.length === 0) {
     return res.status(401).json({ message: "User not found" });
   }

   const user = results[0];

   const validPassword = await bcrypt.compare(password, user.password);

   if (!validPassword) {
     return res.status(401).json({ message: "Invalid password" });
   }

   const token = jwt.sign(
     { id: user.id, role: user.role },
     SECRET_KEY,
     { expiresIn: "1h" }
   );

   res.json({
     message: "Login successful",
     token: token
   });

 });

});
app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const role = "patient";   // default role

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, hashedPassword, role], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json({ message: "User registered successfully" });

  });

});

/* CALL ML SERVICE */
app.post("/predict", async (req, res) => {
  // app.post("/predict", verifyToken, async (req, res) => {
  try {

    const { symptoms } = req.body;

    // Call ML service
    const mlResponse = await axios.post(
      "http://127.0.0.1:5000/predict",
      { symptoms }
    );

    const result = mlResponse.data;

    const predictedDisease = result.predicted_disease;
    const confidence = result.confidence;
    const severity = result.triage_level.toLowerCase();

    // For testing we use patient_id = 1
    // const patientId = 3;
    // Get user from token
// const userId = req.user.id;
// const userId = req.user?.id;

// // Get patient linked to this user
// const [patient] = await db.promise().query(
//   "SELECT id FROM patients WHERE user_id = ?",
//   [userId]
// );

// if (patient.length === 0) {
//   return res.status(404).json({ message: "Patient not found" });
// }

// const patientId = patient[0].id;
const patientId = 3;

    const sql = `
      INSERT INTO triage_results 
      (patient_id, predicted_disease, severity, prediction_confidence)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [patientId, predictedDisease, severity, confidence],
      (err, dbResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database insert failed" });
        }

res.json({
  message: "Prediction saved successfully",
  prediction: result,
  triage_id: dbResult.insertId
});
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "ML service error" });
  }
});
app.post("/appointments", (req, res) => {

  const { patient_id, doctor_id, triage_id, appointment_date } = req.body;

  const sql = `
    INSERT INTO appointments
    (patient_id, doctor_id, triage_id, appointment_date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [patient_id, doctor_id, triage_id, appointment_date], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Appointment creation failed" });
    }

    res.json({
      message: "Appointment scheduled successfully",
      appointment_id: result.insertId
    });

  });

});
app.post("/auto-schedule", async (req, res) => {
  // app.post("/auto-schedule", authenticateToken, async (req, res) => {

  const { triage_id, patient_id } = req.body;
  

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

    // 3. Loop properly (this replaces your FOR LOOP)
   for (const doctor of doctors) {

  // let startTime = new Date(doctor.available_from);
  // let endTime = new Date(startTime);
  // endTime.setHours(endTime.getHours() + 8); // working hours
//   let startTime = new Date(doctor.available_from);
// let endTime = new Date(doctor.available_to);
const today = new Date().toISOString().split("T")[0];

let startTime = new Date(`${today} ${doctor.available_from}`);
let endTime = new Date(`${today} ${doctor.available_to}`);

  while (startTime < endTime) {

    let appointmentDate = new Date(startTime);

    // adjust by severity
if (severity === "emergency") {
  // immediate slot (no delay)
}

else if (severity === "urgent") {
  appointmentDate.setMinutes(appointmentDate.getMinutes() + 30);
}

else if (severity === "normal") {
  appointmentDate.setHours(appointmentDate.getHours() + 2);
}

    const [existing] = await db.promise().query(
      "SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ?",
      [doctor.id, appointmentDate]
    );

    if (existing.length === 0) {

      const [result] = await db.promise().query(
        `INSERT INTO appointments 
        (patient_id, doctor_id, triage_id, appointment_date, status)
        VALUES (?, ?, ?, ?, 'scheduled')`,
        [patient_id, doctor.id, triage_id, appointmentDate]
      );
const formattedTime = appointmentDate.toLocaleString();

return res.json({
  message: "Appointment scheduled automatically",
  appointment_id: result.insertId,
  doctor_id: doctor.id,
  appointment_time: formattedTime
});

    }

    // move to next 30 min slot
    startTime.setMinutes(startTime.getMinutes() + 30);
  }
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
app.get("/doctor/:id/availability", (req, res) => {

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
app.get("/patients/:id/history", verifyToken, (req, res) => {

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
function verifyToken(req, res, next) {

  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {

    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();

  });

}


function authenticateToken(req, res, next) {

  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {

    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();

  });

}
app.put("/admin/user/:id/role", (req, res) => {
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
app.get("/admin/users", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, name, email, role FROM users"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
// DELETE user (Admin)
app.delete("/admin/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
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
});
// Admin Stats API
app.get("/admin/stats", async (req, res) => {
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
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    );

    if (users.length === 0) {
      return res.json({ message: "User not found" });
    }

    const token = Math.random().toString(36).substring(2);

    await db.promise().query(
      "UPDATE users SET reset_token = ? WHERE email = ?",
      [token, email]
    );

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    res.json({
      message: "Reset link (copy and open)",
      resetLink: resetLink
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});
app.post("/reset-password/:token", async (req, res) => {
  
  const { token } = req.params;

  const { password } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE reset_token = ?",
      [token]
    );

    if (users.length === 0) {
      return res.json({ message: "Invalid token" });
    }

const hashedPassword = await bcrypt.hash(password, 10);

await db.promise().query(
  "UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?",
  [hashedPassword, token]
);

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});