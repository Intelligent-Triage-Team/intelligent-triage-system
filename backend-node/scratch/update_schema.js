const db = require("../database/db");

async function updateSchema() {
  try {
    await db.promise().query("ALTER TABLE triage_results ADD COLUMN status ENUM('pending', 'completed') DEFAULT 'pending'");
    console.log("Successfully added status column to triage_results");
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column already exists");
      process.exit(0);
    }
    console.error("Error updating schema:", error);
    process.exit(1);
  }
}

updateSchema();
