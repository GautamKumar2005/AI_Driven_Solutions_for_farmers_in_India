
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const FormData = require('form-data');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Importing routes
const signupRoutes = require('./routes/signup');
const cropMonitoringRoutes = require('./routes/cropMonitoring');
const pestDetectionRoutes = require('./routes/pestDetection');
const offlineDataRoutes = require('./routes/offlineData');
const droneRoutes = require('./routes/drone');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Telegram Bot setup
require('dotenv').config();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in .env');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

// Mock farmer data
const farmers = [
  {
    id: 1,
    name: 'Ramesh Patel',
    crops: [
      { name: 'Wheat', yield: 500, price: 2200 },
      { name: 'Rice', yield: 300, price: 2500 },
    ],
  },
  {
    id: 2,
    name: 'Sita Devi',
    crops: [
      { name: 'Rice', yield: 400, price: 2400 },
      { name: 'Maize', yield: 200, price: 1800 },
    ],
  },
  {
    id: 3,
    name: 'Vikram Singh',
    crops: [
      { name: 'Wheat', yield: 600, price: 2100 },
      { name: 'Millets', yield: 150, price: 3000 },
    ],
  },
];

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Log environment variables
console.log('Serving static files from:', path.join(__dirname, 'Uploads'));
console.log('MONGO_URI:', process.env.MONGO_URI ? '[SET]' : '[NOT SET]');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '[SET]' : '[NOT SET]');

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/signup', signupRoutes);
app.use('/crop-monitoring', cropMonitoringRoutes);
app.use('/pest-detection', pestDetectionRoutes);
app.use('/offline-data', offlineDataRoutes);

// Attach io to droneRoutes
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/drone', droneRoutes);

// Mock API endpoints for Telegram bot
app.get('/api/pest-detection', (req, res) => {
  res.json({ message: 'Pest Detection: Send an image to identify pests.' });
});

app.get('/api/crop-monitoring', (req, res) => {
  res.json({ message: 'Crop Monitoring: Check soil health and crop status.' });
});

app.get('/api/community', (req, res) => {
  res.json({ message: 'Community: Join discussions with other farmers.' });
});

app.get('/api/buyer-connection', (req, res) => {
  res.json({ farmers });
});

app.get('/api/chat/:farmerId', (req, res) => {
  const farmer = farmers.find((f) => f.id === parseInt(req.params.farmerId));
  if (farmer) {
    res.json({ message: `Start chatting with ${farmer.name}` });
  } else {
    res.status(404).json({ error: 'Farmer not found' });
  }
});

// Chatbot route
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: 'Message is required.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = "gemini-1.5-flash";

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent([
      {
        text: "You are a helpful assistant. Respond to the following user message: " + userMessage,
      },
    ]);

    let botReply = result.response.text().trim();

    // Format response to match previous style
    botReply = botReply
      .replace(/\*\*(.*?)\*\*/g, '🌟 *$1*')
      .replace(/(\n)+/g, '\n\n')
      .replace(/^- /gm, '✅ ')
      .replace(/\*\s/g, '➡️ ')
      .trim();

    return res.json({ reply: botReply });
  } catch (error) {
    console.error('Error generating response:', error.message, error.stack);
    return res.status(500).json({ reply: 'Error processing request.' });
  }
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Welcome to AgriMarketBot! Use these commands:\n' +
      '/pestdetection - Pest detection tool (send an image)\n' +
      '/cropmonitoring - Crop health monitoring\n' +
      '/community - Join the community\n' +
      '/buyerconnection - Find farmers\n' +
      '/chat <farmerId> - Chat with a farmer (e.g., /chat 1)'
  );
});

