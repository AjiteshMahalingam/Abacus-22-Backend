const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const router = new express.Router();
const sendVerificationEmail =
  require("../middleware/mailer").sendVerificationEmail;
const { default: axios } = require("axios");

const dotenv = require("dotenv");
dotenv.config();

router.post("/newUser", async (req, res) => {
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

  const {
    email,
    name,
    phoneNumber,
    college,
    year,
    department,
    password,
    accomodation,
  } = req.body;

  const user = new User({
    email,
    name,
    phoneNumber,
    college,
    year,
    department,
    password,
    abacusId: Math.floor(Math.random() * 1000000),
    accomodation,
  });
  try {
    if (college === "Anna university CEG campus Guindy") {
      user.isCegian = true;
      user.accomodation = false;
    } else {
      user.isCegian = false;
    }
    user.hasEventPass = true;
    user.password = await bcrypt.hash(user.password, 8);
    await user.generateVerificationCode();
    await user.save();
    sendVerificationEmail(user);
    res.status(201).send({
      message:
        "Verification mail has been sent to your email. Check the mail before logging in",
    });
  } catch (err) {
    // console.log(err);
    res.status(406).send(err);
  }
});

// Todo: user verification for updation of data

router.post("/googleSignUp", async (req, res) => {
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

  console.log(req.body);
  const {
    email,
    name,
    phoneNumber,
    college,
    year,
    department,
    password,
    verificationCode,
    accomodation,
  } = req.body;
  try {
    var user = await User.findOne({ email });
    console.log(user.verificationCode);
    if (user.verificationCode === verificationCode) {
      user.name = name;
      user.phoneNumber = phoneNumber;
      user.college = college;
      user.year = year;
      user.department = department;
      user.abacusId = Math.floor(Math.random() * 1000000);
      user.password = await bcrypt.hash(password, 8);
      user.isAccountVerified = true;
      user.hasEventPass = true;
      user.accomodation = accomodation;
      if (college === "Anna university CEG campus Guindy") {
        user.isCegian = true;
        user.accomodation = false;
      } else {
        user.isCegian = false;
      }

      await user.save();
      console.log("Google Sign Up for : " + user.email);
      return res.status(200).send({
        message: "User has been registered. Kindly login.",
      });
    } else {
      console.log("Hello");
    }
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

router.post("/updateExisting", auth, async (req, res) => {
  const { email, name, phoneNumber, college, year, department } = req.body;
  // console.log(googleAuth);

  try {
    var user = await User.findOne({ email });

    user.name = name;
    user.phoneNumber = phoneNumber;
    user.college = college;
    user.year = year;
    user.department = department;

    if (college === "Anna university CEG campus Guindy") {
      user.isCegian = true;
    } else {
      user.isCegian = false;
    }
    await user.save();
    console.log("user: " + user.email + " updated");
    return res.status(200).send({ message: "User has been updated" });
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

router.post("/verifyUser", async (req, res) => {
  console.log(req.body);
  const data = req.body;
  try {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(404).send({ message: "Wrong User" });
    } else if (!user.isAccountVerified) {
      if (user.verificationCode === data.code) {
        user.isAccountVerified = true;
        await user.save();

        await sendMail({
          subject: "Thanks for Registering - Abacus '22",
          html: `
          <div id="EmailBody">
          <h2>Greetings from CSEA</h2>
          <hr />
          <br />
          <i>
            Hello <b>${user.name}</b>
          </i>
          <br />
          <br />
          <p>
          Thanks for registering for Abacus - 2022. Your account has been activated successfully. Kindly note the Abacus Id: ${user.abacusId} for your future reference. Check out the events and workshops and enroll yourselves. We're excited to have you join us and hope to see you on the day of Abacus.

          If you have any queries, mail us on ${process.env.NODEMAILER_EMAIL_ID}. We're happy to help. Have a good day.
          
          Best,
          Team Abacus
          </p>
        </div>`,
          to: user.email
        });

        return res.status(200).send({ message: "User has been verified" });
      } else {
        return res.status(403).send({ message: "Wrong verification Code" });
      }
    } else {
      return res.status(200).send({ message: "User already verified" });
    }
  } catch (e) {
    console.log(e);
    return res.status(401).send({ message: "Wrong Credentials" });
  }
});

module.exports = router;
