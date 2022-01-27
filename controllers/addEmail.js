const { pool } = require("../db");

module.exports = async function insertData(name = "") {
  try {
    console.log("====== start insert User =========");
    const queryselect = `SELECT * 
                       FROM "userlist"
                       WHERE "email" = $1`;
    const { rows } = await pool.query(queryselect, [name]); // sends queries
    let rowsData = rows;
    console.log("chec if email exist ", name, rows);
    if (rows.length == 0) {
      const result = await pool.query(
        "INSERT INTO userlist (email) VALUES ($1)",
        [name]
      );
      const { rows } = await pool.query(queryselect, [name]); // sends queries
      rowsData = rows;
      console.log("added ", result);
    }
    console.log("row reutrn ", rowsData);

    return rowsData;
  } catch (error) {
    console.log(error);
    await pool.end();
    return [];
  } finally {
    // closes connection
  }
};
