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

        const imagePath = saveImage(req.files.image);
        console.log('Image saved:', imagePath);

        // ✅ correct script path (lowercase name!)
        const pythonScriptPath = path.resolve(__dirname, '../../ai/pest_detection.py');

        if (!fs.existsSync(pythonScriptPath)) {
            return res.status(500).json({ error: 'Python script not found' });
        }

        // ✅ Always use python (works everywhere)
        const python = spawn('python', [pythonScriptPath, imagePath]);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', data => {
            output += data.toString();
        });

        python.stderr.on('data', data => {
            errorOutput += data.toString();
            console.error('Python error:', data.toString());
        });

        python.on('close', code => {
            if (code !== 0) {
                return res.status(500).json({
                    error: 'Python script failed',
                    details: errorOutput
                });
            }

            try {
                const jsonStart = output.indexOf('{');
                const jsonEnd = output.lastIndexOf('}') + 1;

                if (jsonStart === -1) {
                    throw new Error("No JSON in output");
                }

                const result = JSON.parse(output.substring(jsonStart, jsonEnd));

                if (result.marked_image_path) {
                    const name = path.basename(result.marked_image_path);
                    result.marked_image_url = `https://agriconnect-k5uz.onrender.com/uploads/${name}`;
                }

                res.json(result);

            } catch (err) {
                res.status(500).json({
                    error: 'Invalid Python output',
                    details: output
                });
            }
        });

        python.on('error', err => {
            res.status(500).json({
                error: 'Python failed to start',
                details: err.message
            });
        });

    } catch (err) {
        res.status(500).json({
            error: 'Server error',
            details: err.message
        });
    }
});

module.exports = router;
