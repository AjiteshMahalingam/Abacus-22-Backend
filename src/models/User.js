const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('json-web-token');
const validator = require('validator');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    abacusId: {
        type: Number,
        default: 2022000
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowerCase: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("Enter valid email!!");
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    college: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    regList: [{
        eventId: {
            type: String
        },
        isPaymentDone: {
            type: Boolean,
            default: false
        }
    }],
    isCegian : {
        type: Boolean
    },
    
    resetPasswordToken: {
        type: String,
        deafult : null 
    },

    resetPasswordExpireTime: {
        type: Date,
        default : null
    }

}, {
    timestamps: true
  });


UserSchema.methods.generateAuthtoken = async function () {
    try {
        const user = this;
        const token = await jwt.sign({_id : user._id.toString()}, process.env.jwtSecret);
        return token;
    } catch (e) {
        throw new Error(e);
    }
};

const User = mongoose.model('user', UserSchema);
User.createIndexes();

module.exports = User;