const User = require("../models/User");
const crypto = require("crypto");

const sendMail = require("../middleware/mailer").sendMail;
const { default: axios } = require("axios");

const forgetPassword = async (req, res) => {
  if (!req.body.captcha)
    return res.status(400).send({
      message: "Please select captcha",
    });

  const secretKey = process.env.CAPTCHA_SECRET;

  const verifyURL = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

  const body = await axios.get(verifyURL).then((res) => {
    return res;
  });

  if (body.success !== undefined && !body.success) {
    return res.status(400).send({
      message: "Failed captcha verification",
    });
  }

  try {
    const datenow = Date.now();
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send({ message: "Email not registered" });
      return;
    }

    //allows users to generate new reset links every 2 minutes
    const time_left = Math.round(
      parseInt(user.resetPasswordExpireTime - datenow) / 1000 / 60
    );
    if (time_left > 8) {
      res.status(400).send({
        message: `Email sent already. Try again after
          ${time_left - 8}
           minutes.`,
      });
      return;
    }
    const token = crypto.randomBytes(15).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    user.resetPasswordExpireTime = datenow + 10 * 60 * 1000;
    await user.save();

    const url = `${req.protocol}://localhost:3000/resetPassword/${token}`; //had to change the url acc. to ther front end port
    //console.log(url)
    await sendMail({
      subject: "Request for password Reset",
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
        This mail contains the link to reset your password.
        Click on this
        <a href="${url}">Reset Link</a> or
        copy paste the following URL in your browser to verify your account.
      </p>
      <p>
      <a href='${url}'>${url}</a>
      </p>
    </div>`,
      to: email,
    });
    console.log("Response sent to user");

    res.status(200).send({ message: "Email sent" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Unable to send mail" });
  }
};

module.exports = forgetPassword;
