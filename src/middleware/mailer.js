const path = require("path");
// require("dotenv").config();

const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// console.log(process.env.CLIENT_ID);
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const createTransporter = async () => {
  try {
    const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

    const ACCESS_TOKEN = oAuth2Client.refreshAccessToken();
    access = (await ACCESS_TOKEN).credentials.access_token;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("mailer connected");

    return transporter;
  } catch (error) {
    console.log(error);
  }
};

const unsecureTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  auth: {
    user: process.env["NODEMAILER_EMAIL_ID"],
    pass: process.env["NODEMAILER_PWD"],
  },
  tls: {
    rejectUnauthorized: false,
  },
});
unsecureTransporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("All works fine - forget");
  }
});
const sendMail = async (emailOptions) => {
  try {
    const options = {
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html,
      to: emailOptions.to,
      from: `${process.env.NAME}  ${process.env.EMAIL}`,
    };

    // const emailtransporter = await createUnsecureTransporter();
    const result = await unsecureTransporter.sendMail(options);
    console.log("Email sent : " + result.messageId);

    return;
  } catch (error) {
    console.log(error);
    console.log("Unable to send mail");
  }
};
module.exports = sendMail;
