var GoogleStrategy = require('passport-google-oauth20');
require('dotenv').config();
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/user/success'
  },
  async (accessToken, refreshToken, profile, done)  => {
    console.log("in async");
    const newUser = {
      id: profile.id,
      name: profile.displayName,
      email: profile._json.email,
      //hardcoding data from here
      college: "CEG",
      year: 3,
      department: "CSE",
      phoneNumber: "1234567890",
      password: "user1password",
    };
    console.log("after newUser");
    try {
      let user = await User.findOne({ id: profile.id});
      //const user = User.findOne({id: profile.id});
      if(user){ console.log("in if");
        done(null, user);
      } else {
          user= await User.create(newUser); console.log("user is ", user);
          // const token = await user.generateAuthtoken();
          // user.tokens.push({ token });
          // await user.save();
          done(null, user);
      }
    } catch(err) {
        console.error(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
    
  passport.deserializeUser((id, done) => done(null, obj));

}