const express = require("express");
const Registration = require("../models/Registration");
const User = require("../models/User");
const Payment = require("../models/Payment");
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

    const reqEvent = events.find((e) => e.id == eventid);
    if (!reqEvent) {
      res.send({ error: "Invalid event id" });
      return;
    }
    if (reqEvent.password !== password) {
      res.send({ error: "Incorrect event access credentials" });
      return;
    }

    const data = await Registration.find({ eventId: eventid });
    const users = await User.find({});
    const finalData = data.map((entry) => {
      let value = {};
      users.forEach((user) => {
        if (entry.userId === user.abacusId) {
          // console.log(entry);
          value = {
            eventId: eventid,
            eventName: reqEvent.name,
            abacusId: user.abacusId,
            type: entry.type,
            name: user.name,
            email: user.email,
            department: user.department,
            college: user.college,
            year: user.year,
          };
        }
      });

      return value;
    });

    const path = "registrations-details.csv";
    const csvWriter = csvwriter.createObjectCsvWriter({
      path: path,
      header: [
        { id: "eventId", title: "Event Id" },
        { id: "abacusId", title: "Abacus id" },
        { id: "type", title: "Type" },
        { id: "eventName", title: "Event Name" },
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "year", title: "Year" },
        { id: "department", title: "Department" },
        { id: "college", title: "College" },
      ],
    });

    res.setHeader(
      "Content-disposition",
      "attachment; filename=registrations-details.csv"
    );
    res.set("Content-Type", "text/csv");
    csvWriter.writeRecords(finalData).then(() => {
      res.download(path);
    });
  } catch (e) {
    res.send(e.message);
  }
});

router.get("/getusers", async (req, res) => {
  try {
    const key = req.query.key;

    if (key != "GKmTdDGN") {
      res.send({ error: "Incorrect event access credentials" });
      return;
    }
    const users = await User.find({});

    const path = "user-details.csv";
    const csvWriter = csvwriter.createObjectCsvWriter({
      path: path,
      header: [
        { id: "abacusId", title: "Abacus id" },
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "department", title: "Department" },
        { id: "year", title: "Year" },
        { id: "college", title: "College" },
        { id: "phoneNumber", title: "Contact" },
      ],
    });

    res.setHeader(
      "Content-disposition",
      "attachment; filename=users-details.csv"
    );
    res.set("Content-Type", "text/csv");
    csvWriter.writeRecords(users).then(() => {
      res.download(path);
    });
  } catch (e) {
    res.send(e.message);
  }
});

router.get("/getpayments", async (req, res) => {
  try {
    const key = req.query.key;

    if (key != "NqfspcLm") {
      res.send({ error: "Incorrect event access credentials" });
      return;
    }
    const payments = await Payment.find({});

    const path = "payment-details.csv";
    const csvWriter = csvwriter.createObjectCsvWriter({
      path: path,
      header: [
        { id: "paymentId", title: "Payment ID" },
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "phone", title: "Phone" },
        { id: "amount", title: "Amount" },
        { id: "purpose", title: "Purpose" },
        { id: "status", title: "Status" },
      ],
    });

    res.setHeader(
      "Content-disposition",
      "attachment; filename=payment-details.csv"
    );
    res.set("Content-Type", "text/csv");
    csvWriter.writeRecords(payments).then(() => {
      res.download(path);
    });
  } catch (e) {
    res.send(e.message);
  }
});

module.exports = router;
