
const express = require('express');
const Pricing = require('../models/Pricing');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const pricingInfo = await Pricing.find();
        res.status(200).json(pricingInfo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const pricing = new Pricing({
        crop: req.body.crop,
        price: req.body.price,
    });

    try {
        const newPricing = await pricing.save();
        res.status(201).json(newPricing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;