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

//normal login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

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
    };
    console.log(details);
    return res.status(200).send({ details: details });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: err });
  }
});

//gLogin
router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    successRedirect:
      "https://abacus-22-backend.herokuapp.com/user/login/google/redirect",
    //"http://localhost:8000/user/login/google/redirect"
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
