const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const { genToken } = require("../helper/genToken");
const sendVerificationEmail = require("../middleware/sendVerificationEmail");

//both google signin and signup
const googleSignin = async (req, res, next) => {
  try {
    const email = req.user._json.email;
    const user = await User.findOne({ email });
    if (user) {
      if (user.isAccountVerified) {
        const token = genToken(user);
        return res.status(200).send({
          message: "User login successful.",
          email: user.email,
          name: req.user._json.name,
          auth: true,
          token,
        });
      } else {
        // incase the user has registered but not verified
        sendVerificationEmail(user);
        return res.status(401).send({
          message: "User not yet authenticated. Mail has been resent.",
        });
      }
    } else {
      // sign up new user
      user = new User({
        id: uuidv4(),
        email,
        name: req.user.displayName,
      });

      try {
        const token = await genToken(user);
        return res.status(200).send({
          message:
            "User profile created successfully, continue filling your information to login.",
          email: user.email,
          name: user.name,
          auth: true,
          token,
        });
      } catch {
        return res.status(400).send({ message: "Server Error" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Server Error." });
  }
};

module.exports = { googleSignin };
