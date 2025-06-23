// const TelegramBot = require('node-telegram-bot-api');

// // Replace with your bot token
// const token = '8112152799:AAGbxgfux0vdVqzjsvhN9gLDyBECSFdXYmw';

// // Create a bot that uses polling to fetch new updates
// const bot = new TelegramBot(token, { polling: true });

// // Handle the /start command
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Welcome to My Farmer Bot! Use /crop_monitoring or /pest_detection to get started.');
// });

// // Handle the /crop_monitoring command
// bot.onText(/\/crop_monitoring/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Please send an image for crop monitoring.');
// });

// // Handle the /pest_detection command
// bot.onText(/\/pest_detection/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Please send an image for pest detection.');
// });