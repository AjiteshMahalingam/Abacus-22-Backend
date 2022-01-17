const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// Establishing DB Connection
require('./utils/connectDB');

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("The server is up at port " + PORT);
});