const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
var convert = require("xml-js");
const app = express();
const addEmail = require("./controllers/addEmail");
const createDb = require("./controllers/createUserDb");
const updateUser = require("./controllers/updateUser");
require("dotenv").config();
const { pool } = require("./db");
const cron = require("node-cron");
var cors = require("cors");
const { validateEmail, getTodayDate } = require("./utils");

app.use(cors());
app.use(bodyParser.json());
pool.connect();

app.post("/addEmail", async (req, res) => {
  try {
    if (req.body.email == null || req.body.email == undefined) {
      return res.json({
        error: true,
        result: null,
        message: "Email is null",
      });
    }
    if (req.body.email == "") {
      return res.json({
        error: true,
        result: null,
        message: "Email is empty",
      });
    }
    if (validateEmail(req.body.email) == false) {
      return res.json({
        error: true,
        result: null,
        message: "Email is not correct",
      });
    }
    const text = `
    CREATE TABLE IF NOT EXISTS "userlist" (
        "id" SERIAL,
        "email" VARCHAR(100) NOT NULL,
        "aimag_id" INT DEFAULT 0 NOT NULL,
        PRIMARY KEY ("id")
    );`;
    await createDb(text);
    const result1 = await addEmail(req.body.email);
    console.log("result ", result1);

    return res.json({
      error: false,
      result: result1,
    });
  } catch (e) {
    console.log("=======add email catch error ========");
    console.log(e);
    console.log("=======add email post catch end -===========");
    return res.json({
      error: true,
      result: null,
    });
  }
});
app.post("/updateUser", async (req, res) => {
  try {
    const { userId, aimagId } = req.body;
    if (userId == null || userId == undefined) {
      return res.json({
        error: "true",
        message: "UserId is empty",
      });
    }
    if (aimagId == null || aimagId == undefined) {
      return res.json({
        error: "true",
        message: "AimagId is empty",
      });
    }
    const result1 = await updateUser(userId, aimagId);
    const result2 = await sendEmailNewUserOrUpdatedUser(result1[0].email);
    return res.json({
      error: false,
      result: result1,
    });
  } catch (e) {
    console.log("=======update userAimag catch error ========");
    console.log(e);
    console.log("=======update userAimag post catch end -===========");
    return res.json({
      error: true,
      result: null,
    });
  }
});
app.get("/getnext5weather", async (req, res) => {
  // const result = await axios.get("http://tsag-agaar.gov.mn/forecast_xml");

  // var result2 = JSON.parse(
  //   convert.xml2json(result.data, {
  //     compact: true,
  //     spaces: 1,
  //   })
  // );
  try {
    const result = [];

    const queryselect = `SELECT * 
                       FROM "weather"
                       WHERE "date" = $1`;
    const today0 = getTodayDate(0);
    const result0 = await pool.query(queryselect, [today0]);
    result.push({ date: today0, data: result0.rows });

    const today1 = getTodayDate(1);
    const result1 = await pool.query(queryselect, [today1]);
    result.push({ date: today1, data: result1.rows });

    const today2 = getTodayDate(2);
    const result2 = await pool.query(queryselect, [today2]);
    result.push({ date: today2, data: result2.rows });

    const today3 = getTodayDate(3);
    const result3 = await pool.query(queryselect, [today3]);
    result.push({ date: today3, data: result3.rows });

    const today4 = getTodayDate(4);
    const result4 = await pool.query(queryselect, [today4]);
    result.push({ date: today4, data: result4.rows });
    res.json({ error: false, data: result });
  } catch (e) {
    res.json({ error: true, data: [] });
  }
});
app.get("/aimagList", async (req, res) => {
  try {
    const queryselect = `SELECT * 
                       FROM "aimag"`;
    const result0 = await pool.query(queryselect, []);
    return res.json({ error: false, data: result0.rows });
  } catch (e) {
    return res.json({ error: true, data: [] });
  }
});

const {
  sendEmailNewUserOrUpdatedUser,
  sendEmail,
} = require("./controllers/sendMailToAll");
const load = require("./controllers/cron");
let cronjob = null;

app.get("/startCron", (req, res) => {
  cronjob = cron.schedule("37 22 * * *", function () {
    try {
      load();
      sendEmail();
      console.log("Cron worked ");
    } catch (e) {
      console.log("cron catch e ", e);
    }
    console.log("running a task every minute");
  });
  res.json({ error: false, message: "cron started" });
});
app.get("/stopCron", (req, res) => {
  if (cronjob != null) {
    cronjob.stop();
    res.json({ error: false, message: "cron stopped" });
  } else {
    return res.json({ error: false, message: "cron working" });
  }
});
app.get("/startJob", (req, res) => {
  try {
    load();
    //sendEmail();
    res.json({ error: false, message: "job started" });
  } catch (e) {
    console.log("cron catch e ", e);
    res.json({ error: false, message: "job started catch ", data: e });
  }
});
app.listen(process.env.PORT, () => {
  console.log("server is listening on port " + process.env.PORT);
});

/*
getTodaysWeather
*/
