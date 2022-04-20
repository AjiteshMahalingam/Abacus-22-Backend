const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.jwtSecret);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      return res.status(503).send({ message: "Error authenticating" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "Please Authenticate. " });
  }
};

module.exports = auth;
