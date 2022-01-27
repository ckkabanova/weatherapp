const { pool } = require("../db");

var convert = require("xml-js");
const axios = require("axios");
const getWeatherByDate = require("./getWeatherByDate");

async function execute(query) {
  try {
    //console.log("Execute connected ");
    await pool.connect(); // gets connection
    await pool.query(query);
    return true;
  } catch (error) {
    console.error(error.stack);
    await pool.end();
    return false;
  } finally {
  }
}
async function insertData(name) {
  try {
    //console.log("insert DAta ", name);
    const queryselect = `SELECT * 
                       FROM "aimag"
                       WHERE "name" = $1`;
    const { rows } = await pool.query(queryselect, [name]);
    // sends queries
    let rowsData = rows;
    if (rows.length == 0) {
      const result = await pool.query("INSERT INTO aimag (name) VALUES ($1)", [
        name,
      ]);
      const { rows } = await pool.query(queryselect, [name]); // sends queries
      rowsData = rows;
      //console.log("added ", result);
    }
    //console.log("row reutrn ", rowsData);

    return rowsData;
  } catch (error) {
    console.log(error);
    await pool.end();
    return [];
  } finally {
    // closes connection
  }
}

async function insertDataWeather(
  windNight,
  windDay,
  temperatureDay,
  temperatureNight,
  date,
  aimagId,
  pNightId,
  pNightStr,
  pDayId,
  pDayStr
) {
  try {
    // console.log(
    //   "======= welcome to insert data weather ==============",
    //   aimagId
    // );
    // sends queries
    const rows = await getWeatherByDate(aimagId, date);
    let rowsData = rows;
    if (rows.length == 0) {
      // console.log(
      //   " wind day ",
      //   windNight,
      //   windDay,
      //   temperatureDay,
      //   temperatureNight,
      //   date,
      //   aimagId,
      //   pNightId,
      //   pNightStr,
      //   pDayId,
      //   pDayStr
      // );
      const result = await pool.query(
        "INSERT INTO weather (wind_night, wind_day, temperature_day, temperature_night, date, aimag_id, pheno_night_id, pheno_night_str,pheno_day_id, pheno_day_str) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [
          windNight,
          windDay,
          temperatureDay,
          temperatureNight,
          date,
          aimagId,
          pNightId,
          pNightStr,
          pDayId,
          pDayStr,
        ]
      );
      const rows = await getWeatherByDate(aimagId, date); // sends queries
      rowsData = rows;
      //console.log("added ", result);
    }

    return rowsData;
  } catch (error) {
    console.log(error);
    //await pool.end();
    return [];
  } finally {
    // closes connection
  }
}
async function load() {
  try {
    const text = `
      CREATE TABLE IF NOT EXISTS "aimag" (
          "id" SERIAL,
          "name" VARCHAR(100) NOT NULL,
          PRIMARY KEY ("id")
      );`;
    await execute(text);
    const textWeather = `
      CREATE TABLE IF NOT EXISTS "weather" (
          "id" SERIAL,
          "wind_night" INT,
          "wind_day" INT,
          "temperature_day" INT,
          "temperature_night" INT,
          "date" VARCHAR(100) ,
          "aimag_id" INT ,
          "pheno_night_id" INT ,
          "pheno_night_str" VARCHAR(100) ,
          "pheno_day_id" INT ,
          "pheno_day_str" VARCHAR(100) ,
          PRIMARY KEY ("id")
      );`;
    await execute(textWeather);

    //const insert = await insertData("ghj");
    const result = await axios.get("http://tsag-agaar.gov.mn/forecast_xml");

    var result2 = JSON.parse(
      convert.xml2json(result.data, {
        compact: true,
        spaces: 1,
      })
    );

    if (result2.xml.forecast5day.length > 0) {
      result2.xml.forecast5day.map(async (mm, mid) => {
        const result = await insertData(mm.city._text);
        if (result.length > 0) {
          const aimagId = result[0].id;
          mm.data.weather.map(async (ww, wid) => {
            const wwrest = await insertDataWeather(
              parseInt(ww.windNight._text),
              parseInt(ww.windDay._text),
              parseInt(ww.temperatureDay._text),
              parseInt(ww.temperatureNight._text),
              ww.date._text,
              aimagId,
              parseInt(ww.phenoIdNight._text),
              ww.phenoNight._text,
              parseInt(ww.phenoIdDay._text),
              ww.phenoDay._text
            );
            //insertDataWeather(5, 5, 5, 5, "2021-10-11", 2, 1, "fds", 1, "fds");
          });
          //
        }
        //console.log("result add ", result);
      });
    }
  } catch (e) {
    console.log("Catch load ", e);
  }
}
module.exports = load;
