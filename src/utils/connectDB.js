const mongoose = require('mongoose');
const User = require("../models/User");

mongoose.connect(process.env.DB_URL, {
        useNewUrlParser : true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('MongoDB Connected…')
    })
