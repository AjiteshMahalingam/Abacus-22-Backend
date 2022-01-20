const express = require('express');
//const dotenv = require('dotenv');
//dotenv.config();
//!! the .env wasnt loading here so I had to add the path !!
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Establishing DB Connection
require('./utils/connectDB');

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("The server is up at port " + PORT);
});