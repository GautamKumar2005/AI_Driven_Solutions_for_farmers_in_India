const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.post('/', (req, res) => {
    const { image } = req.body;
    const python = spawn('python3', ['../ai/pest_detection.py', image]);

    python.stdout.on('data', (data) => {
        res.send(data.toString());
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});

module.exports = router;