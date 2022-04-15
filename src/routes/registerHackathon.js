const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Registration = require("../models/Registration");

const router = new express.Router();

router.post("/", auth, async (req, res) => {
  try {

    const user_one = req.body.email_one;
    const user_two = req.body.email_two;

    const registration = await Registration.findOne({
        type: "hackathon",
        email: { $in : [user_one,user_two]},
    });

    //console.log(registration)
    if (registration) {
      console.log("Registered already")
      res.status(200).send({ message: "User " + registration.email + " has been registered already" });
      return;
    }

    const User1 = verify(user_one, res);
    const User2 = verify(user_two, res);
    
    if(User1 && User2)
        if(register(User1, res)){
            
            if(register(User2, res)){
                console.log("registration Successful")
                res.status(200).send({ message: "Registration Successful" });
                return;
            }
            else
                await Registration.deleteOne({type:"hackathon",email:user_one});
        }

    return;
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Unable to register to hackathon" });
  }
});

const verify = async(email, res) => {
    const user = await User.findOne({ email });

    if(!user){
        res.status(400).send({ message: user.email + " is not a registered member" });
        return false;
    }

    if (user.hasEventPass == false) {
        res.status(400).send({ message: user.email + " has not done the payment" });
        return false;
    }

    return user;
}

const register = async(user, res) => {
    
    {
        const register = new Registration({
            eventId: "100",
            type: "hackathon",
            userId: user.abacusId,
            email: user.email,
            name: "Coding-Hungama"
        });
        await register.save();
        return true;

        // req.user.registrations.push(id);
        // await req.user.save();
    }
    // catch(err){
    //     res.status(400).send({ message: "Unable to register " + user.email + " to hackathon" });   
    //     return false;
    // }
}

module.exports = router;
