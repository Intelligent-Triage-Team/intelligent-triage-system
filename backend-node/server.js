const express = require("express");
const db = require("./database/db");
const cors = require("cors");
// const axios = require("axios");
// const auth = require("./middleware/auth");
// const authenticateToken = require("./middleware/auth");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// const SECRET_KEY = "mysecretkey";




const app = express();


// import nodemailer from "nodemailer";
// import crypto from "crypto";

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
const notificationRoutes = require("./routes/notification");
app.use("/", notificationRoutes);
const doctorRoutes = require("./routes/doctor");
app.use("/", doctorRoutes);
const appointmentRoutes = require("./routes/appointment");
app.use("/", appointmentRoutes);
const triageRoutes = require("./routes/triage");
app.use("/", triageRoutes);
const patientRoutes = require("./routes/patient");
app.use("/", patientRoutes);
const adminRoutes = require("./routes/admin");
app.use("/", adminRoutes);
const imageAnalysisRoutes = require("./routes/imageAnalysis");
app.use("/image-analysis", imageAnalysisRoutes);
const chatbotRoutes = require("./routes/chatbot");
app.use("/chatbot", chatbotRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Backend server running" });
});

// app.get("/triage-queue", authenticateToken, async (req, res) => {
//   try {

//     const [doctor] = await db.promise().query(
//       "SELECT id FROM doctors WHERE user_id = ?",
//       [req.user.id]
//     );

//     if (doctor.length === 0) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     const doctorId = doctor[0].id;

//     const sql = `
//       SELECT 
//         t.id AS triage_id,
//         u.name AS patient_name,
//         t.predicted_disease,
//         t.status,
//         t.severity,
//         t.prediction_confidence,
//         t.created_at,
//         a.id AS appointment_id,
//         a.doctor_id,
//         a.status AS appointment_status
//       FROM triage_results t
//       JOIN patients p ON t.patient_id = p.id
//       JOIN users u ON p.user_id = u.id
//   LEFT JOIN appointments a ON t.id = a.triage_id
//       WHERE t.status != 'completed'
// AND (a.doctor_id = ? OR a.doctor_id IS NULL)
// AND (a.status = 'scheduled' OR a.status IS NULL)
//       ORDER BY
//         FIELD(t.severity,'emergency','urgent','normal'),
//         t.created_at DESC
//     `;

//     db.query(sql, [doctorId], (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Database error" });
//       }

//       res.json(results);
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// app.put("/triage/:id/complete", async (req, res) => {
//   try {
//     const triageId = req.params.id;

//     // 1️⃣ update triage (optional)
//     await db.promise().query(
//       `UPDATE triage_results 
//        SET status = 'completed' 
//        WHERE id = ?`,
//       [triageId]
//     );

//     // 🔥 2️⃣ VERY IMPORTANT → update appointment
//     await db.promise().query(
//       `UPDATE appointments 
//        SET status = 'completed' 
//        WHERE triage_id = ?`,
//       [triageId]
//     );

//     res.json({ message: "Case completed successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating case" });
//   }
// });
// app.post("/login", (req, res) => {

//  const { email, password } = req.body;

//  const sql = "SELECT * FROM users WHERE email = ?";

//  db.query(sql, [email], async (err, results) => {

//    if (err) return res.status(500).json(err);

//    if (results.length === 0) {
//      return res.status(401).json({ message: "User not found" });
//    }

//    const user = results[0];

//    const validPassword = await bcrypt.compare(password, user.password);

//    if (!validPassword) {
//      return res.status(401).json({ message: "Invalid password" });
//    }

//    const token = jwt.sign(
//      { id: user.id, role: user.role },
//      SECRET_KEY,
//      { expiresIn: "1h" }
//    );

//    res.json({
//      message: "Login successful",
//      token: token
//    });

//  });

// });
// app.post("/signup", async (req, res) => {

//   const { name, email, password, age, gender } = req.body;

//   try {
//     // ✅ 1. CHECK IF EMAIL EXISTS
//     const [existing] = await db.promise().query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (existing.length > 0) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // ✅ 2. HASH PASSWORD
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const role = "patient";

