const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const router = new express.Router();
const { sendVerificationEmail } = require("../middleware/mailer");

router.post("/newUser", async (req, res) => {
  //console.log(req.body);
  const { email, name, phoneNumber, college, year, department, password } =
    req.body;

  const user = new User({
    email,
    name,
    phoneNumber,
    college,
    year,
    department,
    password,
  });
  try {
    user.password = await bcrypt.hash(user.password, 8);
    await user.generateVerificationCode();
    await user.save();
    sendVerificationEmail(user);
    res.status(201).send({
      message:
        "Verification mail has been sent to your email. Check the mail before logging in",
    });
  } catch (err) {
    console.log(err.code);
    res.status(406).send(err);
  }
});

// Todo: user verification for updation of data

router.post("/googleSignUp", async (req, res) => {
  const {
    email,
    name,
    phoneNumber,
    college,
    year,
    department,
    password,
    verificationCode,
  } = req.body;
  try {
    var user = await User.findOne({ email });

    if (user.verificationCode === verificationCode) {
      user.name = name;
      user.phoneNumber = phoneNumber;
      user.college = college;
      user.year = year;
      user.department = department;

      user.password = await bcrypt.hash(password, 8);
      user.isAccountVerified = true;

      await user.save();
      console.log("Google Sign Up for : " + user.email);
      return res.status(200).send({
        message: "User has been registered. Kindly login.",
      });
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
