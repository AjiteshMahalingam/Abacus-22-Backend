const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const PaymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
    },
    paymentRequestId: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("payment", PaymentSchema);

module.exports = Payment;
