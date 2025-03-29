require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Importing routes
const cropMonitoringRoutes = require('./routes/cropMonitoring');
const pestDetectionRoutes = require('./routes/pestDetection');
const offlineDataRoutes = require('./routes/offlineData');

const app = express();
const PORT = process.env.PORT || 5000;

// Securely load API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());

const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
console.log('Serving static files from:', uploadsDir);

// Log environment variables (for debugging purposes)
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('MONGO_URI:', process.env.MONGO_URI);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/crop-monitoring', cropMonitoringRoutes);
app.use('/pest-detection', pestDetectionRoutes);
app.use('/offline-data', offlineDataRoutes);

app.get('/scrape', async (req, res) => {
    try {
        const url = 'https://ourworldindata.org/agricultural-production';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const articleContent = $('article').html(); // Extract <article> content

        if (!articleContent) {
            return res.status(404).json({ error: 'No <article> tag found' });
        }

        res.json({ article: articleContent });
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({ error: 'Error scraping data', details: error.message });
    }
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
  
    try {
        const model = await genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const chatSession = await model.startChat({ generationConfig: { temperature: 0.8 } });
        const result = await chatSession.sendMessage(userMessage);
  
        let botReply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand that.";
  
        // Improve readability: Add Markdown-style formatting
        botReply = formatResponse(botReply);
  
        res.json({ reply: botReply });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ reply: 'Error processing request.' });
    }
});
  
// Function to format Gemini's response for better readability
const formatResponse = (response) => {
    return response
        .replace(/\*\*(.*?)\*\*/g, '🌟 *$1*') // Bold text becomes highlighted
        .replace(/(\n)+/g, '\n\n') // Ensure spacing for better readability
        .replace(/^- /gm, '✅ ') // Convert bullet points to checkmarks
        .replace(/\*\s/g, '➡️ ') // Convert asterisks to right arrows
        .trim();
};

// Scrape pricing info from PIB website
async function scrapePricingInfo() {
    const url = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2112407';
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const pricingData = await page.evaluate(() => {
        const rows = document.querySelectorAll('.table-responsive table tbody tr');
        if (!rows || rows.length === 0) {
            console.error('No rows found in the table');
            return [];
        }

        const data = [];

        rows.forEach(row => {
            try {
                const cells = row.querySelectorAll('td');
                if (cells.length > 1) {
                    const crop = cells[1] ? cells[1].innerText.trim() : 'Unknown';
                    const price = cells[3] ? cells[3].innerText.trim() : 'Unknown';
                    data.push({ crop, price });
                } else {
                    console.error('Not enough cells in row');
                }
            } catch (error) {
                console.error('Error processing row:', error);
            }
        });

        console.log('Scraped data:', data);
        return data;
    });

    await browser.close();
    return pricingData;
}

app.get('/pricing-info', async (req, res) => {
    try {
        console.log('Scraping pricing info...');
        const data = await scrapePricingInfo();
        console.log('Scraped data:', data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching pricing info:', error);
        res.status(500).json({ error: 'Error fetching pricing info' });
    }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

module.exports = app;