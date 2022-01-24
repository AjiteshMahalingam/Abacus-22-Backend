const express = require('express');
const dotenv = require('dotenv');
const auth = require('./middleware/auth');
dotenv.config();

// Establishing DB Connection
require('./utils/connectDB');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send('Successfully logged out');
    } catch (e) {
        res.status(500).send();
    }
});

app.listen(PORT, () => {
    console.log("The server is up at port " + PORT);
});