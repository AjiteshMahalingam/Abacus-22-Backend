require("dotenv").config();
const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const router = new express.Router();

router.post("/pay", async (req, res) => {
  var headers = {
    "X-Api-Key": "d82016f839e13cd0a79afc0ef5b288b3",
    "X-Auth-Token": "3827881f669c11e8dad8a023fd1108c2",
  };
  var payload = {
    purpose: "FIFA 16",
    amount: "2500",
    phone: "9999999999",
    buyer_name: "John Doe",
    redirect_url: "http://www.example.com/redirect/",
    send_email: true,
    webhook: "http://www.example.com/webhook/",
    send_sms: true,
    email: "foo@example.com",
    allow_repeated_payments: false,
  };

  request.post(
    "https://www.instamojo.com/api/1.1/payment-requests/",
    { form: payload, headers: headers },
    function (error, response, body) {
      if (!error && response.statusCode == 201) {
        console.log(body);
      }
    }
  );
});
