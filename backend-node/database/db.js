const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "abebe@hu",
  database: "healthcare_db",

  // ✅ Ethiopia timezone
  timezone: "+03:00"
  // timezone: "+00:00"
  
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

module.exports = db;