const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Registration = require("../models/Registration");

const router = new express.Router();

router.post("/", auth, async (req, res) => {
  try {

    const user_one = req.body.email_one;
    const user_two = req.body.email_two;

    if(!user_one || !user_two)
        return res.status(400).send({ message : "Two participants are needed to register for the hackathon" })

    if(user_one == user_two)
        return res.status(400).send({ message : "Please enter two different emails ids" })

    const registration = await Registration.findOne({
        type: "hackathon",
        email: { $in : [user_one,user_two]},
    });

    if (registration) {
      console.log("Registered already")
      res.status(200).send({ message: "User " + registration.email + " has been registered already" });
      return;
    }

    const user_details = await validate(user_one,user_two);
    if(user_details.valid == false)
        return res.status(400).send({ message : user_details.message })
    
    const registration_details = await hackRegister(user_details.user1,user_details.user2);
    return res.status(registration_details.status).send({ message:registration_details.message });   

  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Unable to register to hackathon" });
  }
});

const validate = async(user_one,user_two) => {
    const User1 = await verify(user_one);
        if(User1.verify==false)
            return {valid:false, message:User1.message};
    const User2 = await verify(user_two);
        if(User2.verify==false)
            return {valid:false, message:User2.message};

    return {valid:true, user1:User1.user, user2:User2.user};
}

const hackRegister = async(user_one,user_two) => {

    var status = 200;
    const User1_registration = await register(user_one);
    if(User1_registration.register){
        
        const User2_registration = await register(user_two)

        if (!User2_registration.register){
            await Registration.deleteOne({type:"hackathon",email:user_one});
            status = 400;
        }
        return { status:status, message:User2_registration.message };
    }
    else{
        status = 400;
        return { status:status, message:User1_registration.message};
    }
}

const verify = async(email) => {
    const user = await User.findOne({ email });

    if(user==null)
        return {verify:false, message: email + " is not a registered user"};

    if (user.hasEventPass == false) 
        return {verify:false, message: user.name + " < " + user.email + " > " + " has not acquired event pass"};

    return {verify:true, user:user};
}

const register = async(user, res) => {
    try
    {
        const register = new Registration({
            eventId: "100",
            type: "hackathon",
            userId: user.abacusId,
            email: user.email,
            name: "Coding-Hungama"
        });
        await register.save();

        user.registration.push("100");
        await user.save();

        return { register:true, message:"Registration Successful" };
    }
    catch(err){
        return { register:false, message:"Unable to register " + user.email + " to the hackathon" };
    }
}

module.exports = router;
