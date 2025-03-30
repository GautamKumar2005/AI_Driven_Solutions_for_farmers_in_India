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
    
    // Generate a unique filename to prevent overwrites
    const uniqueFilename = `${Date.now()}-${image.name}`;
    const imagePath = path.join(uploadsDir, uniqueFilename);
    
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
        const textDescription = req.body.description || null; // Get text description if provided
        const imagePath = saveImage(image);
        
        // Define the Python script path with hardcoded path
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

        // Prepare the command arguments
        const pythonArgs = [pythonScriptPath, imagePath];
        
        // Add text description if provided
        if (textDescription) {
            pythonArgs.push(textDescription);
            console.log("Including text description:", textDescription);
        }

        // Spawn the Python process
        const python = spawn(pythonExePath, pythonArgs);

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
            
            // Clean up the uploaded image after processing
            try {
                fs.unlinkSync(imagePath);
                console.log("Temporary image file deleted:", imagePath);
            } catch (cleanupError) {
                console.warn("Failed to delete temporary image:", cleanupError);
            }
            
            if (code === 0) {
                try {
                    // Try to parse the output as JSON
                    const result = JSON.parse(output.trim());
                    
                    // Check if the result contains an error field from Python
                    if (result.error) {
                        return res.status(400).json({ error: result.error });
                    }
                    
                    // Send the entire result object to the frontend
                    res.json(result);
                } catch (parseError) {
                    console.error("Failed to parse Python output:", parseError, "Output:", output);
                    res.status(500).json({ 
                        error: 'Invalid output from Python script', 
                        details: output 
                    });
                }
            } else {
                console.error(`Python script error (code ${code}): ${errorOutput}`);
                res.status(500).json({ 
                    error: 'Error processing image', 
                    details: errorOutput 
                });
            }
        });

        // Handle potential errors in the spawn process itself
        python.on('error', (error) => {
            console.error("Failed to start Python process:", error);
            res.status(500).json({ 
                error: 'Failed to start image analysis process', 
                details: error.message 
            });
        });

    } catch (error) {
        console.error("Unexpected Server Error:", error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message 
        });
    }
});

module.exports = router;
