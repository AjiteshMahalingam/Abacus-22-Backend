const express = require("express");
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");

const router = new express.Router();

// @desc Get list of registered events of the user
// @route GET /user/registrations
// @access Protected
router.get("/", auth, async (req, res) => {
  try {
    const eventsReg = await Registration.find({ userId: req.user._id });
    res.status(200).send(eventsReg);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// @desc Register user to an event upon successful payment
// @route POST /user/registrations/event/:eventId?<Payment related options>
// @access Protected
router.post("/event/:eventId", auth, async (req, res) => {
  try {
    if (req.user.isCegian) {
      const eventReg = new Registration({
        eventId: req.params.eventId,
        userId: req.user._id,
        type: "event",
        paymentStatus: true,
      });
      await eventReg.save();
      res.status(201).send({ message: "Event registration successfull" });
    } else {
      const eventReg = new Registration({
        eventId: req.params.eventId,
        userId: req.user._id,
        type: "event",
        // paymentStatus, paymentId
      });
      await eventReg.save();
      res.status(201).send({ message: "Event registration successfull" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// @desc Register user to an workshop upon successful payment
// @route POST /user/registrations/workshop/:wId?<Payment related options>
// @access Protected
router.post("/workshop/:wId", auth, async (req, res) => {
  try {
    const wReg = new Registration({
      eventId: req.params.wId,
      userId: req.user._id,
      type: "workshop",
      // payment
    });
    await wReg.save();
    res.status(201).send({ message: "Workshop registration successfull" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
