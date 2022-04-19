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

const { paymentConfig, purposeConfig } = require("../data/config");

const headers = {
  "X-Api-Key": process.env.PAYMENT_API_KEY,
  "X-Auth-Token": process.env.PAYMENT_AUTH_TOKEN,
};

const paymentApiCall = async (eventId, eventName, user) => {
  const email = user.email;
  const name = user.name;
  const phone = user.phoneNumber;
  const amount = paymentConfig[eventId].amount;
  const purpose = paymentConfig[eventId].purpose;
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

const webHook = async (req, res) => {
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

        if (purposeConfig[payment.purpose] != undefined) {
          try {
            const user = await User.findOne({
              email: response.data.payment.buyer_email,
            });
            if (user) {
              const eventId = purposeConfig[payment.purpose].eventId;
              const register = new Registration({
                eventId: eventId,
                type: purposeConfig[payment.purpose].type,
                userId: user.abacusId,
                email: user.email,
                name: payment.purpose,
              });
              console.log(user.email);
              await register.save();
              user.workshops.push(String(eventId));
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
            return { status: 401, message: "Unauthorized Payment" };
          }
        } else {
          logfile.write(
            "\n[ " +
              time +
              " ] ERROR : UPDATE CATCH : " +
              JSON.stringify(paymentobject) +
              " Encountered Error: " +
              err
          );
          return { status: 401, message: "Unauthorized Payment" };
        }
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