bot.onText(/\/pestdetection/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please send an image of the affected crop for pest detection.');
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  try {
    const fileId = msg.photo[msg.photo.length - 1].file_id; // Highest resolution
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    console.log('Downloading image from:', fileUrl);

    // Download the image
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Prepare form-data for /pest-detection
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: `pest-${Date.now()}.jpg`,
      contentType: 'image/jpeg',
    });

    // Send to /pest-detection route
    const pestResponse = await axios.post('http://localhost:5000/pest-detection', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const result = pestResponse.data;
    console.log('Pest Detection Result:', JSON.stringify(result, null, 2));

    // Format response
    let message = 'Pest Detection Result:\n';
    if (result.error) {
      message += `Error: ${result.error}\nDetails: ${result.details || 'No details provided'}`;
    } else {
      message += `Pesticide Detected: ${result.pesticide_detected ? 'Yes' : 'No'}\n`;
      if (result.pesticide_detected) {
        message += `Pesticide: ${result.pesticide_name || 'Unknown'}\n`;
        message += `Confidence: ${((result.confidence || 0) * 100).toFixed(2)}%\n`;
        message += `Detection Method: ${result.detection_method || 'Unknown'}\n`;
      }
      if (result.solution) {
        message += `\nSolution: ${result.solution.solution}\n`;
        if (result.solution.steps && result.solution.steps.length) {
          message += `Steps:\n${result.solution.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n`;
        }
        if (result.solution.prevention) {
          message += `Prevention: ${result.solution.prevention}\n`;
        }
      }
      if (result.marked_image_url) {
        message += `Marked Image: ${result.marked_image_url}\n`;
      }
    }

    // Send text result first
    await bot.sendMessage(chatId, message);

    // Download and send marked image
    if (result.marked_image_url) {
      try {
        const imageResponse = await axios.get(result.marked_image_url, { responseType: 'arraybuffer' });
        const markedImageBuffer = Buffer.from(imageResponse.data);
        await bot.sendPhoto(chatId, markedImageBuffer, { caption: 'Marked Image' });
      } catch (imageErr) {
        console.error('Failed to download/send marked image:', imageErr.message);
        await bot.sendMessage(chatId, `Could not send marked image: ${imageErr.message}`);
      }
    }
  } catch (error) {
    console.error('Error processing pest detection:', error.message, error.stack);
    await bot.sendMessage(chatId, `Error processing image: ${error.message}`);
  }
});

bot.onText(/\/cropmonitoring/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get('http://localhost:5000/api/crop-monitoring');
    bot.sendMessage(
      chatId,
      `${response.data.message}\nVisit: http://localhost:3000/crop-monitoring`
    );
  } catch (error) {
    console.error('Error fetching crop data:', error.message);
    bot.sendMessage(chatId, 'Error fetching crop monitoring data.');
  }
});

bot.onText(/\/community/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get('http://localhost:5000/api/community');
    bot.sendMessage(
      chatId,
      `${response.data.message}\nVisit: http://localhost:3000/community`
    );
  } catch (error) {
    console.error('Error fetching community data:', error.message);
    bot.sendMessage(chatId, 'Error fetching community data.');
  }
});

bot.onText(/\/buyerconnection/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get('http://localhost:5000/api/buyer-connection');
    let message = 'Available Farmers:\n';
    response.data.farmers.forEach((farmer) => {
      message += `\n${farmer.name} (ID: ${farmer.id})\n`;
      farmer.crops.forEach((crop) => {
        message += `  ${crop.name}: ${crop.yield} kg, ₹${crop.price}/kg\n`;
      });
    });
    message += '\nVisit: http://localhost:3000/buyer-connection';
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error fetching buyer connection data:', error.message);
    bot.sendMessage(chatId, 'Error fetching farmer data.');
  }
});

bot.onText(/\/chat (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const farmerId = match[1];
  try {
    const response = await axios.get(`http://localhost:5000/api/chat/${farmerId}`);
    bot.sendMessage(
      chatId,
      `${response.data.message}\nVisit: http://localhost:3000/chat/${farmerId}`
    );
  } catch (error) {
    console.error('Error fetching chat data:', error.message);
    bot.sendMessage(chatId, `Error: ${error.response?.data?.error || 'Invalid farmer ID'}`);
  }
});

// Scrape pricing info
async function scrapePricingInfo() {
  const url = 'https://www.pib.gov.in/PressReleaseDetail.aspx?PRID=2112400';
  let browser;
  try {
    console.log(`Navigating to ${url}`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-devices'],
      defaultViewport: { width: 1280, height: 800 },
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    let pricingData = [];
    const frameHandle = await page.$('iframe');
    if (frameHandle) {
      console.log('Iframe found, attempting to scrape inside iframe');
      const frame = await frameHandle.contentFrame();
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
      console.warn('No pricing data found.');
    }
    await browser.close();
    return pricingData;
  } catch (error) {
    console.error('Error in scrapePricingInfo:', error.message);
    if (browser) await browser.close();
    throw error;
  }
}

app.get('/pricing-info', async (req, res) => {
  try {
    const data = await scrapePricingInfo();
    res.json(data);
  } catch (error) {
    console.error('Error fetching pricing info:', error);
    res.status(500).json({ error: 'Error fetching pricing info' });
  }
});

// Scrape article content
app.get('/scrape', async (req, res) => {
  try {
    const url = 'https://ourworldindata.org/agricultural-production';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articleContent = $('article').html();
    if (!articleContent) {
      return res.status(404).json({ error: 'No <article> tag found' });
    }
    res.json({ article: articleContent });
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'Error scraping data.' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

module.exports = app;
