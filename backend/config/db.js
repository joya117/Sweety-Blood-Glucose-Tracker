const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Test database connection
pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("PostgreSQL connected successfully!");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

module.exports = pool;
