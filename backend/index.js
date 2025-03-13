const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cropMonitoringRoutes = require('./routes/cropMonitoring');
const pestDetectionRoutes = require('./routes/pestDetection');
const legalRoutes = require('./routes/legal');
const pricingRoutes = require('./routes/pricing');
const offlineDataRoutes = require('./routes/offlineData');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://gautam96544:Gautamkumar%409849@cluster0.9sk3p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0963.', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/crop-monitoring', cropMonitoringRoutes);
app.use('/pest-detection', pestDetectionRoutes);
app.use('/legal', legalRoutes);
app.use('/pricing', pricingRoutes);
app.use('/offline-data', offlineDataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;