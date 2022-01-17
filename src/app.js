const express = require('express');

// Establishing DB Connection
require('./utils/connectDB');

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log("The server is up at port " + PORT);
});