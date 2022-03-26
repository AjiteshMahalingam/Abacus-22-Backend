const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const RegistrationSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String,
      ref: "payment",
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("registration", RegistrationSchema);

module.exports = Registration;
