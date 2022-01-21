const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const gSignIn = require('./gSignIn');
const router = new express.Router();
require('../middleware/gAuth')(passport);



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




//normal login
router.post('/login', async(req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user) 
            res.status(400).send("User not found");
        
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual)
            res.status(400).send("Invalid password");
        
        const token = await user.generateAuthtoken();
        user.tokens.push({ token });
        await user.save();
        
        console.log(user);
        res.status(200).send({ token: token });

    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
});


//gLogin
router.get("/login/google",
        passport.authenticate("google", { 
                scope : ["profile", "email"] 
        })
);

router.get("/login/google/redirect",
        passport.authenticate("google", { 
                failureRedirect: "/gautherror" 
        }), 
        (err, req, res, next) => {
            if(err) {
                console.log(err); console.log("")
                res.redirect("/login/google");
        } else {
            next();
        }
    },
    gSignIn.googleSignin
        
        
);

router.get("/gautherror", async(req, res) => {
    res.status(401).send({error: "Google authentication error"});
});

module.exports = router;

