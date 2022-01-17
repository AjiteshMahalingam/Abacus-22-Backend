const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const RegistrationSchema = new Schema({
    eventId: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    isPaymentDone: {
        type: Boolean,
        default: false
    },
    paymentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment",
    }
}, {
    timestamps: true
});

const Registration = mongoose.model('registration', RegistrationSchema);

module.exports = Registration;