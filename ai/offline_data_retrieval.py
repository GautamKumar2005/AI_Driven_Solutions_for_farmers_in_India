import sys
import cv2
import numpy as np
import torch

def detect_pests(image_path):
    # Load YOLOv8 model
    model = torch.hub.load('ultralytics/yolov8', 'custom', path='yolo/yolov8n.pt')

    # Read image
    image = cv2.imread(image_path)
    height, width = image.shape[:2]

    # Perform detection
    results = model(image)

    # Parse results
    class_ids, confidences, boxes = [], [], []
    for detection in results.xyxy[0].numpy():
        x1, y1, x2, y2, confidence, class_id = detection
        if confidence > 0.5:
            box = [int(x1), int(y1), int(x2 - x1), int(y2 - y1)]
            boxes.append(box)
            confidences.append(confidence)
            class_ids.append(int(class_id))

    # Format results
    formatted_results = [{'class_id': int(class_id), 'confidence': float(conf), 'box': box} for class_id, conf, box in zip(class_ids, confidences, boxes)]
    return formatted_results

if __name__ == '__main__':
    image_path = sys.argv[1]
    results = detect_pests(image_path)
    print(results)