const pool = require("./config/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
  try {
    const name = "Demo User";
    const email = "demo@sweety.com";
    const password = "DemoPass123";

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create demo user if it doesn't exist
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name, email, hashedPassword],
    );

    const userId = userResult.rows[0].id;

    // Add sample readings
    const readings = [
      ["2026-11-09", "morning_fasting", 90],
      ["2026-11-09", "after_breakfast", 140],
      ["2026-11-09", "after_lunch", 120],
      ["2026-11-09", "after_dinner", 160],
    ];

    for (const reading of readings) {
      await pool.query(
        `INSERT INTO readings
         (user_id, reading_date, time_slot, value_mg_dl)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot)
         DO UPDATE SET value_mg_dl = EXCLUDED.value_mg_dl`,
        [userId, ...reading],
      );
    }

    console.log("Demo data added successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await pool.end();
  }
};

seedDatabase();
