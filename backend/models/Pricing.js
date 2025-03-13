
const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
    crop: String,
    price: Number,
});

module.exports = mongoose.model('Pricing', PricingSchema);