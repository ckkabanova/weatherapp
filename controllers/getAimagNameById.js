const { pool } = require("../db");

async function getAimagNameById(id = 0) {
  try {
    const queryselect = `SELECT * 
          FROM "aimag"
          WHERE "id" = $1`;
    const { rows } = await pool.query(queryselect, [id]);
    return rows;
  } catch (e) {
    return [];
  }
}
module.exports = getAimagNameById;
