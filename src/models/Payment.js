const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const PaymentSchema = new Schema({
    paymentId: {
        type: String,
        required: true
    },
    paymentRequestId: {
        type: String
    },
    status: {
        type: String
    },
    purpose: {
        type: String
    },
    amount: {
        type: Number
    },
    name: {
        type: String
    },
    email: {
        type: String
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('payment', PaymentSchema);

module.exports = Payment;