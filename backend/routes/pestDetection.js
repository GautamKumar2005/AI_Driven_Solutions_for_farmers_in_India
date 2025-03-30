const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Save uploaded image with unique filename
const saveImage = (image) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename to prevent overwrites
    const uniqueFilename = `${Date.now()}-${image.name}`;
    const imagePath = path.join(uploadsDir, uniqueFilename);
    
    // Use fs.writeFileSync instead of image.mv for better compatibility
    fs.writeFileSync(imagePath, image.data);
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

        // Use the correct path to the Python script
        const pythonScriptPath = path.resolve(__dirname, '../../ai/pest_Detection.py');
        const pythonExePath = 'C:\\Users\\gauta\\anaconda3\\python.exe';

        // Verify the Python script exists
        if (!fs.existsSync(pythonScriptPath)) {
            console.error('Python script not found at:', pythonScriptPath);
            return res.status(500).json({ error: 'Python script not found' });
        }

        // Verify the Python executable exists
        if (!fs.existsSync(pythonExePath)) {
            console.error('Python executable not found at:', pythonExePath);
            return res.status(500).json({ error: 'Python executable not found' });
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

        python.stdout.on('close', (code) => {
            console.log('Python exited with code:', code);
            
            if (code === 0 || code === false) { // Handle both 0 and false as success
                try {
                    // Find the JSON part of the output
                    const jsonStart = output.indexOf('{');
                    const jsonEnd = output.lastIndexOf('}') + 1;
                    
                    if (jsonStart >= 0 && jsonEnd > jsonStart) {
                        const jsonString = output.substring(jsonStart, jsonEnd);
                        const result = JSON.parse(jsonString);
                        
                        // Create proper URL for the marked image
                        if (result.marked_image_path) {
                            const markedImageName = path.basename(result.marked_image_path);
                            result.marked_image_url = `http://localhost:5000/uploads/${markedImageName}`;
                            console.log('Marked Image URL:', result.marked_image_url);
                        }
                        
                        // Return the result directly
                        res.json(result);
                    } else {
                        throw new Error("No valid JSON found in output");
                    }
                } catch (parseError) {
                    console.error('Failed to parse Python output:', parseError, 'Output:', output);
                    res.status(500).json({ error: 'Invalid Python output', details: output });
                }
            } else {
                console.error('Python script failed with code:', code, 'Error:', errorOutput);
                res.status(500).json({ error: 'Python script failed', details: errorOutput });
            }
        });
        
        // Handle potential errors in the spawn process itself
        python.on('error', (error) => {
            console.error('Failed to start Python process:', error);
            res.status(500).json({ 
                error: 'Failed to start image analysis process', 
                details: error.message 
            });
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

module.exports = router;