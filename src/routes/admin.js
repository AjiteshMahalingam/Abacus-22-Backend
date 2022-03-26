const express = require("express");
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");
const csvwriter = require("csv-writer");

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

    // const csvString = [
    //   ["ID", "Event ID", "User ID", "Type", "Payment Done", "Payment ID"],
    //   ...data.map((item) => [item._id.toString(), item.eventId, item.userId, item.type, item.isPaymentDone, item.paymentId]),
    // ]
    //   .map((e) => e.join(","))
    //   .join("\n");

    // console.log(csvString);

    const path = "registrations-details.csv";
    const csvWriter = csvwriter.createObjectCsvWriter({
      path: path,
      header: [
        { id: "_id", title: "ID" },
        { id: "eventId", title: "Event id" },
        { id: "userId", title: "User id" },
        { id: "type", title: "Type" },
        { id: "isPaymentDone", title: "Payment done" },
        { id: "paymentId", title: "Payment Id" },
      ],
    });

    res.setHeader(
      "Content-disposition",
      "attachment; filename=registrations-details.csv"
    );
    res.set("Content-Type", "text/csv");
    csvWriter.writeRecords(userLogsArray).then(() => {
      res.download(path);
    });
  } catch (e) {
    res.send(e.message);
  }
});

module.exports = router;
