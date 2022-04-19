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
      //type: mongoose.Schema.Types.ObjectId,
      type: Number,
      //ref: "user",
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
    },

    type: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    teamId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("registration", RegistrationSchema);

module.exports = Registration;
