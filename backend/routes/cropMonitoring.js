const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Use system python (works on Windows, Linux, Render, Docker)
// You can override by setting PYTHON_EXECUTABLE in env if needed
const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || 'python';

// Correct lowercase filename for Linux compatibility
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
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { image } = req.files;
        const textDescription = req.body.description || null;
        const imagePath = saveImage(image);

        console.log('Python executable:', PYTHON_EXECUTABLE);
        console.log('Script path:', PYTHON_SCRIPT_PATH);
        console.log('Image path:', imagePath);

        if (!fs.existsSync(PYTHON_SCRIPT_PATH)) {
            return res.status(500).json({ error: 'Python script not found' });
        }

        const pythonArgs = [PYTHON_SCRIPT_PATH, imagePath];
        if (textDescription) pythonArgs.push(textDescription);

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
            try { fs.unlinkSync(imagePath); } catch (_) {}

            if (code !== 0) {
                return res.status(500).json({
                    error: 'Image processing failed',
                    details: errorOutput || 'No error message received'
                });
            }

            try {
                const result = JSON.parse(output.trim());
                res.json(result);
            } catch (parseErr) {
                console.error('Failed to parse Python output:', parseErr.message);
                console.error('Raw output:', output);
                res.status(500).json({
                    error: 'Invalid response from analysis script',
                    details: output.slice(0, 500)
                });
            }
        });

    } catch (err) {
        console.error('Route error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
