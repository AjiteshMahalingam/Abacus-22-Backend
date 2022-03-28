const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const RegistrationSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
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
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("registration", RegistrationSchema);

module.exports = Registration;
