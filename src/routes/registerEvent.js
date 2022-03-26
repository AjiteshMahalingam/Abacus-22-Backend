const express = require("express");
const auth = require('../middleware/auth');
const Payment = require("../models/Payment");
const User = require("../models/User");
const Registration = require("../models/Registration");

const router = new express.Router();

router.get('/:id/add', auth, async(req,res) => {
    try
    {
        const id = req.params.id;
        const registration = await Registration.findOne({ eventId:id, email:req.user.email });
        if(registration){
            const user = await User.findOne({ email : req.user.email });
            console.log(user.cart)
            res.status(200).send("Already Registered for event");
            return;
        }

        const payment = await Payment.findOne({ email : req.user.email });
        if(payment == null)
            res.status(400).send("Event pass not retrieved");

        const user = await User.findOne({ email : req.user.email });
        user.cart.push({id});
        await user.save();

        const register = new Registration({
            eventId : id,
            email : user.email,
            isPaymentDone : true,
            paymentId : payment.paymentId
        });
        await register.save();

        console.log(user.cart);
        res.status(200).send("Event added ");
    }
    catch(err){
        console.log(err);
        res.status(400).send("Unable to register to event")
    }
});

router.get('/:id/delete', auth, async(req,res) => {
    try
    {
        const id = req.params.id;
        const registration = await Registration.findOne({ eventId:id, email:req.user.email });
        if(!registration){
            res.status(200).send("Event is not registered");
            return;
        }
        registration

        const user = await User.findOne({ email : req.user.email });
        user.cart.push({id});
        await user.save();

        

        console.log(user.cart);
        res.status(200).send("Event added ");
    }
    catch(err){
        console.log(err);
        res.status(400).send("Unable to register to event")
    }
});


module.exports = router;