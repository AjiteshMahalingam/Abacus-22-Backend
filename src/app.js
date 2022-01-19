const express = require('express');
const dotenv = require('dotenv');
const loginRouter = require('./routes/login');

dotenv.config();

// Establishing DB Connection
require('./utils/connectDB');

const app = express();
const PORT = process.env.PORT;


//for incoming JSON objects to be parsed
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use(loginRouter);

app.listen(PORT, () => {
    console.log("The server is up at port " + PORT);
});