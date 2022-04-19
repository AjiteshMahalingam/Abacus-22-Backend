const User = require("../models/User");
const Registration = require("../models/Registration");

const validate = async (user_one, user_two) => {
  const User1 = await verify(user_one);
  if (User1.verify == false) return { valid: false, message: User1.message };
  const User2 = await verify(user_two);
  if (User2.verify == false) return { valid: false, message: User2.message };

  return { valid: true, user1: User1.user, user2: User2.user };
};
const hackRegister = async (user_one, user_two) => {
  var status = 200;
  const User1_registration = await register(user_one);
  if (User1_registration.register) {
    const User2_registration = await register(user_two);

    if (!User2_registration.register) {
      await Registration.deleteOne({ type: "hackathon", email: user_one });
      status = 400;
    }
    return { status: status, message: User2_registration.message };
  } else {
    status = 400;
    return { status: status, message: User1_registration.message };
  }
};

const verify = async (abacusId) => {
  const user = await User.findOne({ abacusId });

  if (user == null)
    return { verify: false, message: abacusId + " is not a registered user" };

  if (user.hasEventPass == false)
    return {
      verify: false,
      message:
        user.name + " < " + user.email + " > " + " has not acquired event pass",
    };

  return { verify: true, user: user };
};

const register = async (user, res) => {
  try {
    const register = new Registration({
      eventId: 19,
      type: "hackathon",
      userId: user.abacusId,
      email: user.email,
      name: "Coding-Hungama",
    });
    await register.save();

    user.registrations.push("19");
    await user.save();

    return { register: true, message: "Registration Successful" };
  } catch (err) {
    console.log(err);
    return {
      register: false,
      message: "Unable to register " + user.email + " to the hackathon",
    };
  }
};

module.exports = { validate, hackRegister };
