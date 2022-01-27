const { pool } = require("../db");

async function getWeatherByDate(aimagId, date) {
  const queryselect = `SELECT * 
                     FROM "weather"
                     WHERE "aimag_id" = $1 AND date = $2`;
  const { rows } = await pool.query(queryselect, [aimagId, date]);
  return rows;
}
module.exports = getWeatherByDate;
