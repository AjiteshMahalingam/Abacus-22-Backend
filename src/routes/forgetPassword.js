const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../middleware/mailer")

const forgetPassword = async(req,res) => {

    try{

        const datenow = Date.now();
        const email = req.body.email;
        const user = await User.findOne({ email });

        if(!user){
            res.status(400).send({message : "Email not registered"});
            return;
        }

        //allows users to generate new reset links every 2 minutes
        const time_left = Math.round((parseInt(user.resetPasswordExpireTime-datenow)/1000/60));
        if(time_left>8){
            res.status(400).send({message : "Email sent already. Try again after " + (time_left-8) + " minutes."});
            return;
        }
        const token = crypto.randomBytes(15).toString("hex");

        user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');;
        user.resetPasswordExpireTime = datenow + 10*60*1000;
        await user.save();

        const url = `${req.protocol}://localhost:3000/resetPassword/${token}` //had to change the url acc. to ther front end port

        await sendEmail({
            subject : "Request for password Reset",
            html: `<p>Use this link to reset your password <a href="${url}">Reset Password</a></p>
                   <p>Alternately you can use the following link <a href='${url}'>${url}</a></p>
                   <p>The link will expire in 10 minutes</p>`,
            to : email
        })
        console.log("Response sent to user")
        
        res.status(200).send({message : "Email sent"});
    }
    catch(error){
        console.log(error);
        res.status(400).send({message : "Unable to send mail"})
    }
}

module.exports = forgetPassword;