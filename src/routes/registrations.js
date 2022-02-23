const express = require("express");
const Registration = require("../models/Registration");
const auth = require('../middleware/auth');

const router = new express.Router();

// @desc Get list of registered events of the user
// @route GET /user/registrations
// @access Protected
router.get('/', auth, async (req, res) => {
    try {
        const eventsReg = await Registration.find({ userId: req.user._id });
        res.status(200).send(eventsReg);
    } catch (err) {
        res.status(500).send({ 'error': err.message });
    }
});

// @desc Register user to an event upon successful payment
// @route POST /user/registrations/:eventId?<Payment related options>
// @access Protected
router.post('/:eventId', auth, async (req, res) => {
    try {
        // Payment document created from the payment options
        // Handle CEGian
        const eventReg = new Registration({
            eventId: req.params.eventId,
            userId: req.user._id
            // paymentStatus, paymentId
        });
        await eventReg.save();
        res.status(201).send({});
    } catch (err) {
        res.status(500).send({ 'error': err.message });
    }
});

module.exports = router;