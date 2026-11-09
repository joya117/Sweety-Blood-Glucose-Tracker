const pool = require("../config/db");

const createReading = async (req, res) => {
  const { reading_date, time_slot, value_mg_dl } = req.body;

  // 1. Check required fields
  if (!reading_date || !time_slot || value_mg_dl === undefined) {
    return res.status(400).json({
      message: "Date, time slot and glucose value are required.",
    });
  }

  // 2. Validate glucose value
  if (
    typeof value_mg_dl !== "number" ||
    !Number.isInteger(value_mg_dl) ||
    value_mg_dl < 40 ||
    value_mg_dl > 600
  ) {
    return res.status(400).json({
      message: "Glucose value must be a whole number between 40 and 600.",
    });
  }

  // 3. Validate date format and actual date
  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(reading_date) &&
    !Number.isNaN(Date.parse(reading_date)) &&
    new Date(reading_date).toISOString().slice(0, 10) === reading_date;

  if (!validDate) {
    return res.status(400).json({
      message: "Please provide a valid date in YYYY-MM-DD format.",
    });
  }

  // 4. Validate time slot
  const allowedSlots = [
    "morning_fasting",
    "after_breakfast",
    "after_lunch",
    "after_dinner",
  ];

  if (!allowedSlots.includes(time_slot)) {
    return res.status(400).json({
      message: "Invalid time slot.",
    });
  }

  try {
    // 5. Save reading for the logged-in user
    const result = await pool.query(
      `INSERT INTO readings
            (user_id, reading_date, time_slot, value_mg_dl)
            SELECT $1, $2::date, $3, $4
            WHERE $2::date <= CURRENT_DATE
            RETURNING *`,
      [req.user.id, reading_date, time_slot, value_mg_dl],
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: "Future dates are not allowed.",
      });
    }

    return res.status(201).json({
      message: "Glucose reading added successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading already exists for this time slot and date.",
      });
    }

    console.error("Create reading error:", error.message);

    return res.status(500).json({
      message: "Server error while adding reading.",
    });
  }
};
const getReadings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
    id,
    user_id,
    TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
    time_slot,
    value_mg_dl,
    created_at
 FROM readings
 WHERE user_id = $1 
 ORDER BY reading_date DESC, created_at DESC`,
      [req.user.id],
    );

    return res.status(200).json({
      count: result.rows.length,
      readings: result.rows,
    });
  } catch (error) {
    console.error("Get readings error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching readings.",
    });
  }
};

const updateReading = async (req, res) => {
  const { id } = req.params;
  const { reading_date, time_slot, value_mg_dl } = req.body;

  // 1. Validate reading ID
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      message: "Invalid reading ID.",
    });
  }

  // 2. Check required fields
  if (!reading_date || !time_slot || value_mg_dl === undefined) {
    return res.status(400).json({
      message: "Date, time slot and glucose value are required.",
    });
  }

  // 3. Validate glucose value
  if (
    typeof value_mg_dl !== "number" ||
    !Number.isInteger(value_mg_dl) ||
    value_mg_dl < 40 ||
    value_mg_dl > 600
  ) {
    return res.status(400).json({
      message: "Glucose value must be a whole number between 40 and 600.",
    });
  }

  // 4. Validate date
  const validDate =
    /^\d{4}-\d{2}-\d{2}$/.test(reading_date) &&
    !Number.isNaN(Date.parse(reading_date)) &&
    new Date(reading_date).toISOString().slice(0, 10) === reading_date;

  if (!validDate) {
    return res.status(400).json({
      message: "Please provide a valid date in YYYY-MM-DD format.",
    });
  }

  // 5. Validate time slot
  const allowedSlots = [
    "morning_fasting",
    "after_breakfast",
    "after_lunch",
    "after_dinner",
  ];

  if (!allowedSlots.includes(time_slot)) {
    return res.status(400).json({
      message: "Invalid time slot.",
    });
  }

  try {
    // 6. Prevent future dates
    const dateCheck = await pool.query(
      "SELECT $1::date <= CURRENT_DATE AS valid",
      [reading_date],
    );

    if (!dateCheck.rows[0].valid) {
      return res.status(400).json({
        message: "Future dates are not allowed.",
      });
    }

    // 7. Update only the logged-in user's reading
    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1,
           time_slot = $2,
           value_mg_dl = $3
       WHERE id = $4 AND user_id = $5
       RETURNING
         id,
         user_id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value_mg_dl,
         created_at`,
      [reading_date, time_slot, value_mg_dl, id, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    return res.status(200).json({
      message: "Reading updated successfully.",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading already exists for this time slot and date.",
      });
    }

    console.error("Update reading error:", error.message);

    return res.status(500).json({
      message: "Server error while updating reading.",
    });
  }
};

