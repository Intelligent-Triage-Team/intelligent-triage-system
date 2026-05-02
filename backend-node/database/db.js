require('dotenv').config();

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

module.exports = db;