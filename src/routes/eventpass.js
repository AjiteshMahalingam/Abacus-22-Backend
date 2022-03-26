const express = require("express");
const auth = require('../middleware/auth');
const Payment = require("../models/Payment");
const crypto = require("crypto");

const router = new express.Router();
router.get('/', auth, async (req, res) => {
    try{

        const pay = await Payment.findOne({email : req.user.email});
        if(pay){
            res.status(200).send("Event pass retrieved already")
            return;
        }

        const payment = new Payment({
            email : req.user.email,
            name : req.user.name,
            paymentId : crypto.randomBytes(15).toString("hex"),
            amount : "300"
        });

        try{
            await payment.save();
        }
        catch(err){
            console.log(err)
            res.status(400).send("Payment Unsuccessful");
        }

        let details = {
            email : req.user.email,
            name : req.user.name,
            amount : "300",
            paymentId : payment.paymentId
        }
        res.status(200).send(details)
    }
    catch(err){
        res.status(400).send("Error : " , err)
    }
});

module.exports = router;