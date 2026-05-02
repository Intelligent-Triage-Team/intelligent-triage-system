const express = require("express");
const router = express.Router();

const db = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

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
     { id: user.id, role: user.role, name: user.name },
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
  console.log("Signup request received:", req.body);

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
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }

});
// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
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

    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiryTime = new Date(Date.now() + 3600000); // 1 hour expiry

    await db.promise().query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [token, expiryTime, email]
    );

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Always show reset link immediately for instant access
    res.json({
      message: "Password reset link generated successfully",
      resetLink: resetLink,
      email: email,
      immediateAccess: true
    });

    // Try to send email in background (optional)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset - Haramaya Hiwote Fana Hospital',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2c3e50;">Haramaya Hiwote Fana Hospital</h2>
              <p style="color: #7f8c8d;">Intelligent Triage System</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h3>
              <p style="color: #555; line-height: 1.6;">
                Hello ${users[0].name || 'User'},
              </p>
              <p style="color: #555; line-height: 1.6;">
                We received a request to reset your password for your account at Haramaya Hiwote Fana Hospital's Intelligent Triage System.
              </p>
              <p style="color: #555; line-height: 1.6;">
                Click the button below to reset your password. This link will expire in 1 hour for security reasons.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: #3498db; color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 5px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; color: #7f8c8d; font-size: 12px;">
              <p>Haramaya Hiwote Fana Hospital</p>
              <p>Eastern Ethiopia | Healthcare Innovation</p>
            </div>
          </div>
        `
      };

      // Send email asynchronously (don't wait for it)
      transporter.sendMail(mailOptions).catch(emailError => {
        console.error('Email sending failed:', emailError);
      });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Check if token exists and is not expired
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?",
      [hashedPassword, token]
    );

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Validate reset token endpoint
router.get("/validate-reset-token/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    res.json({ valid: true });

  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;