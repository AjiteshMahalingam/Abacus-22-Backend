const express = require('express');
const session = require("express-session");
/*const dotenv = require('dotenv');
dotenv.config();*/
//!! the .env wasnt loading here so I had to add the path !!
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Establishing DB Connection
require('./utils/connectDB');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({ 
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true 
}));

app.post("/forgetPassword",require("./routes/forgetPassword"));
app.put("/resetPassword/:resetToken",require("./routes/resetPassword"));

app.listen(PORT, () => {
    console.log("The server is up at port " + PORT);
});

