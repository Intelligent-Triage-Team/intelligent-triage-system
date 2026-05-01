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


app.get("/", (req, res) => {
  res.json({ message: "Backend server running" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});