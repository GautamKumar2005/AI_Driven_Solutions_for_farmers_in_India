import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./drone.css"; // Import CSS

const socket = io("http://localhost:5000"); // Change this to your backend URL

const DroneStream = () => {
    const [frame, setFrame] = useState(null);
    const [rtspUrl, setRtspUrl] = useState("");
    const [streaming, setStreaming] = useState(false);

    useEffect(() => {
        socket.on("video_frame", (data) => {
            setFrame(`data:image/jpeg;base64,${data}`);
        });

        return () => {
            socket.off("video_frame");
        };
    }, []);

    const startStream = async () => {
        if (!rtspUrl) {
            alert("Please enter the RTSP URL");
            return;
        }
        try {
            const response = await fetch("http://localhost:5000/api/drone/start-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rtspUrl }),
            });
            const data = await response.json();
            alert(data.message);
            setStreaming(true);
        } catch (error) {
            console.error("Error starting stream:", error);
        }
    };

    const stopStream = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/drone/stop-stream", {
                method: "POST",
            });
            const data = await response.json();
            alert(data.message);
            setStreaming(false);
        } catch (error) {
            console.error("Error stopping stream:", error);
        }
    };

    return (
        <div className="drone-container">
            <h2 className="drone-title">Drone Live Stream</h2>
            
            <input
                type="text"
                placeholder="Enter RTSP URL"
                className="drone-input"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
                disabled={streaming}
            />
            
            <div className="drone-buttons">
                {!streaming ? (
                    <button onClick={startStream} className="drone-start-btn">
                        Start Stream
                    </button>
                ) : (
                    <button onClick={stopStream} className="drone-stop-btn">
                        Stop Stream
                    </button>
                )}
            </div>

            {frame ? (
                <div className="drone-stream">
                    <img src={frame} alt="Drone Stream" className="drone-stream" />
                </div>
            ) : (
                <p className="drone-message">Waiting for video stream...</p>
            )}
        </div>
    );
};

export default DroneStream;
