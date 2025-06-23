require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const path = require('path');
const http = require("http");
const socketIo = require("socket.io");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const TelegramBot = require('node-telegram-bot-api');

// Importing routes
const signupRoutes = require('./routes/signup');
const cropMonitoringRoutes = require('./routes/cropMonitoring');
const pestDetectionRoutes = require('./routes/pestDetection');
const offlineDataRoutes = require('./routes/offlineData');
const droneRoutes = require("./routes/drone");

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Telegram Bot Setup
// const token = process.env.TELEGRAM_BOT_TOKEN; // Securely load token from environment variables
// const bot = new TelegramBot(token, { polling: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Log environment variables (for debugging purposes)
console.log('Serving static files from:', path.join(__dirname, 'uploads'));
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('MONGO_URI:', process.env.MONGO_URI);

// Securely load API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/signup', signupRoutes);
app.use('/crop-monitoring', cropMonitoringRoutes);
app.use('/pest-detection', pestDetectionRoutes);
app.use('/offline-data', offlineDataRoutes);

// Attach `io` to droneRoutes
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use("/api/drone", droneRoutes);

// Telegram Bot Commands
// bot.onText(/\/start/, (msg) => {
//     bot.sendMessage(msg.chat.id, 'Welcome to My Farmer Bot! Use /crop_monitoring or /pest_detection to get started.');
// });

// bot.onText(/\/crop_monitoring/, (msg) => {
//     bot.sendMessage(msg.chat.id, 'Please send an image for crop monitoring.');
// });

// bot.onText(/\/pest_detection/, (msg) => {
//     bot.sendMessage(msg.chat.id, 'Please send an image for pest detection.');
// });

// bot.on('photo', async (msg) => {
//     const fileId = msg.photo[msg.photo.length - 1].file_id;

//     // Get the file URL from Telegram
//     const fileUrl = await bot.getFileLink(fileId);

//     // Send the file URL to your backend for processing
//     const response = await axios.post('http://localhost:5000/crop-monitoring', {
//         imageUrl: fileUrl,
//     });

//     const result = response.data;

//     // Send the result back to the user
//     bot.sendMessage(msg.chat.id, `Processing complete: ${JSON.stringify(result)}`);
// });

// Route to scrape article content
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

// Route for chatbot
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
    let browser;
    try {
        console.log(`Navigating to ${url}`);

        // Launch browser with additional options for stability
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            defaultViewport: { width: 1280, height: 800 },
        });

        const page = await browser.newPage();

        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to the page with extended timeout
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for 5 seconds to ensure dynamic content loads
        await new Promise(resolve => setTimeout(resolve, 5000)); // Replace waitForTimeout

        let pricingData = [];

        // Check if iframe exists
        const frameHandle = await page.$('iframe');
        if (frameHandle) {
            console.log('Iframe found, attempting to scrape inside iframe');
            const frame = await frameHandle.contentFrame();

            // Wait for table inside iframe
            try {
                await frame.waitForSelector('.table-responsive table', { timeout: 30000 });
                pricingData = await frame.evaluate(() => {
                    const data = [];
                    const table = document.querySelector('.table-responsive table');
                    if (!table) return data;

                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 4) {
                            const crop = cells[1].innerText.trim();
                            const price = cells[3].innerText.trim();
                            data.push({ crop, price });
                        }
                    });
                    return data;
                });
            } catch (err) {
                console.error('Error scraping iframe table:', err.message);
            }
        } else {
            console.log('No iframe found, attempting to scrape main page');
            // Try scraping table directly on the main page
            try {
                await page.waitForSelector('.table-responsive table', { timeout: 30000 });
                pricingData = await page.evaluate(() => {
                    const data = [];
                    const table = document.querySelector('.table-responsive table');
                    if (!table) return data;

                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 4) {
                            const crop = cells[1].innerText.trim();
                            const price = cells[3].innerText.trim();
                            data.push({ crop, price });
                        }
                    });
                    return data;
                });
            } catch (err) {
                console.error('Error scraping main page table:', err.message);
            }
        }

        if (pricingData.length === 0) {
            console.warn('No pricing data found. Dumping page content for debugging.');
            const pageContent = await page.content();
            console.log('Page HTML:', pageContent.substring(0, 1000)); // Log first 1000 chars
        } else {
            console.log('Pricing data scraped successfully:', pricingData);
        }

        await browser.close();
        return pricingData;
    } catch (error) {
        console.error('Error in scrapePricingInfo:', error.message);
        if (browser) await browser.close();
        throw error;
    }
}

// Express route
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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

module.exports = app;