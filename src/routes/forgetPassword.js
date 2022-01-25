const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../middleware/mailer")

const forgetPassword = async(req,res) => {

    try{
        const datenow = Date.now();
        const email = req.body.email;
        const user = await User.findOne({ email });

        if(!user){
            res.status(400).send("Email not registered");
            return;
        }

        const token = crypto.randomBytes(15).toString("hex");

        user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');;
        user.resetPasswordExpireTime = datenow + 10*60*1000;
        await user.save();

        const url = `${req.protocol}://${req.get("host")}/resetPassword/${token}`

        await sendEmail({
            subject : "Request for password Reset",
            html: `<p>Use this link to reset your password <a href="${url}">Reset Password</a></p>
                   <p>Alternately you can use the following link <a href='${url}'>${url}</a></p>`,
            to : email
        })
        console.log("Response sent to user")
        
        res.status(200).send("Success! Email sent");
    }
    catch(error){
        console.log(error);
        res.status(400).send("Unable to send mail")
    }
}

module.exports = forgetPassword;