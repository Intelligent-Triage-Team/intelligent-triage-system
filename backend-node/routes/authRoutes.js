const express = require("express");
const router = express.Router();

const db = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET_KEY = "mysecretkey";

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

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
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  const { name, email, password, age, gender } = req.body;

  try {
    // validate input
    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check duplicate email
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = "patient";

    // insert user
    const [result] = await db.promise().query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    // insert patient
    await db.promise().query(
      "INSERT INTO patients (user_id, age, gender) VALUES (?, ?, ?)",
      [userId, age, gender]
    );

    // create token immediately after signup
    const token = jwt.sign(
      { id: userId, role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name,
        email,
        role
      }
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

module.exports = router;