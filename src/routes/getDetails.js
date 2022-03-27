const express = require("express");
const auth = require('../middleware/auth');
const Registration = require("../models/Registration");
const router = new express.Router();

router.get('/', auth, async(req,res) => {
    try
    {
        const eventList = [];
        const list = await Registration.find({email:req.user.email, type:"event"});
        for(i=0; i<list.length; i++){
            eventList.push(parseInt(list[i].eventId));
        }

        const details = {
            name : req.user.name,
            abacusId : req.user.abacusId,
            eventList : eventList
        }
        console.log(details)
        res.status(200).send({details : details});
    }
    catch(err){
        console.log(err);
        res.status(400).send("Unable to register to event")
    }
});

module.exports = router;