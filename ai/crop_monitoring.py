import sys
import cv2
import numpy as np
import json
import os
from transformers import pipeline
from PIL import Image
import base64
import io

# Set environment variable to suppress TensorFlow oneDNN messages
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # Suppress TensorFlow logging

class PlantAnalyzer:
    def __init__(self):
        # Initialize sentiment analysis model for text processing
        self.nlp_model = None  # Will be loaded on demand
    
    def load_nlp_model(self):
        if self.nlp_model is None:
            try:
                self.nlp_model = pipeline('text-classification', model='nlptown/bert-base-multilingual-uncased-sentiment')
                return True
            except Exception as e:
                print(json.dumps({"error": f"Failed to load NLP model: {str(e)}"}))
                return False
        return True

    def preprocess_image(self, image_path):
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Failed to load image: invalid path or corrupted file")
            # Resize for consistent processing
            image = cv2.resize(image, (224, 224))
            # Convert to RGB (from BGR)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            return image
        except Exception as e:
            print(json.dumps({"error": f"Preprocessing failed: {str(e)}"}))
            sys.exit(1)

    def analyze_image(self, image):
        """
        Analyze plant health from image using computer vision techniques
        """
        try:
            # Convert to HSV for better color analysis
            hsv_image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Extract color features
            mean_hsv = np.mean(hsv_image, axis=(0, 1))
            
            # Simple color-based analysis
            # Hue: 0-180 in OpenCV, ~60 is green
            # Saturation: 0-255, higher values indicate more vibrant colors
            hue, saturation, value = mean_hsv
            
            # Health assessment based on green hue and saturation
            if 40 <= hue <= 80 and saturation > 100:  # Strong green
                health = 'good'
            elif 40 <= hue <= 80 and 50 <= saturation <= 100:  # Moderate green
                health = 'moderate'
            else:  # Not very green
                health = 'not healthy'
            
            # Growth stage based on color intensity
            if value > 150:
                growth_stage = 'normal'
            elif value > 100:
                growth_stage = 'medium'
            else:
                growth_stage = 'need help'
            
            # Nutrient deficiency based on color variation
            std_hsv = np.std(hsv_image, axis=(0, 1))
            if std_hsv[0] > 20 or std_hsv[1] > 50:  # High variation in colors
                nutrient_deficiency = 'yes need'
            else:
                nutrient_deficiency = 'none'
            
            return {
                'health': health,
                'growth_stage': growth_stage,
                'nutrient_deficiency': nutrient_deficiency
            }
        except Exception as e:
            print(json.dumps({"error": f"Image analysis failed: {str(e)}"}))
            sys.exit(1)

    def analyze_text(self, text):
        try:
            if not self.load_nlp_model():
                return {
                    'health': 'Unknown',
                    'growth_stage': 'Unknown',
                    'nutrient_deficiency': 'Unknown'
                }
                
            analysis = self.nlp_model(text)
            score = int(analysis[0]['label'].split('LABEL_')[1])
            
            # Map scores to health categories
            if score >= 4:  # 4 or 5 stars
                health = 'good'
            elif score >= 3:  # 3 stars
                health = 'moderate'
            else:  # 1 or 2 stars
                health = 'not healthy'
            
            # Extract growth stage and nutrient information from text
            growth_stage = 'normal'
            nutrient_deficiency = 'none'
            
            # Check for growth issues
            if 'growth' in text.lower():
                if any(word in text.lower() for word in ['slow', 'stunted', 'poor']):
                    growth_stage = 'need help'
                elif any(word in text.lower() for word in ['fast', 'rapid', 'excessive']):
                    growth_stage = 'medium'
            
            # Check for nutrient issues
            if any(word in text.lower() for word in ['nutrient', 'deficiency', 'yellow', 'brown']):
                if any(word in text.lower() for word in ['lack', 'need', 'deficient']):
                    nutrient_deficiency = 'yes need'
            
            return {
                'health': health,
                'growth_stage': growth_stage,
                'nutrient_deficiency': nutrient_deficiency
            }
        except Exception as e:
            print(json.dumps({"error": f"Text analysis failed: {str(e)}"}))
            return {
                'health': 'Unknown',
                'growth_stage': 'Unknown',
                'nutrient_deficiency': 'Unknown'
            }

    def generate_recommendations(self, plant_health):
        recommendations = []
        
        if plant_health['health'] == 'not healthy':
            recommendations.append("Inspect plants for signs of disease or pest infestation.")
            recommendations.append("Check for proper watering - overwatering and underwatering can both cause health issues.")
        elif plant_health['health'] == 'moderate':
            recommendations.append("Monitor plant closely for any changes in appearance.")
            recommendations.append("Ensure consistent watering and adequate light conditions.")
        
        if plant_health['growth_stage'] == 'need help':
            recommendations.append("Consider adjusting watering schedule and providing adequate sunlight.")
            recommendations.append("Check if the plant is in an appropriate container size for its growth stage.")
        elif plant_health['growth_stage'] == 'medium':
            recommendations.append("Maintain current care regimen to support continued growth.")
        
        if plant_health['nutrient_deficiency'] == 'yes need':
            recommendations.append("Apply appropriate fertilizer to address nutrient deficiencies.")
            recommendations.append("Consider soil testing to identify specific nutrient needs.")
        
        if not recommendations:
            recommendations.append("Plants appear healthy. Continue current care regimen.")
            recommendations.append("Regular monitoring is still recommended to maintain plant health.")
        
        return recommendations

if __name__ == '__main__':
    # Define the possible values for plant health parameters
    plant_health_options = {
        'health': ['good', 'moderate', 'not healthy'],
        'growth_stage': ['medium', 'normal', 'need help'],
        'nutrient_deficiency': ['none', 'yes need', 'no need']
    }
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python crop_monitoring.py <image_path> [<text_description>]"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    text_description = sys.argv[2] if len(sys.argv) > 2 else None
    
    analyzer = PlantAnalyzer()
    
    # Process image
    processed_image = analyzer.preprocess_image(image_path)
    image_prediction = analyzer.analyze_image(processed_image)
    
    result = {
        'image_analysis': image_prediction
    }
    
    # Process text if provided
    if text_description:
        text_prediction = analyzer.analyze_text(text_description)
        result['text_analysis'] = text_prediction
    
    # Combine results, prioritizing image analysis
    result['plant_health'] = {
        'health': result['image_analysis']['health'] if result['image_analysis']['health'] != 'Unknown' else result.get('text_analysis', {}).get('health', 'Unknown'),
        'growth_stage': result['image_analysis']['growth_stage'] if result['image_analysis']['growth_stage'] != 'Unknown' else result.get('text_analysis', {}).get('growth_stage', 'Unknown'),
        'nutrient_deficiency': result['image_analysis']['nutrient_deficiency'] if result['image_analysis']['nutrient_deficiency'] != 'Unknown' else result.get('text_analysis', {}).get('nutrient_deficiency', 'Unknown')
    }
    
    # Generate recommendations
    result['recommendations'] = analyzer.generate_recommendations(result['plant_health'])
    
    # Add the plant health options to the result for reference
    result['plant_health_options'] = plant_health_options
    
    # Output the final result
    print(json.dumps(result, indent=4))
