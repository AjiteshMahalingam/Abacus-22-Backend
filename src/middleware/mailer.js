const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = "528292042770-j718piislbrfn3l6f01jl55fv12c6nde.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = "1//04HI3iUsCxTCOCgYIARAAGAQSNwF-L9IrBjHp14rmGHa81EKq56tc4myuKnH3AFOEa_7oX5N011SfRzAmdoaZaFS0nYr3JK8LPaU";

const createTransporter = async() => {

    console.log("Create Transporter");
    const oAuth2Client = new OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    oAuth2Client.setCredentials({refresh_token : REFRESH_TOKEN });
    
    try{
        const ACCESS_TOKEN = oAuth2Client.refreshAccessToken();
        access = (await ACCESS_TOKEN).credentials.access_token;
        console.log("Access Token : " + access);
    
    }
    catch(error){
        console.log("Access Token error : " + error);
    }

    console.log("After access token");
    const transporter = nodemailer.createTransport({
        host : "smtp.gmail.com",
        service: "gmail",
        port: 465,
        secure: true,
        //secureConnection: true,
        auth:{
            type : 'OAuth2',
            user : process.env.email,
            clientId : CLIENT_ID,
            clientSecret : CLIENT_SECRET,
            refreshToken : REFRESH_TOKEN,
            accessToken : access
        }/*,
        tls: {
            rejectUnauthorized: false
        }*/
    });
    console.log("TRANSPORTer :" + transporter);

    /*const transporter = nodemailer.createTransport({
        host : "smtp.gmail.com",
        port : 587,
        auth: {
            user : process.env.email,
            pass : process.env.pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    console.log("TRANSPORTER : " + transporter);*/

    return transporter;
};

async function sendMail(emailOptions){
    try{
        console.log("Inside sendMail");
        const emailtransporter = await createTransporter();
        const result = await emailtransporter.sendMail(emailOptions);
        console.log("Mail Sent : " + result);
    }

    catch(error){
        console.log(error);
        console.log("Unable to send mail");
    }
}

sendMail({
  subject: "Test",
  text: "I am sending an email from nodemailer!",
  to: "diyadhan01@gmail.com",
  from: process.env.email
});