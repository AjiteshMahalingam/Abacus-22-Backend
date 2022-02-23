const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    abacusId: {
      type: Number,
      default: 2022000,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowerCase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Enter valid email!!");
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      //required: true,
      trim: true,
    },
    college: {
      type: String,
      //required: true,
      trim: true,
    },
    year: {
      type: Number,
      //required: true
    },
    department: {
      type: String,
      // required: true,
      trim: true,
    },
    password: {
      type: String,
      //required: true,
      trim: true,
      minLength: 7,
    },
    verificationCode: {
      type: String,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
    isCegian: {
      type: Boolean,
    },

    resetPasswordToken: {
      type: String,
      deafult: null,
    },

    resetPasswordExpireTime: {
      type: Date,
      default: null,
    },
    cart: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.generateVerificationCode = function () {
  try {
    const code = uuidv4();
    this.verificationCode = code;
    return code;
  } catch (e) {
    throw new Error(e);
  }
};

UserSchema.methods.generateAuthtoken = async function () {
  try {
    const user = this;
    const token = await jwt.sign(
      { _id: user._id.toString() },
      process.env.jwtSecret
    );
    return token;
  } catch (e) {
    throw new Error(e);
  }
};

const User = mongoose.model("user", UserSchema);
User.createIndexes();

module.exports = User;
