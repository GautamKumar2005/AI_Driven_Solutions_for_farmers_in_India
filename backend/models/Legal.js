const mongoose = require('mongoose');

const LegalSchema = new mongoose.Schema({
    regulation: String,
    description: String,
});

module.exports = mongoose.model('Legal', LegalSchema);