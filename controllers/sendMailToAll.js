const { pool } = require("../db");
const { getTodayDate } = require("../utils");
const getAimagNameById = require("./getAimagNameById");
const getWeatherByDate = require("./getWeatherByDate");
const nodemailer = require("nodemailer");
async function main(usermail = "", text = "") {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: "bolormaaamarzayads@gmail.com", // generated ethereal user
      pass: "wdrcxcdnugicosbb", // generated ethereal password
    },
  });

  // send mail with defined transport object
  const mailOptions = {
    from: "bolormaaamarzayads@gmail.com", // sender address
    to: usermail, // list of receivers
    subject: "Өнөөдрийн цаг агаарын мэдээ.", // Subject line
    text: text, // plain text body
    html: `<div>${text}</div>`, // html body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log("err ", err);
      //res.json(err);
      return Promise.reject(err);
    } else {
      //res.json(info);
      //console.log(" info ", info);
      return Promise.resolve(info);
    }
  });
}
async function sendEmail() {
  try {
    const queryselect = `SELECT * 
          FROM "userlist"`;
    const { rows } = await pool.query(queryselect, []);

    if (rows.length > 0) {
      rows.map(async (row) => {
        console.log("row ", row);
        const date = getTodayDate();
        const weather = await getWeatherByDate(row.aimag_id, date);
        const aimag = await getAimagNameById(row.aimag_id);
        if (weather.length > 0 && aimag.length > 0) {
          const ww = weather[0];
          const emailText = `Сайн байна уу?
              Өнөөдөр буюу ${date} өдөр  ${aimag[0].name} - д өдөртөө  ${ww.temperature_day} градус  ${ww.pheno_day_str} бөгөөд  салхины хурд ${ww.wind_day}м/с байна. Харин шөнөдөө ${ww.temperature_night} градус ${ww.pheno_night_str} бөгөөд салхины хурд ${ww.wind_night}м/c байна.
              Таны өнөөдрийн ажилд тань амжилт хүсье. Баярлалаа.`;
          await main(row.email, emailText).catch(console.error);
        } else {
          //console.log("weather info not found on ", date);
        }
      });
    }
  } catch (e) {
    console.log("send email catch ", e);
  }
}
async function sendEmailNewUserOrUpdatedUser(email = "") {
  try {
    const queryselect = `SELECT * 
          FROM "userlist" WHERE "email"=$1`;
    const result = await pool.query(queryselect, [email]);
    const row = result.rows[0];
    const date = getTodayDate();
    const weather = await getWeatherByDate(row.aimag_id, date);
    const aimag = await getAimagNameById(row.aimag_id);
    if (weather.length > 0 && aimag.length > 0) {
      const ww = weather[0];
      const emailText = `Сайн байна уу?
              Өнөөдөр буюу ${date} өдөр  ${aimag[0].name} - д өдөртөө  ${ww.temperature_day} градус  ${ww.pheno_day_str} бөгөөд  салхины хурд ${ww.wind_day}м/с байна. Харин шөнөдөө ${ww.temperature_night} градус ${ww.pheno_night_str} бөгөөд салхины хурд ${ww.wind_night}м/c байна.
              Таны өнөөдрийн ажилд тань амжилт хүсье. Баярлалаа.`;
      await main(row.email, emailText).catch(console.error);
      return {
        error: false,
        message: "send message to new user",
      };
    } else {
      console.log("weather info not found on ", date);
      return {
        error: false,
        message: "Can not send email to new User",
      };
    }
  } catch (e) {
    return {
      error: false,
      message: "Can not send email to new User",
    };
  }
}
module.exports = {
  sendEmail,
  main,
  sendEmailNewUserOrUpdatedUser,
};
