const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const RegistrationSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      trim: true,
    },

    abacusID: {
      type: Number,
      default: 2022000,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
    },
    // paymentId: {
    //   type: String,
    //   ref: "payment",
    // },

    type: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("registration", RegistrationSchema);

module.exports = Registration;
