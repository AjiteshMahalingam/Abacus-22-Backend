require("dotenv").config();
const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Payment = require("../models/Payment");
// const request = require("request");
const axios = require("axios");
const { randomUUID } = require("crypto");
const router = new express.Router();

const headers = {
  "X-Api-Key": process.env.PAYMENT_API_KEY,
  "X-Auth-Token": process.env.PAYMENT_AUTH_TOKEN,
};
router.post("/pay", async (req, res) => {
  console.log(req.body);
  const { email, buyer_name, phone, amount, purpose } = req.body;

  var payload = {
    purpose: purpose,
    amount: amount,
    phone: phone,
    buyer_name: buyer_name,
    redirect_url: "http://www.example.com/redirect/",
    send_email: true,
    webhook: process.env.PAYMENT_WEBHOOK_URL,
    send_sms: true,
    email: email,
    allow_repeated_payments: false,
  };

  console.log(payload);
  const payment = new Payment({
    email,
    name: buyer_name,
    phone,
    amount,
    purpose,
    paymentId: randomUUID(),
  });

  await payment.save();

  axios.post(
    "https://test.instamojo.com/api/1.1/payment-requests/",
    {
      form: payload,
      headers: headers,
    },
    (err, result, body) => {
      console.log(err);
      console.log(result);
      if (!err && result.statusCode == 201) {
        console.log(body);
        return res.send(result.body);
      }
    }
  );

  return res.status(400).send({ message: "Payment failure" });

  // request.post(
  //   "https://test.instamojo.com/api/1.1/payment-requests/",
  //   { form: payload, headers: headers },
  //   function (error, response, body) {
  //     console.log(response);
  //     console.log(body);
  //     console.log(error);
  //     if (!error && response.statusCode == 201) {
  //       console.log(body);
  //     }
  //   }
  // );
});

router.post("/webhook", async (req, res) => {
  const date = new Date();
  const time = date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  const paymentobject = JSON.parse(JSON.stringify(req.body));

  console.log(paymentobject);
  Payment.findOne({
    where: {
      email: paymentobject.buyer,
      purpose: paymentobject.purpose,
    },
  })
    .then((payment) => {
      if (payment) {
        payment
          .update({
            status: paymentobject.status,
            amount: paymentobject.amount,
            paymentid: paymentobject.payment_id,
            paymentrequestid: paymentobject.payment_request_id,
          })
          .then(() => {
            logfile.write(
              "\n[ " + time + " ] SUCCESS : " + JSON.stringify(paymentobject)
            );
            return res.status(200).send({});
          })
          .catch((err) => {
            logfile.write(
              "\n[ " +
                time +
                " ] ERROR : UPDATE CATCH : " +
                JSON.stringify(paymentobject) +
                " Encountered Error: " +
                err
            );
            return res.status(200).send({});
          });
      } else {
        logfile.write(
          "\n[ " +
            time +
            " ] ERROR : NOT REGISTERED : " +
            JSON.stringify(paymentobject)
        );
        return res.status(200).send({});
      }
    })
    .catch((err) => {
      logfile.write(
        "\n[ " +
          time +
          " ] ERROR : DB ACCESS : " +
          JSON.stringify(paymentobject) +
          " Encountered Error: " +
          err
      );
      return res.status(500).send({ message: "Server Error." });
    });
});

module.exports = router;
