import cv2
import base64
import sys

if len(sys.argv) < 2:
    print("Error: No RTSP URL provided.", flush=True)
    sys.exit(1)

rtsp_url = sys.argv[1]  # Get RTSP URL from command-line arguments
cap = cv2.VideoCapture(rtsp_url)

if not cap.isOpened():
    print("Error: Unable to open RTSP stream.", flush=True)
    sys.exit(1)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    _, buffer = cv2.imencode(".jpg", frame)
    frame_base64 = base64.b64encode(buffer).decode("utf-8")

    print(frame_base64, flush=True)  # Send base64 frame to Node.js

cap.release()
cv2.destroyAllWindows()