//     // ✅ 3. INSERT USER
//     const [userResult] = await db.promise().query(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       [name, email, hashedPassword, role]
//     );

//     const userId = userResult.insertId;

//     // ✅ 4. INSERT PATIENT
//     await db.promise().query(
//       "INSERT INTO patients (user_id, age, gender) VALUES (?, ?, ?)",
//       [userId, age, gender]
//     );

//     res.json({ message: "User registered successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Signup failed" });
//   }

// });

/* CALL ML SERVICE */
// app.post("/predict", async (req, res) => {
// app.post("/predict", authenticateToken, async (req, res) => {
//   try {
//     const { symptoms } = req.body;

//     if (!symptoms || symptoms.trim() === "") {
//       return res.status(400).json({
//         message: "Please enter symptoms"
//       });
//     }

//     const userId = req.user.id;

//     // ✅ Get patient
//     const [patient] = await db.promise().query(
//       "SELECT id FROM patients WHERE user_id = ?",
//       [userId]
//     );

//     if (patient.length === 0) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     const patientId = patient[0].id;

//     // ✅ Check active appointment
//     const [active] = await db.promise().query(
//       `SELECT * FROM appointments 
//        WHERE patient_id = ? AND status = 'scheduled'`,
//       [patientId]
//     );

//     if (active.length > 0) {
//       return res.status(400).json({
//         message: "You already have an active appointment"
//       });
//     }

//     // ✅ Call ML API
//     const mlResponse = await axios.post(
//       "http://127.0.0.1:5000/predict",
//       { text: symptoms }
//     );

//     const result = mlResponse.data;

//     const predictedDisease = result.predicted_disease;
//     const confidence = result.confidence;
//     const severity = result.triage_level.toLowerCase();

//     // ✅ Insert triage
//     const [dbResult] = await db.promise().query(
//       `INSERT INTO triage_results 
//       (patient_id, predicted_disease, severity, prediction_confidence, status)
//       VALUES (?, ?, ?, ?, ?)`,
//       [patientId, predictedDisease, severity, confidence, "pending"]
//     );

//     const triageId = dbResult.insertId;

//     // ✅ Get doctors (smart ordering)
//   const [doctors] = await db.promise().query(`
//   SELECT 
//     d.id,
//     u.name AS doctor_name,   -- ✅ get name from users
//     d.available_from,
//     d.available_to,
//     COUNT(a.id) AS total_cases
//   FROM doctors d
//   JOIN users u ON d.user_id = u.id   -- ✅ JOIN
//   LEFT JOIN appointments a 
//     ON d.id = a.doctor_id AND a.status = 'scheduled'
//   GROUP BY d.id, u.name, d.available_from, d.available_to
//   ORDER BY total_cases ASC
// `);

//     let scheduled = null;

//     for (const doctor of doctors) {

//       const today = new Date().toISOString().split("T")[0];

//       let startTime = new Date(`${today}T${doctor.available_from}`);
// let endTime = new Date(`${today}T${doctor.available_to}`);


//       while (startTime < endTime) {

//   // clone startTime FIRST
//   let appointmentDate = new Date(startTime);

//   // ✅ apply severity correctly
//   if (severity === "emergency") {
//     // no delay
//   } 
//   else if (severity === "urgent") {
//     appointmentDate.setMinutes(appointmentDate.getMinutes() + 30);
//   } 
//   else if (severity === "normal") {
//     appointmentDate.setHours(appointmentDate.getHours() + 2);
//   }

//   // ❗ IMPORTANT: check using adjusted time
//   const [existing] = await db.promise().query(
//     "SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ?",
//     [doctor.id, appointmentDate]
//   );

//   if (existing.length === 0) {

//     const [resultApp] = await db.promise().query(
//       `INSERT INTO appointments 
//        (patient_id, doctor_id, triage_id, appointment_date, status)
//        VALUES (?, ?, ?, ?, 'scheduled')`,
//       [patientId, doctor.id, triageId, appointmentDate]
//     );

//     scheduled = {
//       appointment_id: resultApp.insertId,
//       doctor_id: doctor.id,
//       doctor_name: doctor.name, 
//       appointment_time: appointmentDate
//     };
//     // console.log("SENDING EMAIL...");
//     const [userResult] = await db.promise().query(
//   "SELECT email FROM users WHERE id = ?",
//   [req.user.id]
// );

