const express = require("express");
const auth = require("../middleware/auth");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Registration = require("../models/Registration");
const paymentApiCall = require("../routes/payment").paymentApiCall;

const router = new express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const eventsReg = await Registration.find({ userId: req.user._id });
    return res.status(200).send(eventsReg);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

router.put("/event/:id", auth, async (req, res) => {
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

    if (req.user.hasEventPass == false) {
      res.status(400).send({ message: "Event pass not retrieved" });
      return;
    }
    try {
      const register = new Registration({
        eventId: id,
        abacusId: req.user.abacusId,
        email: req.user.email,
        type: "event",
      });

      await register.save();

      req.user.registrations.push(id);
      req.user.save();

      return res.status(200).send({ message: "Event Successfully Registered" });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: "Unable to register to event" });
    }
    return res
      .status(200)
      .send({ message: "Event added for " + req.user.email });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Unable to register to event" });
  }
});

router.put("/eventpass", auth, async (req, res) => {
  if (req.user.isCegian === true) {
    req.user.hasEventPass = true;
    req.user.save();
    return res.status(200).send({
      message: "Event Pass Obtained",
    });
  } else {
    const result = await paymentApiCall(0, req.user);
    console.log(result);
    if (
      result.message === "Payment Initiated" &&
      result.body.success === true
    ) {
      const details = result.body.payment_request;
      const payment = new Payment({
        email: details.email,
        name: details.buyer_name,
        phone: details.phone,
        amount: details.amount,
        purpose: details.purpose,
        paymentId: details.id,
      });

      await payment.save();
      return res.status(200).send({ ...result });
      // res.redirect(result.body.payment_request.long_url);
    }
    // return res.send(result);
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
