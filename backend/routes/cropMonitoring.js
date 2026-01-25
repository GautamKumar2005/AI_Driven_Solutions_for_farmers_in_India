const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Optional: read from .env (recommended for flexibility)
const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || 'C:\\Users\\gauta\\anaconda3\\python.exe';

// Calculate Python script location relative to this file
// Assuming file structure:
// ├── server/
// │   └── routes/
// │       └── this-file.js
// ├── ai/
// │   └── crop_monitoring.py
// └── ...
const PYTHON_SCRIPT_PATH = path.join(__dirname, '..', '..', 'ai', 'crop_monitoring.py');

const saveImage = (image) => {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const uniqueFilename = `${Date.now()}-${image.name}`;
    const imagePath = path.join(uploadsDir, uniqueFilename);
    
    fs.writeFileSync(imagePath, image.data);
    return imagePath;
};

router.post('/', async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            console.error("No image uploaded");
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { image } = req.files;
        const textDescription = req.body.description || null;
        const imagePath = saveImage(image);

        // Log for debugging (very useful when deploying)
        console.log('Python executable:', PYTHON_EXECUTABLE);
        console.log('Script path:', PYTHON_SCRIPT_PATH);
        console.log('Image path:', imagePath);

        // Safety check — script must exist
        if (!fs.existsSync(PYTHON_SCRIPT_PATH)) {
            console.error('Python script not found at:', PYTHON_SCRIPT_PATH);
            return res.status(500).json({ error: 'Server configuration error: Python script missing' });
        }

        // Build arguments
        const pythonArgs = [PYTHON_SCRIPT_PATH, imagePath];
        if (textDescription) {
            pythonArgs.push(textDescription);
        }

        const python = spawn(PYTHON_EXECUTABLE, pythonArgs);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('Python stderr:', data.toString().trim());
        });

        python.on('error', (err) => {
            console.error('Failed to spawn Python process:', err.message);
            res.status(500).json({
                error: 'Failed to start Python process',
                details: err.message
            });
        });

        python.on('close', (code) => {
            // Clean up uploaded file
            try {
                fs.unlinkSync(imagePath);
                console.log('Cleaned up:', imagePath);
            } catch (e) {
                console.warn('Could not delete temp file:', e.message);
            }

            if (code !== 0) {
                console.error(`Python exited with code ${code}\n${errorOutput}`);
                return res.status(500).json({
                    error: 'Image processing failed',
                    details: errorOutput || 'No error message received'
                });
            }

            try {
                const result = JSON.parse(output.trim());

                if (result.error) {
                    return res.status(400).json({ error: result.error });
                }

                res.json(result);
            } catch (parseErr) {
                console.error('Failed to parse Python output:', parseErr.message);
                console.error('Raw output was:', output);
                res.status(500).json({
                    error: 'Invalid response from analysis script',
                    details: output.slice(0, 500) // limit length
                });
            }
        });

    } catch (err) {
        console.error('Route error:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
});

module.exports = router;