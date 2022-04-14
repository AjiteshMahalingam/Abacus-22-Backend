const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Registration = require("../models/Registration");

const router = new express.Router();

router.put("/:id/:name", auth, async (req, res) => {
  try {

    const id = req.params.id;
    const name = req.params.name;
    const registration = await Registration.findOne({
      eventId: id,
      email: req.user.email,
    });

    if (registration) {
      console.log("Registered already")
      res.status(200).send({ message: "Already Registered for event" });
      return;
    }

    if (req.user.hasEventPass == false) {
      console.log("Not paid")
      res.status(400).send({ message: "Payment not done for events" });
      return;
    }

    const register = new Registration({
      eventId: id,
      type: "event",
      userId: req.user.abacusId,
      email: req.user.email,
      name: name
    });
    await register.save();

    req.user.registrations.push(id);
    await req.user.save();

    console.log("registration Successful")
    res.status(200).send({ message: "Registration Successful" });
    return;
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Unable to register to event" });
  }
});

// router.get('/:id/delete', auth, async(req,res) => {
//     try
//     {
//         const id = req.params.id;
//         const registration = await Registration.findOne({ eventId:id, email:req.user.email });
//         if(!registration){
//             res.status(200).send("Event is not registered");
//             return;
//         }

//         registration.remove();

//         res.status(200).send("Event deleted");
//         console.log("Event deleted for " + req.user.email)
//     }
//     catch(err){
//         console.log(err);
//         res.status(400).send("Unable to register to event")
//     }
// });

module.exports = router;
