require("dotenv").config();
// const express = require("express");
// const auth = require("../middleware/auth");
const User = require("../models/User");
const Payment = require("../models/Payment");
// const request = require("request");
const axios = require("axios");
const { randomUUID } = require("crypto");
// const router = new express.Router();
const fs = require("fs");
const logfile = fs.createWriteStream(__dirname + "payments.log", {
  flags: "a",
});

const config = require("../data/config.json");

const headers = {
  "X-Api-Key": process.env.PAYMENT_API_KEY,
  "X-Auth-Token": process.env.PAYMENT_AUTH_TOKEN,
};

const paymentApiCall = async (eventId, user) => {
  const email = user.email;
  const name = user.name;
  const phone = user.phoneNumber;
  const amount = config[eventId].amount;
  const purpose = config[eventId].purpose;
  // const redirect_url = config[eventId].redirect_url;

  var payload = {
    purpose: purpose,
    amount: amount,
    phone: phone,
    buyer_name: name,
    redirect_url: process.env.PAYMENT_REDIRECT_URL,
    send_email: true,
    webhook: process.env.PAYMENT_WEBHOOK_URL,
    send_sms: true,
    email: email,
    allow_repeated_payments: false,
  };

  console.log(payload);

  const output = await axios
    .post("https://test.instamojo.com/api/1.1/payment-requests/", payload, {
      headers: headers,
    })
    .then((result) => {
      return {
        message: "Payment Initiated",
        body: result.data,
      };
    })
    .catch((e) => {
      return {
        message: "Payment failure",
        body: e,
      };
    });
  return output;
};

// router.post("/pay", auth, async (req, res) => {
//   console.log(req.body);
//   const id = req.body.id;
//   const email = req.user.email;
//   const name = req.user.name;
//   const phone = req.user.phone;
//   const amount = config[id].amount;
//   const purpose = config[id].purpose;
//   const redirect_url = config[id].redirect_url;
//   // const { email, buyer_name, phone, amount, purpose } = req.body;

//   var payload = {
//     purpose: purpose,
//     amount: amount,
//     phone: phone,
//     buyer_name: name,
//     redirect_url: redirect_url,
//     send_email: true,
//     webhook: process.env.PAYMENT_WEBHOOK_URL,
//     send_sms: true,
//     email: email,
//     allow_repeated_payments: false,
//   };

//   console.log(payload);
//   const payment = new Payment({
//     email,
//     name: buyer_name,
//     phone,
//     amount,
//     purpose,
//     paymentId: randomUUID(),
//   });

//   await payment.save();

//   axios.post(
//     "https://test.instamojo.com/api/1.1/payment-requests/",
//     {
//       form: payload,
//       headers: headers,
//     },
//     (err, result, body) => {
//       console.log(err);
//       console.log(result);
//       if (!err && result.statusCode == 201) {
//         console.log(body);
//         return res.send(result.body);
//       }
//     }
//   );

//   return res.status(400).send({ message: "Payment failure" });

//   // request.post(
//   //   "https://test.instamojo.com/api/1.1/payment-requests/",
//   //   { form: payload, headers: headers },
//   //   function (error, response, body) {
//   //     console.log(response);
//   //     console.log(body);
//   //     console.log(error);
//   //     if (!error && response.statusCode == 201) {
//   //       console.log(body);
//   //     }
//   //   }
//   // );
// });

const webHook = async (req, res) => {
  // router.post("/webhook", async (req, res) => {
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
};

module.exports = { paymentApiCall, webHook };
