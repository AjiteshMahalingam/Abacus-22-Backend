const express = require("express");
const auth = require("../middleware/auth");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Registration = require("../models/Registration");

const router = new express.Router();

router.put("/:id/add", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const registration = await Registration.findOne({
      eventId: id,
      email: req.user.email,
    });
    if (registration) {
      res.status(200).send({ message: "Already Registered for event" });
      return;
    }

    const user = await User.findOne({ email: req.user.email });
    if (user.hasEventPass == false) {
      res.status(400).send({ message: "Event pass not retrieved" });
      return;
    }

    const register = new Registration({
      eventId: id,
      abacusId: user.abacusId,
      email: user.email,
      type: "event",
    });
    await register.save();

    res.status(200).send({ message: "Event added for " + req.user.email });
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