// const patientEmail = userResult[0].email;
// await transporter.sendMail({
//   from: '"Patient Triage System" <abebenega23@gmail.com>',
//   to: patientEmail,
//   subject: "Appointment Confirmation - Patient Triage System",
//   html: `
//     <div style="font-family: Arial; padding: 20px; background-color: #f4f4f4;">

//       <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">

//         <h2 style="color: #2e7d32;">Appointment Confirmed ✅</h2>

//         <p>Hello,</p>

//         <p>Your appointment has been successfully scheduled.</p>

//         <div style="background: #f1f8e9; padding: 10px; border-radius: 5px; margin: 15px 0;">
//           <p><strong>Doctor:</strong> ${doctor.doctor_name}</p>
//           <p><strong>Date & Time:</strong> ${appointmentDate}</p>
//         </div>

//         <p>Please arrive on time.</p>

//         <p style="margin-top: 20px;">Thank you,<br/>Patient Triage System</p>

//       </div>

//     </div>
//   `
// });
// // console.log("EMAIL SENT");
//     break;
//   }

//   // ✅ move base time forward
//   startTime.setMinutes(startTime.getMinutes() + 30);
// }

//       if (scheduled) break;
//     }
// // ✅ SAVE NOTIFICATION
// await db.promise().query(
//   `INSERT INTO notifications (user_id, message)
//    VALUES (?, ?)`,
//   [userId, "Your appointment has been successfully scheduled!"]
// );
//     // ✅ FINAL RESPONSE
//     res.json({
//   message: "Prediction + Auto scheduled",
//   prediction: result,
//   triage_id: triageId,
//   appointment: scheduled,
//   notification: "✅ Your appointment has been successfully scheduled!"
// });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "ML or Server error"
//     });
//   }
// });
// app.post("/appointments", async (req, res) => {

//   const { patient_id, doctor_id, triage_id, appointment_date } = req.body;

//   try {
//     // ✅ CHECK if already scheduled
//     const [existing] = await db.promise().query(
//       "SELECT * FROM appointments WHERE triage_id = ?",
//       [triage_id]
//     );

//     if (existing.length > 0) {
//       return res.status(400).json({
//         message: "Appointment already exists"
//       });
//     }

//     // ✅ INSERT
//     const [result] = await db.promise().query(
//       `INSERT INTO appointments
//       (patient_id, doctor_id, triage_id, appointment_date)
//       VALUES (?, ?, ?, ?)`,
//       [patient_id, doctor_id, triage_id, appointment_date]
//     );

// res.json({
//   message: "Appointment scheduled successfully",
//   appointment_id: result.insertId,
//   notification: "✅ Your appointment is confirmed. Please check your schedule."
// });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Appointment creation failed" });
//   }

// });
// app.post("/auto-schedule", async (req, res) => {
//   app.post("/auto-schedule", authenticateToken, async (req, res) => {

//   // const { triage_id, patient_id } = req.body;
//   const { triage_id } = req.body;

// const userId = req.user.id;

// const [patient] = await db.promise().query(
//   "SELECT id FROM patients WHERE user_id = ?",
//   [userId]
// );

// if (patient.length === 0) {
//   return res.status(404).json({ message: "Patient not found" });
// }

// const patient_id = patient[0].id;

//   try {
// // Check if already scheduled
// const [existingAppointment] = await db.promise().query(
//   "SELECT * FROM appointments WHERE patient_id = ? AND triage_id = ?",
//   [patient_id, triage_id]
// );

// if (existingAppointment.length > 0) {
//   return res.status(400).json({
//     message: "Appointment already exists for this patient and triage"
//   });
// }
//     // 1. Get severity
//     const [triageResult] = await db.promise().query(
//       "SELECT severity FROM triage_results WHERE id = ?",
//       [triage_id]
//     );

//     if (triageResult.length === 0) {
//       return res.status(404).json({ message: "Triage not found" });
//     }

//     const severity = triageResult[0].severity;

