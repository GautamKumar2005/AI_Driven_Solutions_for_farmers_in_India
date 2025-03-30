import sys
import cv2
import numpy as np
import json
import os
import base64
from dotenv import load_dotenv
import google.generativeai as genai
from ultralytics import YOLO

# Load environment variables from .env file if present
load_dotenv()

class PesticideDetector:
    def __init__(self, gemini_api_key):
        # Initialize Gemini API for advanced image analysis
        self.gemini_api_key = gemini_api_key
        genai.configure(api_key=self.gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-pro-vision')
        
        # Load YOLO model for object detection
        try:
            self.yolo_model = YOLO('yolo/yolov8n.pt')
        except Exception as e:
            print(f"Warning: Could not load YOLO model: {str(e)}", file=sys.stderr)
            self.yolo_model = None
            
        # Define pesticide color profiles (tunable with real data)
        self.pesticide_profiles = {
            'Chlorpyrifos': {'h_range': (20, 40), 's_range': (50, 255), 'v_range': (50, 255)},  # Yellowish residue
            'Glyphosate': {'h_range': (30, 60), 's_range': (20, 200), 'v_range': (20, 150)},    # Brownish discoloration
            'Malathion': {'h_range': (0, 10), 's_range': (100, 255), 'v_range': (50, 255)}      # Reddish spots
        }

    def analyze_image(self, image):
        """
        Comprehensive pesticide detection using multiple techniques:
        1. YOLO-based object detection
        2. HSV color analysis
        3. Gemini API for advanced image understanding
        """
        results = {
            'pesticide_detected': False,
            'detections': []
        }
        
        # 1. YOLO-based detection
        if self.yolo_model:
            yolo_results = self._perform_yolo_detection(image)
            if yolo_results['pesticide_detected']:
                results['pesticide_detected'] = True
                results['detections'].extend(yolo_results['detections'])
        
        # 2. HSV color analysis
        hsv_results = self._perform_hsv_analysis(image)
        if hsv_results['pesticide_detected']:
            results['pesticide_detected'] = True
            results['detections'].extend(hsv_results['detections'])
            
        # 3. Gemini API analysis (if no detections yet or to enhance confidence)
        if not results['pesticide_detected'] or len(results['detections']) < 2:
            gemini_results = self._perform_gemini_analysis(image)
            if gemini_results['pesticide_detected']:
                results['pesticide_detected'] = True
                results['detections'].extend(gemini_results['detections'])
        
        # Consolidate results and select the most confident detection
        if results['pesticide_detected']:
            # Sort detections by confidence
            results['detections'].sort(key=lambda x: x['confidence'], reverse=True)
            top_detection = results['detections'][0]
            
            results['pesticide_name'] = top_detection['pesticide_name']
            results['confidence'] = top_detection['confidence']
            results['affected_area'] = top_detection['affected_area']
            results['detection_method'] = top_detection['detection_method']
        
        return results

    def _perform_yolo_detection(self, image):
        """Detect pesticides using YOLO object detection"""
        results = {
            'pesticide_detected': False,
            'detections': []
        }
        
        # Classes that might indicate pesticide presence
        pesticide_related_classes = [0, 39, 58, 73]  # person, bottle, plant, laptop
        
        # Run YOLO detection
        yolo_output = self.yolo_model(image)
        
        for r in yolo_output:
            boxes = r.boxes
            for box in boxes:
                cls = int(box.cls[0].item())
                conf = box.conf[0].item()
                
                if cls in pesticide_related_classes and conf > 0.4:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    center_x = int((x1 + x2) / 2)
                    center_y = int((y1 + y2) / 2)
                    radius = int(max(x2 - x1, y2 - y1) / 2)
                    
                    # Map class to pesticide type (simplified mapping)
                    pesticide_mapping = {
                        0: 'Chlorpyrifos',  # person (applicator)
                        39: 'Glyphosate',   # bottle (container)
                        58: 'Malathion',    # plant (affected)
                        73: 'Chlorpyrifos'  # laptop (monitoring)
                    }
                    
                    results['pesticide_detected'] = True
                    results['detections'].append({
                        'pesticide_name': pesticide_mapping.get(cls, 'Unknown'),
                        'confidence': round(float(conf), 2),
                        'affected_area': {
                            'x': center_x,
                            'y': center_y,
                            'radius': radius
                        },
                        'detection_method': 'YOLO'
                    })
        
        return results

    def _perform_hsv_analysis(self, image):
        """Detect pesticides using HSV color analysis"""
        results = {
            'pesticide_detected': False,
            'detections': []
        }
        
        # Convert to HSV for color-based detection
        hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Analyze for each pesticide
        for name, ranges in self.pesticide_profiles.items():
            lower = np.array([ranges['h_range'][0], ranges['s_range'][0], ranges['v_range'][0]])
            upper = np.array([ranges['h_range'][1], ranges['s_range'][1], ranges['v_range'][1]])
            mask = cv2.inRange(hsv_image, lower, upper)
            
            # Calculate affected area ratio
            affected_ratio = cv2.countNonZero(mask) / (image.shape[0] * image.shape[1])
            confidence = min(affected_ratio * 10, 0.95)  # Cap confidence at 95%
            
            if confidence > 0.3:  # Detection threshold
                # Find the largest affected area
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if contours:
                    largest_contour = max(contours, key=cv2.contourArea)
                    (x, y), radius = cv2.minEnclosingCircle(largest_contour)
                    
                    results['pesticide_detected'] = True
                    results['detections'].append({
                        'pesticide_name': name,
                        'confidence': round(confidence, 2),
                        'affected_area': {
                            'x': int(x),
                            'y': int(y),
                            'radius': int(radius)
                        },
                        'detection_method': 'HSV'
                    })
        
        return results

    def _perform_gemini_analysis(self, image):
        """Use Gemini API for advanced pesticide detection"""
        results = {
            'pesticide_detected': False,
            'detections': []
        }
        
        try:
            # Convert image to format suitable for Gemini API
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(rgb_image)
            
            # Prepare prompt for Gemini
            prompt = """
            Analyze this crop image for signs of pesticide residue or damage.
            Look for:
            1. Yellowish residue (may indicate Chlorpyrifos)
            2. Brownish discoloration (may indicate Glyphosate)
            3. Reddish spots (may indicate Malathion)
            
            If you detect any pesticide, provide:
            - Pesticide name
            - Confidence level (0.0-1.0)
            - Approximate location in the image (x,y coordinates)
            
            Format your response as JSON:
            {
                "pesticide_detected": true/false,
                "pesticide_name": "name",
                "confidence": 0.8,
                "location": {"x": 300, "y": 200}
            }
            """
            
            # Send to Gemini API
            response = self.gemini_model.generate_content([prompt, pil_image])
            response_text = response.text
            
            # Extract JSON from response
            try:
                # Find JSON in the response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    gemini_result = json.loads(json_str)
                    
                    if gemini_result.get('pesticide_detected', False):
                        # Calculate radius based on image dimensions
                        radius = min(image.shape[0], image.shape[1]) // 10
                        
                        results['pesticide_detected'] = True
                        results['detections'].append({
                            'pesticide_name': gemini_result.get('pesticide_name', 'Unknown'),
                            'confidence': gemini_result.get('confidence', 0.7),
                            'affected_area': {
                                'x': gemini_result.get('location', {}).get('x', image.shape[1] // 2),
                                'y': gemini_result.get('location', {}).get('y', image.shape[0] // 2),
                                'radius': radius
                            },
                            'detection_method': 'Gemini'
                        })
            except Exception as e:
                print(f"Warning: Could not parse Gemini response: {str(e)}", file=sys.stderr)
        
        except Exception as e:
            print(f"Warning: Gemini API analysis failed: {str(e)}", file=sys.stderr)
        
        return results

def preprocess_image(image_path):
    """Load and preprocess the image."""
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Failed to load image: invalid path or corrupted file")
        
        # Resize while maintaining aspect ratio
        max_dim = 1024
        h, w = image.shape[:2]
        if h > max_dim or w > max_dim:
            scale = max_dim / max(h, w)
            new_h, new_w = int(h * scale), int(w * scale)
            image = cv2.resize(image, (new_w, new_h))
        
        # Apply noise reduction
        image = cv2.GaussianBlur(image, (3, 3), 0)
        
        # Enhance contrast
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        enhanced_image = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        
        return enhanced_image
    except Exception as e:
        print(json.dumps({"error": f"Preprocessing failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

def detect_pesticide(image, gemini_api_key):
    """Detect pesticide and provide solutions."""
    try:
        detector = PesticideDetector(gemini_api_key)
        analysis = detector.analyze_image(image)
        
        # Solutions for detected pesticides
        solutions = {
            'Chlorpyrifos': {
                'solution': 'Wash crops with water and mild soap, use neem oil as a natural repellent.',
                'steps': [
                    'Rinse the crop thoroughly with clean water for 5-10 minutes.',
                    'Apply a mild soap solution (1 tsp soap per liter) and rinse again.',
                    'Spray neem oil (2% concentration) weekly for 2-3 weeks.'
                ],
                'prevention': 'Rotate crops annually to disrupt pest cycles.'
            },
            'Glyphosate': {
                'solution': 'Use activated charcoal to neutralize, replant if contamination is severe.',
                'steps': [
                    'Apply 500g of activated charcoal per square meter to soil.',
                    'Test soil pH (target 6.0-7.0) and nutrient levels after 48 hours.',
                    'Replant with resistant varieties like Roundup Ready crops if needed.'
                ],
                'prevention': 'Use mulch to reduce herbicide drift.'
            },
            'Malathion': {
                'solution': 'Use organic predators like ladybugs, wash crops with vinegar solution.',
                'steps': [
                    'Release 1,500 ladybugs per acre to control pests naturally.',
                    'Wash crops with a 1:3 vinegar-water solution twice weekly.',
                    'Monitor crop health with visual checks for 1-2 weeks.'
                ],
                'prevention': 'Avoid spraying during windy conditions.'
            }
        }
        
        if analysis['pesticide_detected']:
            pesticide_name = analysis['pesticide_name']
            analysis['solution'] = solutions.get(pesticide_name, {
                'solution': 'Consult an agricultural expert.',
                'steps': ['Unknown pesticide detected.'],
                'prevention': 'N/A'
            })
        return analysis
    except Exception as e:
        print(json.dumps({"error": f"Pesticide detection failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

def mark_affected_area(image, analysis, output_path):
    """Mark the pesticide-affected area on the image."""
    try:
        output_image = image.copy()
        
        if analysis['pesticide_detected']:
            # Draw red circle around affected area
            x, y, radius = analysis['affected_area']['x'], analysis['affected_area']['y'], analysis['affected_area']['radius']
            cv2.circle(output_image, (x, y), radius, (0, 0, 255), 3)  # Red circle
            
            # Add label with pesticide name and confidence
            label = f"{analysis['pesticide_name']} ({analysis['confidence']:.2f})"
            cv2.putText(output_image, label, (x - radius, y - radius - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Add detection method
            method_label = f"Method: {analysis.get('detection_method', 'Combined')}"
            cv2.putText(output_image, method_label, (x - radius, y - radius - 40),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        cv2.imwrite(output_path, output_image)
        return output_path
    except Exception as e:
        print(json.dumps({"error": f"Failed to mark affected area: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python pest_detection.py <image_path>"}))
        sys.exit(1)
    
    # Get Gemini API key
    gemini_api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDGO8hpmkvCmdUMdcEkRP7q3GEpKXs-jVw")
    
    image_path = sys.argv[1]
    image = preprocess_image(image_path)
    
    # Detect pesticide
    analysis = detect_pesticide(image, gemini_api_key)
    
    # Mark affected area and save output
    output_dir = os.path.dirname(image_path)
    output_filename = f"marked_{os.path.basename(image_path)}"
    output_path = os.path.join(output_dir, output_filename)
    marked_image_path = mark_affected_area(image, analysis, output_path)
    
    # Prepare result
    result = {
        'pesticide_detected': analysis['pesticide_detected'],
        'pesticide_name': analysis.get('pesticide_name', 'None'),
        'confidence': analysis.get('confidence', 0.0),
        'detection_method': analysis.get('detection_method', 'Combined'),
        'solution': analysis.get('solution', {'solution': 'No action needed', 'steps': ['N/A'], 'prevention': 'N/A'}),
        'marked_image_path': marked_image_path if analysis['pesticide_detected'] else None,
        'gemini_api_key': gemini_api_key
    }
    
    # Print only the JSON result
    print(json.dumps(result, indent=2))