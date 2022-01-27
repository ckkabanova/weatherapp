const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  host: process.env.PGHOST,
});

// module.exports = { pool };
// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "doadmin",
//   database: "defaultdb",
//   password: "MitVuRP5nnDBwX6K",
//   port: 25060,
//   host: "weather-do-user-10732558-0.b.db.ondigitalocean.com",
// });

/**
 * 
username = doadmin
password = VyU1vvpQS6sPDMDl hide
host = db-postgresql-nyc3-71201-do-user-10732558-0.b.db.ondigitalocean.com
port = 25060
database = defaultdb
sslmode = require
 */

/*
PGPASSWORD=MitVuRP5nnDBwX6K pg_restore -U doadmin -h weather-do-user-10732558-0.b.db.ondigitalocean.com -p 25060 -d defaultdb 
digital_1Ocean
*/
module.exports = { pool };
