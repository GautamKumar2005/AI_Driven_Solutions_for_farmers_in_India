const express = require('express');
const Legal = require('../models/Legal');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const legalInfo = await Legal.find();
        res.status(200).json(legalInfo);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const legal = new Legal({
        regulation: req.body.regulation,
        description: req.body.description,
    });

    try {
        const newLegal = await legal.save();
        res.status(201).json(newLegal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;