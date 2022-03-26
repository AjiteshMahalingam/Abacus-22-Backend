const express = require("express");
const auth = require('../middleware/auth');
const Payment = require("../models/Payment");
const crypto = require("crypto");
const router = new express.Router();

router.get('/', auth, async(req,res) => {
    console.log("hellooo")
        // if(!req.body.pay)
        //     res.status(200).send("Payment not executed")

        const payment = new Payment({
            email : req.user.email,
            name : req.user.name,
            paymentId : crypto.randomBytes(15).toString("hex"),
            amount : "300"
        });

        try{
            await payment.save();
            res.status(200).send("Payment Successful");
        }
        catch(err){
            console.log(err)
            res.status(400).send("Payment Unsuccessful");
        }

});


module.exports = router;