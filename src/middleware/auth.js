const jwtExp = require('express-jwt');
const jwt = require('json-web-token');
const User = require('../models/User');

const auth = async (req, res, next) => {
    // To retreive jwt from cookie
    jwtExp({
        secret: process.env.jwtSecret,
        algorithms: ['RS256'],
        getToken: req => req.cookies.token
    });

    try{
        const decoded = jwt.verify(req.cookies.token, process.env.jwtSecret);
        var isAuth = false;
        const user = await User.findById(decoded._id);
        user.tokens.map(token => {
            if (token.token === req.cookies.token )
                isAuth = true;
        })
        req.isAuth = isAuth;
        req.decoded = decoded;
        next();
    } catch(e) {
        res.send(e);
    }
};

module.exports = auth;