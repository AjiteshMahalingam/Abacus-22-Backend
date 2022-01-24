const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const { genToken } = require("../helper/genToken");

//both google signin and signup
const googleSignin = async (req, res, next) => {
  try {
    const email = req.user._json.email;
    var user = await User.findOne({ email });
    if (user) {
      const token = genToken(user);
      return res.status(200).send({
        message: "User login successful.",
        email: user.email,
        name: req.user._json.name,
        auth: true,
        token,
      });
    } else {
      user = new User({
        id: uuidv4(),
        email,
        name: req.user.displayName,
      });

      try {
        const token = await genToken(user);
        return res.status(200).send({
          message: "User login successful after profile created.",
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
