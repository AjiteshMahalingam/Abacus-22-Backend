const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const { genToken } = require("../helper/genToken");
const sendVerificationEmail = require("../middleware/sendVerificationEmail");
const url = require("url");

//both google signin and signup
const googleSignin = async (req, res, next) => {
  try {
    const email = req.user._json.email;
    const user = await User.findOne({ email });
    if (user) {
      if (user.isAccountVerified) {
        const token = genToken(user);
        console.log("token is ==", token);
        return res.status(200).send({
          message: "User login successful.",
          email: user.email,
          name: req.user._json.name,
          auth: true,
          type: "signin",
          token: user.token,
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
      User.create({
        // id: uuidv4(),
        email,
        name: req.user.displayName,
      })
        .then((user) => {
          const code = user.generateVerificationCode();
          try {
            // const token = await genToken(user);
            user.save();
            return res.redirect(
              "http://localhost:3000/Login/" +
                url.format({
                  query: {
                    message:
                      "User profile created successfully, continue filling your information to login.",
                    email: user.email,
                    name: user.name,
                    type: "signup",
                    googleAuth: true,
                    verificationCode: code,
                    // token,
                  },
                })
            );
          } catch {
            return res
              .status(400)
              .send({ message: "Server Error, new user not created" });
          }
        })
        .catch((e) => {
          return res
            .status(400)
            .send({ message: "Server Error, new user not created", error: e });
        });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Server Error, needs to be checked" });
  }
};

module.exports = { googleSignin };