const deleteReading = async (req, res) => {
  const { id } = req.params;

  // Validate reading ID
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
      message: "Invalid reading ID.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    return res.status(200).json({
      message: "Reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reading error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting reading.",
    });
  }
};

const getDailyReport = async (req, res) => {
  const { date } = req.query;

  // Validate date
  const validDate =
    date &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;

  if (!validDate) {
    return res.status(400).json({
      message: "Please provide a valid date in YYYY-MM-DD format.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value_mg_dl
       FROM readings
       WHERE user_id = $1 AND reading_date = $2::date
       ORDER BY
         CASE time_slot
           WHEN 'morning_fasting' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END`,
      [req.user.id, date],
    );

    const readings = result.rows;
    const values = readings.map((reading) => reading.value_mg_dl);
    const count = values.length;

    const summary = {
      highest: count ? Math.max(...values) : null,
      lowest: count ? Math.min(...values) : null,
      average: count
        ? Number(
            (values.reduce((sum, value) => sum + value, 0) / count).toFixed(1),
          )
        : null,
      total_readings: count,
    };

    return res.status(200).json({
      date,
      has_readings: count > 0,
      summary,
      readings,
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      message: "Server error while generating daily report.",
    });
  }
};

const getMonthToDateReport = async (req, res) => {
  const { date } = req.query;

  const validDate =
    date &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;

  if (!validDate) {
    return res.status(400).json({
      message: "Please provide a valid date in YYYY-MM-DD format.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value_mg_dl
       FROM readings
       WHERE user_id = $1
         AND reading_date >= DATE_TRUNC('month', $2::date)::date
         AND reading_date <= $2::date
       ORDER BY reading_date ASC,
         CASE time_slot
           WHEN 'morning_fasting' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END`,
      [req.user.id, date],
    );

    const readings = result.rows;
    const values = readings.map((reading) => reading.value_mg_dl);
    const count = values.length;

    const summary = {
      highest: count ? Math.max(...values) : null,
      lowest: count ? Math.min(...values) : null,
      average: count
        ? Number(
            (values.reduce((sum, value) => sum + value, 0) / count).toFixed(1),
          )
        : null,
      total_readings: count,
    };

    return res.status(200).json({
      from_date: `${date.slice(0, 7)}-01`,
      to_date: date,
      has_readings: count > 0,
      summary,
      readings,
    });
  } catch (error) {
    console.error("Month-to-date report error:", error.message);
    return res.status(500).json({
      message: "Server error while generating month-to-date report.",
    });
  }
};

const getPreviousMonthReport = async (req, res) => {
  const { date } = req.query;

  const validDate =
    date &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;

  if (!validDate) {
    return res.status(400).json({
      message: "Please provide a valid date in YYYY-MM-DD format.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         value_mg_dl
       FROM readings
       WHERE user_id = $1
         AND reading_date >= (
           DATE_TRUNC('month', $2::date) - INTERVAL '1 month'
         )::date
         AND reading_date < DATE_TRUNC('month', $2::date)::date
       ORDER BY reading_date ASC,
         CASE time_slot
           WHEN 'morning_fasting' THEN 1
           WHEN 'after_breakfast' THEN 2
           WHEN 'after_lunch' THEN 3
           WHEN 'after_dinner' THEN 4
         END`,
      [req.user.id, date],
    );

    const readings = result.rows;
    const values = readings.map((reading) => reading.value_mg_dl);
    const count = values.length;

    const summary = {
      highest: count ? Math.max(...values) : null,
      lowest: count ? Math.min(...values) : null,
      average: count
        ? Number(
            (values.reduce((sum, value) => sum + value, 0) / count).toFixed(1),
          )
        : null,
      total_readings: count,
    };

    const previousMonth = new Date(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 2,
      1,
    );

    const year = previousMonth.getFullYear();
    const month = String(previousMonth.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, previousMonth.getMonth() + 1, 0).getDate();

    return res.status(200).json({
      from_date: `${year}-${month}-01`,
      to_date: `${year}-${month}-${lastDay}`,
      has_readings: count > 0,
      summary,
      readings,
    });
  } catch (error) {
    console.error("Previous month report error:", error.message);
    return res.status(500).json({
      message: "Server error while generating previous month report.",
    });
  }
};

module.exports = {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
};
