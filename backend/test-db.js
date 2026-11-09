const pool = require("./config/db");

setTimeout(() => {
  pool.end();
}, 2000);
