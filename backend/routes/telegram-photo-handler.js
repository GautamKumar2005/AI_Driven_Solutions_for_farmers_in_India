// bot.on('photo', async (msg) => {
//     const chatId = msg.chat.id;

//     // Get the highest resolution photo
//     const fileId = msg.photo[msg.photo.length - 1].file_id;

//     // Get the file URL from Telegram
//     const fileUrl = await bot.getFileLink(fileId);

//     // Send the file URL to your backend for processing
//     const response = await fetch('http://localhost:5000/crop-monitoring', {
//         method: 'POST',
//         body: JSON.stringify({ imageUrl: fileUrl, chatId }),
//         headers: { 'Content-Type': 'application/json' },
//     });

//     const result = await response.json();

//     // Send the result back to the user
//     bot.sendMessage(chatId, `Processing complete: ${JSON.stringify(result)}`);
// });