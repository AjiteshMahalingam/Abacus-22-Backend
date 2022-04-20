const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const gSignIn = require("./gSignIn");
const router = new express.Router();
const { v4: uuidv4 } = require("uuid");
require("../middleware/gAuth")(passport);
const auth = require("../middleware/auth");
const { sendVerificationEmail } = require("../middleware/mailer");
const { default: axios } = require("axios");

//normal login
router.post("/login", async (req, res) => {
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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Enter both email and password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ message: "User not found, please register to continue." });

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual)
      return res.status(400).send({ message: "Invalid password. Try again." });

    if (!user.isAccountVerified) {
      sendVerificationEmail(user);
      return res.status(401).send({
        message:
          "User Not Verified, sending mail again. Please verify user to continue.",
      });
    }

    const token = await user.generateAuthtoken();
    user.tokens.push({ token });
    await user.save();

    const details = {
      name: user.name,
      abacusId: user.abacusId,
      token: token,
      eventPass: user.hasEventPass,
      registrations: user.registrations,
      workshops: user.workshops,
      college: user.college,
      isCegian: user.isCegian,
      accomodation: user.accomodation,
    };
    return res.status(200).send({ ...details });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Error authenticating", err });
  }
});

//gLogin
router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    successRedirect: "https://abacus.org.in/api/user/login/google/redirect",
  })
);

router.get(
  "/login/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/gautherror",
  }),
  (err, req, res, next) => {
    if (err) {
      console.log(err);
      console.log("");
      res.redirect("/login/google");
    } else {
      next();
    }
  },
  gSignIn.googleSignin
);

router.get("/gautherror", async (req, res) => {
  res.status(401).send({ error: "Google authentication error" });
});

// logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send("Successfully logged out");
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
