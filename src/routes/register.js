const express = require("express");
const auth = require("../middleware/auth");

const Registration = require("../models/Registration");
const paymentApiCall = require("./payment").paymentApiCall;
const Payment = require("../models/Payment");
const {validate, hackRegister} = require("./registerHackathon.js")

const router = new express.Router();

router.get("/", auth, async (req, res) => {
  try {
    // const eventsReg = await Registration.find({ userId: req.user._id });
    // console.log(eventsReg);
    return res.status(200).send({
      registrations: req.user.registrations,
      hasEventPass: req.user.hasEventPass,
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

router.put("/event/:id/:name", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    const registration = await Registration.findOne({
      eventId: id,
      email: req.user.email,
    });

    if (registration) {
      //console.log("Registered already");
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
        type: "event",
        userId: req.user.abacusId,
        email: req.user.email,
        name: name,
      });
      await register.save();

      req.user.registrations.push(id);
      await req.user.save();

      console.log("registration Successful");
      res.status(200).send({ message: "Registration Successful" });
      return;
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: "Unable to register to event" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "Unable to register to event" });
  }
});

router.put("/eventpass", auth, async (req, res) => {
    req.user.hasEventPass = true;
    req.user.save();
    return res.status(200).send({
      message: "Event Pass Obtained",
    });
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
        status: "Not Paid",
      });

      await payment.save();
      return res.status(200).send({ ...result });
      // res.redirect(result.body.payment_request.long_url);
    }
    // return res.send(result);
  }
});

router.post("/hackathon", auth, async (req, res) => {
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

module.exports = router;
