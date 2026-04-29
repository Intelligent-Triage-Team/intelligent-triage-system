const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ayenew@1234",
  multipleStatements: true // IMPORTANT
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully");

    // Read SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, "database.sql"),
      "utf-8"
    );

    // Execute SQL
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error executing SQL file:", err);
      } else {
        console.log("Database & Tables Created Successfully");
      }
    });
  }
});

module.exports = db;