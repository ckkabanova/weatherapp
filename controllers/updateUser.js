const { pool } = require("../db");

module.exports = async function (userId, aimagId) {
  console.log("======= start updateUser.js=======");
  console.log("userId ", userId);
  console.log("aimagId ", aimagId);

  try {
    const queryselect = `SELECT * 
    FROM "userlist"
    WHERE "id" = $1`;
    const { rows } = await pool.query(queryselect, [userId]); // sends queries
    let rowsData = rows;
    console.log("user Id ", rows);
    if (rows.length == 1) {
      const result = await pool.query(
        "UPDATE userlist SET aimag_id = $1 WHERE id = $2",
        [aimagId, userId]
      );
      const { rows } = await pool.query(queryselect, [userId]); // sends queries

      rowsData = rows;
    }
    console.log("row reutrn ", rowsData);

    return rowsData;
  } catch (e) {
    return [];
  }
};
