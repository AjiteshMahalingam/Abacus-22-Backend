const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const { genToken } = require("../helper/genToken");
const { sendVerificationEmail } = require("../middleware/mailer");
const url = require("url");
require("dotenv").config();

//both google signin and signup
const googleSignin = async (req, res, next) => {
  try {
    const email = req.user._json.email;
    const user = await User.findOne({ email });
    if (user) {
      if (user.isAccountVerified) {
        const token = await genToken(user);
        console.log("token is ==", token);
        const link = new URL(process.env["BASE_FRONTEND_URL"] + "/login");
        link.searchParams.append(
          "message",
          "Login success, for token check console."
        );
        link.searchParams.append("email", `${user.email}`);
        link.searchParams.append("name", `${user.name}`);
        link.searchParams.append("type", "signin");
        link.searchParams.append("token", `${token}`);
        console.log("link is ", link.href);
        return res.redirect(link);
      } else {
        // incase the user has registered but not verified
        sendVerificationEmail(user);
        const link = new URL(process.env["BASE_FRONTEND_URL"] + "/login");
        link.searchParams.append(
          "message",
          "User  not verified yet, verification mail sent again. Please verify to continue."
        );
        return res.redirect(link);
      }
    } else {
      // sign up new user
      User.create({
        // id: uuidv4(),
        abacusId: Math.floor(Math.random() * 1000000),
        email,
        name: req.user.displayName,
      })
        .then((user) => {
          const code = user.generateVerificationCode();
          try {
            // const token = await genToken(user);
            user.save();
            return res.redirect(
              process.env["BASE_FRONTEND_URL"] +
                "/login" +
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
