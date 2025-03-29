const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Function to save the uploaded image
const saveImage = (image) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const imagePath = path.join(uploadsDir, image.name);
    fs.writeFileSync(imagePath, image.data);
    return imagePath;
};

router.post('/', async (req, res) => {
    try {
        // Check if an image was uploaded
        if (!req.files || !req.files.image) {
            console.error("No image uploaded!");
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { image } = req.files;
        const imagePath = saveImage(image);
        
        // Define the Python script path (absolute for reliability)
        const pythonScriptPath = 'C:\\Users\\gauta\\AI_farmer\\ai\\crop_monitoring.py';
        const pythonExePath = 'C:\\Users\\gauta\\anaconda3\\python.exe';

        // Log paths for debugging
        console.log("Resolved Python script path:", pythonScriptPath);
        console.log("Image path:", imagePath);

        // Verify the Python script exists
        if (!fs.existsSync(pythonScriptPath)) {
            console.error("Python script not found:", pythonScriptPath);
            return res.status(500).json({ error: 'Python script not found' });
        }

        // Verify the Python executable exists
        if (!fs.existsSync(pythonExePath)) {
            console.error("Python executable not found:", pythonExePath);
            return res.status(500).json({ error: 'Python executable not found' });
        }

        // Spawn the Python process
        const python = spawn(pythonExePath, [pythonScriptPath, imagePath]);

        let output = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            output += data.toString();
            console.log("Python stdout:", data.toString().trim());
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error("Python stderr:", data.toString().trim());
        });

        python.on('close', (code) => {
            console.log("Python process exited with code:", code);
            if (code === 0) {
                try {
                    const result = JSON.parse(output.trim());
                    // Check if the result contains an error field from Python
                    if (result.error) {
                        return res.status(400).json({ error: result.error });
                    }
                    res.json({ result });
                } catch (parseError) {
                    console.error("Failed to parse Python output:", parseError, "Output:", output);
                    res.status(500).json({ error: 'Invalid output from Python script', details: output });
                }
            } else {
                console.error(`Python script error (code ${code}): ${errorOutput}`);
                res.status(500).json({ error: 'Error processing image', details: errorOutput });
            }
        });

    } catch (error) {
        console.error("Unexpected Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;