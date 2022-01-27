const { pool } = require("../db");

module.exports = async function execute(query) {
  try {
    console.log("creating new table in query  ", query);
    await pool.connect(); // gets connection
    await pool.query(query);
    return true;
  } catch (error) {
    console.error(error.stack);
    await pool.end();
    return false;
  } finally {
  }
};
