const User = require("../models/User");

const genToken = async (user) => {
  const token = await user.generateAuthtoken();
  user.tokens.push({ token });
  await user.save();
  return token;
};

module.exports = { genToken };