//     // 2. Get doctors
//   const [doctors] = await db.promise().query(
//   "SELECT id, available_from, available_to FROM doctors ORDER BY available_from ASC"
// );

//     if (doctors.length === 0) {
//       return res.status(404).json({ message: "No doctors available" });
//     }
//     // 6. If no doctor available
//     res.status(404).json({
//       message: "No available time slots for any doctor"
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }

// });
// app.get("/doctor/:id/availability", (req, res) => {

//   const doctorId = req.params.id;

//   const sql = "SELECT available_from, available_to FROM doctors WHERE id = ?";

//   db.query(sql, [doctorId], (err, result) => {

//     if (err) {
//       return res.status(500).json({ error: err });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     res.json({
//       doctor_id: doctorId,
//       available_from: result[0].available_from,
//       available_to: result[0].available_to
//     });

//   });

// });
// app.post("/admin/create-doctor", async (req, res) => {
//   const { name, email, password, specialization, available_from, available_to } = req.body;

//   try {
//     // 1. hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 2. create user with role doctor
//     const [userResult] = await db.promise().query(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       [name, email, hashedPassword, "doctor"]
//     );

//     const userId = userResult.insertId;

//     // 3. create doctor profile
//     await db.promise().query(
//       `INSERT INTO doctors (user_id, specialization, available_from, available_to)
//        VALUES (?, ?, ?, ?)`,
//       [userId, specialization, available_from, available_to]
//     );

//     res.json({ message: "Doctor created successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating doctor" });
//   }
// });
// app.get("/patients/:id/history", verifyToken, (req, res) => {

//   const patientId = req.params.id;

//   const sql = `
//     SELECT 
//       p.id AS patient_id,
//       t.predicted_disease,
//       t.severity,
//       t.prediction_confidence,
//       a.appointment_date
//     FROM patients p
//     LEFT JOIN triage_results t ON p.id = t.patient_id
//     LEFT JOIN appointments a ON t.id = a.triage_id
//     WHERE p.id = ?
//   `;

//   db.query(sql, [patientId], (err, results) => {

//     if (err) {
//       return res.status(500).json({ error: err });
//     }

//     res.json(results);

//   });

// });
// function verifyToken(req, res, next) {

//   const token = req.headers["authorization"];

//   if (!token) {
//     return res.status(403).json({ message: "Token required" });
//   }

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {

//     if (err) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     req.user = decoded;
//     next();

//   });

// }


// function authenticateToken(req, res, next) {

//   const token = req.headers["authorization"];

//   if (!token) {
//     return res.status(401).json({ message: "Access denied. No token provided." });
//   }

//   jwt.verify(token, SECRET_KEY, (err, user) => {

//     if (err) {
//       return res.status(403).json({ message: "Invalid token" });
//     }

//     req.user = user;
//     next();

//   });

// }
// app.put("/admin/user/:id/role", (req, res) => {
//   const { id } = req.params;
//   const { role } = req.body;

//   const sql = "UPDATE users SET role = ? WHERE id = ?";

//   db.query(sql, [role, id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ message: "Error updating role" });
//     }

//     res.json({ message: "Role updated successfully" });
//   });
// });
// app.get("/admin/users", async (req, res) => {
//   try {
//     const [rows] = await db.promise().query(`
//   SELECT 
//     u.id,
//     u.name,
//     u.email,
//     u.role,
//     d.id AS doctor_id
//   FROM users u
//   LEFT JOIN doctors d ON u.id = d.user_id
// `);
//     res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });
// DELETE user (Admin)
// app.delete("/admin/user/:id", async (req, res) => {
//   const userId = req.params.id;

//   try {
//     const [result] = await db.promise().query(
//       "DELETE FROM users WHERE id = ?",
//       [userId]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "User deleted successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });
// Admin Stats API
// app.get("/admin/stats", async (req, res) => {
//   try {

//     const [users] = await db.promise().query("SELECT COUNT(*) AS total FROM users");
//     const [patients] = await db.promise().query("SELECT COUNT(*) AS total FROM patients");
//     const [doctors] = await db.promise().query("SELECT COUNT(*) AS total FROM doctors");
//     const [appointments] = await db.promise().query("SELECT COUNT(*) AS total FROM appointments");

//     const [emergency] = await db.promise().query(
//       "SELECT COUNT(*) AS total FROM triage_results WHERE severity = 'emergency'"
//     );

//     const [urgent] = await db.promise().query(
//       "SELECT COUNT(*) AS total FROM triage_results WHERE severity = 'urgent'"
//     );

//     const [normal] = await db.promise().query(
//       "SELECT COUNT(*) AS total FROM triage_results WHERE severity = 'normal'"
//     );

//     res.json({
//       total_users: users[0].total,
//       total_patients: patients[0].total,
//       total_doctors: doctors[0].total,
//       total_appointments: appointments[0].total,
//       emergency_cases: emergency[0].total,
//       urgent_cases: urgent[0].total,
//       normal_cases: normal[0].total
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });
// app.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const [users] = await db.promise().query(
//       "SELECT * FROM users WHERE email = ?", 
//       [email]
//     );

