require("dotenv").config();
// const express = require("express");
// const auth = require("../middleware/auth");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Registration = require("../models/Registration");
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

const paymentApiCall = async (eventId, eventName, user) => {
  const email = user.email;
  const name = user.name;
  const phone = user.phoneNumber;
  const amount = config[eventId].amount;
  const purpose = config[eventId].purpose;
  // const redirect_url = config[eventId].redirect_url;

  var payload = {
    purpose: purpose + " - " + eventName, //to differentiate workshop payments
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
    .post(process.env["PAYMENT_API_URL"] + "/payment-requests/", payload, {
      headers: headers,
    })
    .then((result) => {
      return {
        message: "Payment Initiated",
        body: result.data,
      };
    })
    .catch((e) => {
      console.log("Error: ");
      console.log(e.response.data);
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
  const out = await axios
    .get(
      process.env["PAYMENT_API_URL"] +
        "/payments/" +
        paymentobject.payment_id +
        "/",
      {
        headers: headers,
      }
    )
    .then(async (response) => {
      if (
        response.data.success != undefined &&
        response.data.success === true
      ) {
        const payment = await Payment.findOne({
          email: paymentobject.buyer,
          purpose: paymentobject.purpose,
        });

        payment.status = response.data.payment.status;
        payment.amount = response.data.payment.amount;
        payment.paymentId = response.data.payment.payment_id;

        await payment.save();

        if (payment.purpose === "Workshop - stock-o-nomics") {
          try {
            const user = await User.findOne({
              email: response.data.payment.buyer_email,
            });
            if (user) {
              const register = new Registration({
                eventId: 16,
                type: "workshop",
                userId: user.abacusId,
                email: user.email,
                name: payment.purpose,
              });
              console.log(user.email);
              console.log("before register");
              await register.save();
              console.log("after register");
              user.workshops.push("16");
              await user.save();
              logfile.write(
                "\n[ " + time + " ] SUCCESS : " + JSON.stringify(paymentobject)
              );
              return {
                status: 200,
                message: "Payment done and registrations added",
              };
            } else {
              logfile.write(
                "\n[ " +
                  time +
                  " ] ERROR : UNAUTHORIZED PAYMENT : " +
                  JSON.stringify(paymentobject)
              );
              return { status: 401, message: "Unauthorized Payment" };
            }
          } catch (err) {
            console.log(err);
            logfile.write(
              "\n[ " +
                time +
                " ] ERROR : UPDATE CATCH : " +
                JSON.stringify(paymentobject) +
                " Encountered Error: " +
                err
            );
            return { status: 400, message: "Unauthorized Payment" };
          }
        }
        return { status: 200, message: "Payment done" };
      } else {
        logfile.write(
          "\n[ " +
            time +
            " ] ERROR : NOT REGISTERED : " +
            JSON.stringify(paymentobject)
        );
        return { status: 400, message: "Payment not yet done" };
      }
    })
    .catch((err) => {
      return err;
    });

  console.log(out);
  return res.send(out);
  // return res.status(out.status).send(out.data);
  // const payment = await Payment.findOne({
  //   email: paymentobject.buyer,
  //   purpose: paymentobject.purpose,
  // });

  // console.log(payment);
  /*
    .then((payment) => {
      console.log(payment);
      if (payment) {
        payment
          .update({
            status: paymentobject.status,
            amount: paymentobject.amount,
            paymentId: paymentobject.payment_id,
            paymentRequestId: paymentobject.payment_request_id,
          })
          .then(async () => {
            // if (paymentobject.purpose === `${config[eventId].purpose} - ${eventName}`) {
            //   const user = await User.findOne({ email: paymentobject.buyer });
            //   user.hasEventPass = true;
            //   user.save();
            // }

            // console.log(payment);

            if (paymentobject.purpose.includes("Workshop")) {
              const user = await User.findOne({ email: paymentobject.buyer });

              const register = new Registration({
                eventId: id,
                type: "workshop",
                userId: user.abacusId,
                email: user.email,
                name: purpose,
              });
              await register.save();

              req.user.workshops.push(id);
              await req.user.save();
            }
            logfile.write(
              "\n[ " + time + " ] SUCCESS : " + JSON.stringify(paymentobject)
            );
            return res.status(200).send({ message: "Payment Received" });
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

    */
};

const paymentConfirmation = async (req, res) => {
  const out = await axios
    .get(
      process.env["PAYMENT_API_URL"] + "/payments/" + req.body.paymentId + "/",
      {
        headers: headers,
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
  return res.send(out);
};

module.exports = { paymentApiCall, webHook, paymentConfirmation };
