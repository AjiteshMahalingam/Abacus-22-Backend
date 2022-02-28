const User = require("../models/User");
const sendMail = require("../middleware/mailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const resetPassword = async(req,res) => {

    try{
        const datenow = new Date();

        const {pass, confirmPass} = req.body;
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        console.log(req.params.resetToken)
        const user = await User.findOne({ resetPasswordToken });

        if(user===null || user.resetPasswordExpireTime<datenow){
            res.status(400).send({message : "Invalid Reset Link"});
            console.log("User gave an invalid reset link")
            return;
        }

        if(pass!=confirmPass){
            res.status(400).send({message : "New password and confirm password do not match"});
            console.log("User gave an invalid new and confirm password")
            return;
        }

        console.log(pass)
        console.log(confirmPass)
        if(pass.length<7){
            res.status(400).send({message : "Password should have atleast 7 characters."})
            console.log("User's password do not meet specified conditions");
            return;
        }

        user.password = user.password = await bcrypt.hash(pass, 8);;
        user.resetPasswordToken = null;
        user.resetPasswordExpireTime = null;
        await user.save();

        await sendMail({
            subject : "Confirmation of password change",
            text : "Password for the account registered in this email has been modified.",
            html : null,
            to : user.email
        });
        console.log("Response sent to user");

        res.status(200).send({message : "Password updated. Confirmation email sent"});
    }
    catch(error){
        console.log(error)
        res.status(400).send({message : "Unable to reset password"});
    }

}

module.exports = resetPassword;