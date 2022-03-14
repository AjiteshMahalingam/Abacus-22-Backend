const express = require("express");
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");

const router = new express.Router();

// const events = [
//     {
//         id: 'OSPC',
//         password: 'asdfg1234'
//     },
//     {
//         id: 'HW',
//         password: 'qwtop0987'
//     },
//     {
//         id: 'CFQ',
//         password: 'mnbvc4567'
//     }
// ];

const events = require("../data/events.json");
// GET /admin/getdata?event={}&password={}
// Needs to be a protected route
router.get("/getdata", async (req, res) => {
  try {
    const eventid = req.query.event;
    const password = req.query.password;

    const reqEvent = events.find((e) => e.id === eventid);
    if (!reqEvent) {
      res.send({ error: "Invalid event id" });
      return;
    }
    if (reqEvent.password !== password) {
      res.send({ error: "Incorrect event access credentials" });
      return;
    }

    const data = await Registration.find({ eventId: eventid });
    res.send(data);
  } catch (e) {
    res.send(e.message);
  }
});

module.exports = router;