//     if (users.length === 0) {
//       return res.json({ message: "User not found" });
//     }

//     const token = Math.random().toString(36).substring(2);

//     await db.promise().query(
//       "UPDATE users SET reset_token = ? WHERE email = ?",
//       [token, email]
//     );

//     const resetLink = `http://localhost:5173/reset-password/${token}`;

//     res.json({
//       message: "Reset link (copy and open)",
//       resetLink: resetLink
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error" });
//   }
// });
// app.post("/reset-password/:token", async (req, res) => {

//   const { token } = req.params;

//   const { password } = req.body;

//   try {
//     const [users] = await db.promise().query(
//       "SELECT * FROM users WHERE reset_token = ?",
//       [token]
//     );

//     if (users.length === 0) {
//       return res.json({ message: "Invalid token" });
//     }

// const hashedPassword = await bcrypt.hash(password, 10);

// await db.promise().query(
//   "UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?",
//   [hashedPassword, token]
// );

//     res.json({ message: "Password reset successful" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.get("/my-result", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // 1. Get patient ID
//     const [patient] = await db.promise().query(
//       "SELECT id FROM patients WHERE user_id = ?",
//       [userId]
//     );

//     if (patient.length === 0) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     const patientId = patient[0].id;

//     // 2. Get latest triage + appointment
//     const [result] = await db.promise().query(
//   `
//   SELECT 
//     t.predicted_disease,
//     t.severity,
//     t.prediction_confidence,
//     a.id AS appointment_id,
//     a.appointment_date,
//     u2.name AS doctor_name
//   FROM triage_results t
//   LEFT JOIN appointments a ON t.id = a.triage_id
//   LEFT JOIN doctors d ON a.doctor_id = d.id
//   LEFT JOIN users u2 ON d.user_id = u2.id
//   WHERE t.patient_id = ?
//   ORDER BY t.created_at DESC
//   LIMIT 1
//   `,
//   [patientId]
// );

//     if (result.length === 0) {
//       return res.json(null);
//     }

//     res.json(result[0]);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.get("/my-history", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [patient] = await db.promise().query(
//       "SELECT id FROM patients WHERE user_id = ?",
//       [userId]
//     );

//     if (patient.length === 0) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     const patientId = patient[0].id;

//     const [history] = await db.promise().query(
//   `
//   SELECT 
//     t.predicted_disease,
//     t.severity,
//     t.prediction_confidence,
//     t.created_at,
//     a.id AS appointment_id,  
//     a.appointment_date,
//     a.status AS appointment_status,
//     u2.name AS doctor_name   -- ✅ THIS IS IMPORTANT
//   FROM triage_results t
//   LEFT JOIN appointments a ON t.id = a.triage_id
//   LEFT JOIN doctors d ON a.doctor_id = d.id
//   LEFT JOIN users u2 ON d.user_id = u2.id   -- ✅ ADD THIS JOIN
//   WHERE t.patient_id = ?
//   ORDER BY t.created_at DESC
//   `,
//   [patientId]
// );

//     res.json(history);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.put("/admin/doctor/:id", async (req, res) => {
//   const { id } = req.params;
//   const { available_from, available_to } = req.body;

//   try {
//     await db.promise().query(
//       "UPDATE doctors SET available_from = ?, available_to = ? WHERE id = ?",
//       [available_from, available_to, id]
//     );

