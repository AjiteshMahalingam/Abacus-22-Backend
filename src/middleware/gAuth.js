var GoogleStrategy = require("passport-google-oauth20");
require("dotenv").config();
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env["CLIENT_ID"],
        clientSecret: process.env["CLIENT_SECRET"],
        callbackURL: "http://localhost:3000/user/login/google/redirect",
      },
      function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        console.log("user profile is ", userProfile);
        return done(null, userProfile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));

  passport.deserializeUser((id, done) => done(null, obj));
};
