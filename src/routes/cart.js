const express = require("express");
const router = new express.Router();
const auth = require('../middleware/auth');

// @desc Get cart contents
// @route GET /user/cart
// @access Protected
router.get('/', auth, async (req, res) => {
    try {
        res.status(200).send({ 'cart': req.user.cart });
    } catch (err) {
        res.status(500).send({ 'error': err.message });
    }
});

// @desc Add to cart
// @route POST /user/cart/add
// @access Protected
router.post('/add', auth, async (req, res) => {
    try {
        req.user.cart.push(req.body.eventId);
        await req.user.save();
        res.status(200).send({ 'cart': req.user.cart });
    } catch (err) {
        res.status(500).send({ 'error': err.message });
    }
});

// @desc Remove from cart
// @route POST /user/cart/remove
// @access Protected
router.post('/remove', auth, async (req, res) => {
    try {
        req.user.cart = req.user.cart.filter(eventId => eventId !== req.body.eventId);
        await req.user.save();
        res.status(200).send({ 'cart': req.user.cart });
    } catch (err) {
        res.status(500).send({ 'error': err.message });
    }
});

// @desc Clear cart contents
// @route POST /user/cart/clear
// @access Protected
router.post('/clear', auth, async (req, res) => {
    try {
        req.user.cart = [];
        await req.user.save();
        res.status(200).send({ 'cart': req.user.cart });
    } catch (err) {
        res.status(500).send({ 'error': err.message });
    }
});

module.exports = router;