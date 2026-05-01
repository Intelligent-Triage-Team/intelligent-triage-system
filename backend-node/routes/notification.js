const express = require("express");
const router = express.Router();

const db = require("../database/db");
const authenticateToken = require("../middleware/auth"); 

router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications] = await db.promise().query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});
router.put("/notifications/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.promise().query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
      [userId]
    );

    res.json({ message: "Notifications marked as read" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});
router.put("/notifications/read/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;

    await db.promise().query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [notifId, userId]
    );

    res.json({ message: "Notification marked as read" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

module.exports = router;