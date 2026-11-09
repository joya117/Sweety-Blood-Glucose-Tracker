const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} = require("../controllers/readingController");

// Test protected route
router.get("/test", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Authentication successful!",
    user: req.user,
  });
});

// Reports
router.get("/reports/daily", authMiddleware, getDailyReport);
router.get("/reports/month-to-date", authMiddleware, getMonthToDateReport);
router.get("/reports/previous-month", authMiddleware, getPreviousMonthReport);

// CRUD
router.post("/", authMiddleware, createReading);
router.get("/", authMiddleware, getReadings);
router.put("/:id", authMiddleware, updateReading);
router.delete("/:id", authMiddleware, deleteReading);

module.exports = router;
