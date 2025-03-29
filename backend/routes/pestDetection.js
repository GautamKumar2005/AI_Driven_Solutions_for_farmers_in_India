const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Save uploaded image
const saveImage = (image) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const imagePath = path.join(uploadsDir, image.name);
    image.mv(imagePath);
    return imagePath;
};

router.post('/', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            console.log('No image uploaded');
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { image } = req.files;
        const imagePath = saveImage(image);
        console.log('Image saved at:', imagePath);

        const pythonScriptPath = path.resolve(__dirname, '../../ai/pest_Detection.py');
        const pythonExePath = 'python'; // Adjust if needed (e.g., 'C:\\Users\\gauta\\anaconda3\\python.exe')

        if (!fs.existsSync(pythonScriptPath)) {
            console.error('Python script not found at:', pythonScriptPath);
            return res.status(500).json({ error: 'Python script not found' });
        }

        console.log('Running Python script:', pythonScriptPath, 'with image:', imagePath);
        const python = spawn(pythonExePath, [pythonScriptPath, imagePath]);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
            console.log('Python Output:', data.toString().trim());
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('Python Error:', data.toString().trim());
        });

        python.on('close', (code) => {
            console.log('Python exited with code:', code);
            if (code === 0) {
                try {
                    const result = JSON.parse(output.trim());
                    console.log('Python result:', result);
                    const markedImagePath = result.marked_image_path
                        ? `/uploads/${path.basename(result.marked_image_path)}`
                        : null;
                    result.marked_image_url = markedImagePath
                        ? `http://localhost:5000${markedImagePath}`
                        : null;
                    console.log('Marked Image URL:', result.marked_image_url);
                    res.json({ result });
                } catch (parseError) {
                    console.error('Failed to parse Python output:', parseError, 'Output:', output);
                    res.status(500).json({ error: 'Invalid Python output', details: output });
                }
            } else {
                console.error('Python script failed with code:', code, 'Error:', errorOutput);
                res.status(500).json({ error: 'Python script failed', details: errorOutput });
            }
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

module.exports = router;