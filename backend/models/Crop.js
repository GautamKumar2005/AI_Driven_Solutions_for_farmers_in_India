const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    name: String,
    health: Number,
    growthStage: String,
    nutrientDeficiency: String,
});

module.exports = mongoose.model('Crop', CropSchema);
