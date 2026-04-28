const express = require("express");
const router = express.Router();

const db = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mysecretkey";
router.post("/login", (req, res) => {

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
router.post("/signup", async (req, res) => {

  const { name, email, password, age, gender } = req.body;

  try {
    // ✅ 1. CHECK IF EMAIL EXISTS
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ 2. HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = "patient";

    // ✅ 3. INSERT USER
    const [userResult] = await db.promise().query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const userId = userResult.insertId;

    // ✅ 4. INSERT PATIENT
    await db.promise().query(
      "INSERT INTO patients (user_id, age, gender) VALUES (?, ?, ?)",
      [userId, age, gender]
    );

    res.json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }

});
router.post("/forgot-password", async (req, res) => {
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
router.post("/reset-password/:token", async (req, res) => {
  
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
module.exports = router;