const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const router = express.Router();
const pythonExePath = "C:\\Users\\gauta\\anaconda3\\python.exe";
const pythonScriptPath = path.resolve(__dirname, "../ai/monitor.py");

let pythonProcess = null;

router.post("/start-stream", (req, res) => {
    const { rtspUrl } = req.body;
    if (!rtspUrl) {
        return res.status(400).json({ error: "RTSP URL is required." });
    }

    // Stop any existing Python process before starting a new one
    if (pythonProcess) {
        pythonProcess.kill();
    }

    console.log(`Starting drone stream from ${rtspUrl}`);

    pythonProcess = spawn(pythonExePath, [pythonScriptPath, rtspUrl]);

    pythonProcess.stdout.on("data", (data) => {
        const frameBase64 = data.toString().trim();
        io.emit("video_frame", frameBase64); // Send frame to frontend
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);
        pythonProcess = null;
    });

    res.json({ message: "Drone stream started successfully!" });
});

router.post("/stop-stream", (req, res) => {
    if (pythonProcess) {
        pythonProcess.kill();
        pythonProcess = null;
        console.log("Drone stream stopped.");
    }
    res.json({ message: "Drone stream stopped." });
});

module.exports = router;
