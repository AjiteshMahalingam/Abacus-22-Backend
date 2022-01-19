const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


const router = new express.Router();

//written for testing login
// router.post('/signup', async(req, res) => {
//     console.log(req.body);
//     const {id, email, name, phoneNumber, college, year, department, password} = req.body;

//     const user = new User({id, email, name, phoneNumber, college, year, department, password});
//     try {
//         user.password = await bcrypt.hash(user.password, 8);
//         await user.save();
//        // const token = await user.generateAuthToken();
//         //user.tokens.push({ token });
//         //await user.save();
//         res.status(201).send({user});
//     } catch(err) {
//         console.log(err);
//         res.status(400).send(err);
//     }

// })

router.post('/login', async(req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user) 
            res.status(400).send("User not found");
        
        const token = await user.generateAuthtoken();
        user.tokens.push({ token });
        await user.save();
        
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual)
            res.status(400).send("Invalid password");
        
        console.log(user);
        res.status(200).send({ token: token });

    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
});


module.exports = router;

