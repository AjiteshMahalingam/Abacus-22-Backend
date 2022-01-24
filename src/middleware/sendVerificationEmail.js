const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env["NODEMAILER_EMAIL_ID"],
    pass: process.env["NODEMAILER_PWD"],
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("All works fine");
  }
});

module.exports = (user) => {
  const code = user.generateVerificationCode();
  user.save();

  console.log(code);
  var mailOptions = {
    replyTo: process.env["NODEMAILER_EMAIL_ID"],
    to: user.email,
    subject: "Verify Email - Abacus '22",
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
          <a href="http://localhost:3000/user/signup/verifyUser?email=${user.email}&code=${user.verificationCode}">link</a> or
          copy paste the following in your browser URL to verify your account.
        </p>
        <p>
          <a href="http://localhost:3000/user/signup/verifyUser?email=${user.email}&code=${user.verificationCode}">
            http://localhost:3000/user/signup/verifyUser?email=${user.email}&code=${user.verificationCode}
          </a>
        </p>
      </div>`,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      res.send({
        status: "Failed",
        msg: err,
      });
    } else {
      console.log("message sent");
      res.send({
        status: "success",
      });
    }
  });
};
