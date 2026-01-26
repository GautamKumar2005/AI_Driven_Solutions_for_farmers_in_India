
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
const Auth =require('./routes/signup');
const { GoogleGenAI } = require('@google/genai');

const { GoogleGenerativeAI } = require('@google/generative-ai');
// Start server
// Serve React frontend


// Importing routes

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
app.use('/auth/register', Auth);
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
 // Using the latest SDK

// Chatbot route
   // or use import if you're using ESM

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message?.trim();

  if (!userMessage) {
    return res.status(400).json({ reply: 'Message is required.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }

    // Initialize the client
    const ai = new GoogleGenAI({ apiKey });

    // Valid model names in early 2026 (stable ones):
    // - gemini-2.0-flash
    // - gemini-2.0-flash-lite
    // - gemini-2.5-flash
    // - gemini-2.5-pro
    // Add "-latest" only if you really want bleeding edge
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",                    // ← works reliably now

      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ],

      // Note: config → generationConfig (not "config")
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        // maxOutputTokens: 8192,    // optional – uncomment if needed
      },

      // Optional: add safety if you want less filtering
      // safetySettings: [ ... ]
    });

    // Access the text – new SDK uses .text() method
    let botReply = response.text()?.trim() || "No response generated.";

    // Your formatting (I kept it almost the same, just cleaned regex a bit)
    botReply = botReply
      .replace(/\*\*(.*?)\*\*/g, '🌟 **$1**')
      .replace(/(\n){3,}/g, '\n\n')
      .replace(/^- /gm, '✅ ')
      .replace(/^\* /gm, '➡️ ')
      .trim();

    return res.json({ reply: botReply });

  } catch (error) {
    console.error("Gemini error:", {
      message: error.message,
      status: error.status,
      details: error.errorDetails || error.cause,
    });

    let userMsg = "⚠️ Sorry, something went wrong. Please try again.";

    if (error.status === 404 || error.message?.includes("not found")) {
      userMsg = "⚠️ Model not available right now. Try 'gemini-2.0-flash' or 'gemini-2.5-flash'.";
    } else if (error.status === 429) {
      userMsg = "Rate limit reached – wait 1–2 minutes.";
    } else if (error.status === 400) {
      userMsg += " (Invalid request – check model name or format)";
    } else if (error.status === 500) {
      userMsg += " (Google server issue – retry in a few minutes)";
    }

    return res.status(error.status || 500).json({
      reply: userMsg,
      errorDetail: error.message?.substring(0, 200) || "Unknown error"
    });
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
    const pestResponse = await axios.post('https://agriconnect-k5uz.onrender.com/pest-detection', form, {
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
    const response = await axios.get('https://agriconnect-k5uz.onrender.com/api/crop-monitoring');
    bot.sendMessage(
      chatId,
      `${response.data.message}\nVisit: https://agriconnect-k5uz.onrender.com/crop-monitoring`
    );
  } catch (error) {
    console.error('Error fetching crop data:', error.message);
    bot.sendMessage(chatId, 'Error fetching crop monitoring data.');
  }
});

bot.onText(/\/community/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get('https://agriconnect-k5uz.onrender.com/api/community');
    bot.sendMessage(
      chatId,
      `${response.data.message}\nVisit: https://agriconnect-k5uz.onrender.com/community`
    );
  } catch (error) {
    console.error('Error fetching community data:', error.message);
    bot.sendMessage(chatId, 'Error fetching community data.');
  }
});

bot.onText(/\/buyerconnection/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get('https://agriconnect-k5uz.onrender.com/api/buyer-connection');
    let message = 'Available Farmers:\n';
    response.data.farmers.forEach((farmer) => {
      message += `\n${farmer.name} (ID: ${farmer.id})\n`;
      farmer.crops.forEach((crop) => {
        message += `  ${crop.name}: ${crop.yield} kg, ₹${crop.price}/kg\n`;
      });
    });
    message += '\nVisit: https://agriconnect-k5uz.onrender.com/buyer-connection';
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
    const response = await axios.get(`https://agriconnect-k5uz.onrender.com/api/chat/${farmerId}`);
    bot.sendMessage(
      chatId,
      `${response.data.message}\nVisit: https://agriconnect-k5uz.onrender.com/chat/${farmerId}`
    );
  } catch (error) {
    console.error('Error fetching chat data:', error.message);
    bot.sendMessage(chatId, `Error: ${error.response?.data?.error || 'Invalid farmer ID'}`);
  }
});
// -----------------------------
// Scrape Pricing Info
// ---------------- SCRAPE PRICING INFO ----------------;



async function scrapePricingInfo() {
  const url = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2131983';

  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 20000
  });

  const $ = cheerio.load(data);

  const results = [];
  let currentCategory = '';

  $('table tr').each((_, row) => {
    const cols = $(row).find('td');
    if (cols.length < 2) return;

    const crop = $(cols[0]).text().trim();
    const price = $(cols[cols.length - 1]).text().trim();

    // Detect category/header rows
    if (!price || price.includes('KMS') || price === '-') {
      currentCategory = crop;
      return;
    }

    results.push({
      category: currentCategory || 'Other',
      crop,
      price
    });
  });

  return results;
}

// API route
app.get('/pricing-info', async (req, res) => {
  try {
    const data = await scrapePricingInfo();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch all unmatched routes and send React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});


const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

module.exports = app;