//     res.json({ message: "Doctor availability updated" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating doctor" });
//   }
// });
// app.post("/admin/create-doctor", async (req, res) => {
//   const { name, email, password, specialization, available_from, available_to } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 1️⃣ Create user
//     const [userResult] = await db.promise().query(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'doctor')",
//       [name, email, hashedPassword]
//     );

//     const userId = userResult.insertId;

//     // 2️⃣ Create doctor (LINKED!)
//     await db.promise().query(
//       `INSERT INTO doctors (user_id, specialization, available_from, available_to)
//        VALUES (?, ?, ?, ?)`,
//       [userId, specialization, available_from, available_to]
//     );

//     res.json({ message: "Doctor created successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating doctor" });
//   }
// });
// app.get("/admin/doctor/:id", async (req, res) => {
//   const doctorId = req.params.id;

//   try {
//     const [rows] = await db.promise().query(
//       `SELECT 
//         u.name, 
//         u.email,
//         d.specialization,
//         d.available_from,
//         d.available_to
//       FROM doctors d
//       JOIN users u ON d.user_id = u.id
//       WHERE d.id = ?`,
//       [doctorId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     res.json(rows[0]);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.put("/admin/doctor/:id", async (req, res) => {
//   const doctorId = req.params.id;

//   const {
//     name,
//     email,
//     specialization,
//     available_from,
//     available_to
//   } = req.body;

//   try {
//     // 1️⃣ update users table
//     await db.promise().query(
//       "UPDATE users SET name = ?, email = ? WHERE id = (SELECT user_id FROM doctors WHERE id = ?)",
//       [name, email, doctorId]
//     );

//     // 2️⃣ update doctors table
//     await db.promise().query(
//       "UPDATE doctors SET specialization = ?, available_from = ?, available_to = ? WHERE id = ?",
//       [specialization, available_from, available_to, doctorId]
//     );

//     res.json({ message: "Doctor updated successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Update failed" });
//   }
// });
// app.put("/appointment/:id/cancel", authenticateToken, async (req, res) => {
//   const appointmentId = req.params.id;

//   try {
//     await db.promise().query(
//       "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
//       [appointmentId]
//     );

//     res.json({ message: "Appointment cancelled successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Cancel failed" });
//   }
// });
// app.get("/doctor/me", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [rows] = await db.promise().query(
//       `SELECT 
//         d.id,
//         d.available_from,
//         d.available_to
//       FROM doctors d
//       WHERE d.user_id = ?`,
//       [userId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     res.json(rows[0]);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching doctor data" });
//   }
// });
// app.put("/doctor/update-availability", authenticateToken, async (req, res) => {
//   const { available_from, available_to } = req.body;

//   try {
//     const userId = req.user.id;

//     await db.promise().query(
//       `UPDATE doctors 
//        SET available_from = ?, available_to = ?
//        WHERE user_id = ?`,
//       [available_from, available_to, userId]
//     );

//     res.json({ message: "Availability updated successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Update failed" });
//   }
// });
// app.get("/notifications", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [notifications] = await db.promise().query(
//       "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
//       [userId]
//     );

//     res.json(notifications);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch notifications" });
//   }
// });
// app.put("/notifications/read", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     await db.promise().query(
//       "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
//       [userId]
//     );

//     res.json({ message: "Notifications marked as read" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to update notifications" });
//   }
// });
// app.put("/notifications/read/:id", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const notifId = req.params.id;

//     await db.promise().query(
//       "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
//       [notifId, userId]
//     );

//     res.json({ message: "Notification marked as read" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to update notification" });
//   }
// });
// app.get("/test-email", async (req, res) => {
//   try {
//     await transporter.sendMail({
//       from: "abebenega23@gmail.com",
//       to: "abebenega23@gmail.com", // send to yourself
//       subject: "Test Email",
//       text: "Your email system is working!"
//     });

//     res.send("Email sent successfully!");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Email failed");
//   }
// });
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "abebenega23@gmail.com",   // your email
//     pass: "saws ixdi iljr kvtm"         // app password (no spaces)
//   }
// });
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});