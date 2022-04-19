const path = require("path");
// require("dotenv").config();

const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// // console.log(process.env.CLIENT_ID);
/*
 const CLIENT_ID = process.env.CLIENT_ID;
 const CLIENT_SECRET = process.env.CLIENT_SECRET;
 const REDIRECT_URI = "https://developers.google.com/oauthplayground";
 const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

 const createTransporter = async () => {
   try {
     const oAuth2Client = new OAuth2(
       CLIENT_ID, 
       CLIENT_SECRET, 
       REDIRECT_URI
      );

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
*/
// const mailTransporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   service: "gmail",
//   auth: {
//     user: process.env["DIYA_NODEMAILER"],
//     pass: process.env["DIYA_PWD"],
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });
// mailTransporter.verify((error, success) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Mailer works fine");
//   }
// });
const transporter = nodemailer.createTransport({
  host: "abacus.org.com",
  service: "gmail",
  secure: false,
  auth: {
    user: process.env["ABACUS_EMAIL"],
    pass: process.env["ABACUS_PWD"],
  },
  tls: {
    rejectUnauthorized: false,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Email Transporter Works");
  }
});

const sendMail = async (emailOptions) => {
  try {
    const options = {
      subject: emailOptions.subject,
      //text: emailOptions.text,
      html: emailOptions.html,
      to: emailOptions.to,
      from: `${process.env["NAME"]} ${process.env["NODEMAILER_EMAIL_ID"]}`,
    };

    //  const emailTransporter = await createTransporter();
    //  const result = await emailTransporter.sendMail(options);
    const result = transporter.sendMail(options);
    console.log("Email sent : " + result.response);

    return;
  } catch (error) {
    console.log(error);
    console.log("Unable to send mail");
  }
};

const sendVerificationEmail = async (user) => {
  const code = user.generateVerificationCode();
  user.save();

  console.log(code);
  var mailOptions = {
    replyTo: process.env["ABACUS_EMAIL"],
    to: user.email,
    subject: "Verify Email - Abacus '22",
    from: `${process.env.NAME}  ${process.env.ABACUS_EMAIL}`,
    html: `
      <div id="EmailBody">
        <h2>Welcome to Abacus'22</h2>
        <hr />
        <br />
        <i>
          Hello <b>${user.name}</b>
        </i>
        <br />
        <br />
        <p>
          Click on this
          <a href="http://localhost:3000/Login/VerifyEmail?email=${user.email}&code=${user.verificationCode}">link</a> or
          copy paste the following in your browser URL to verify your account.
        </p>
        <p>
          <a href="http://localhost:3000/Login/VerifyEmail?email=${user.email}&code=${user.verificationCode}">
          http://localhost:3000/Login/VerifyEmail?email=${user.email}&code=${user.verificationCode}
          </a>
        </p>
      </div>`,
  };

  // mailer(mailOptions);

  // const emailTransporter = await createTransporter();
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log({
        status: "Failed",
        msg: err,
      });
    } else {
      // console.log("message sent");
      console.log({
        status: "success",
      });
    }
  });
};
module.exports = { sendMail, sendVerificationEmail };
