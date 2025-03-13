
const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.post('/retrieve', (req, res) => {
    const { dataType } = req.body;
    const python = spawn('python3', [`../ai/offline_data_retrieval.py`, dataType]);

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