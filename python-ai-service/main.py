from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import pipeline, AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import io
import base64
import numpy as np
import logging
import time
from typing import Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SmartReportAI Vision Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
image_classifier = None
object_detector = None

# Enhanced Vietnamese labels mapping with more comprehensive detection
INCIDENT_LABELS = {
    "pothole": {
        "vi": "Ổ gà",
        "severity": "medium",
        "priority": "high",
        "keywords": ["road", "damage", "hole", "asphalt", "street", "pavement", "crack", "broken"],
        "negative_keywords": ["car", "truck", "person", "vehicle"],  # Tránh nhầm với traffic jam
        "required_objects": ["road", "street"],
        "detection_logic": "damage_on_road"
    },
    "flooding": {
        "vi": "Ngập lụt",
        "severity": "high", 
        "priority": "critical",
        "keywords": ["water", "flood", "rain", "street", "submerged", "puddle", "wet"],
        "negative_keywords": [],
        "required_objects": ["water"],
        "detection_logic": "water_on_surface"
    },
    "traffic_light": {
        "vi": "Đèn giao thông",
        "severity": "medium",
        "priority": "high", 
        "keywords": ["traffic", "light", "signal", "broken", "intersection", "crossing"],
        "negative_keywords": [],
        "required_objects": ["traffic light", "signal"],
        "detection_logic": "traffic_infrastructure"
    },
    "waste": {
        "vi": "Rác thải",
        "severity": "low",
        "priority": "medium",
        "keywords": ["garbage", "trash", "waste", "litter", "rubbish", "debris", "dump"],
        "negative_keywords": ["car", "person", "vehicle"],
        "required_objects": [],
        "detection_logic": "scattered_waste"
    },
    "traffic_jam": {
        "vi": "Kẹt xe",
        "severity": "medium",
        "priority": "medium",
        "keywords": ["traffic", "jam", "congestion", "cars", "queue", "stuck"],
        "negative_keywords": [],
        "required_objects": ["car", "vehicle"],
        "detection_logic": "multiple_vehicles"
    },
    "other": {
        "vi": "Sự cố khác",
        "severity": "medium",
        "priority": "medium",
        "keywords": [],
        "negative_keywords": [],
        "required_objects": [],
        "detection_logic": "fallback"
    }
}

@app.on_event("startup")
async def load_models():
    """Load AI models on startup"""
    global image_classifier, object_detector
    
    try:
        logger.info("Loading AI models...")
        
        # Load Hugging Face image classification model
        model_name = "google/vit-base-patch16-224"
        image_classifier = pipeline(
            "image-classification",
            model=model_name,
            torch_dtype=torch.float32
        )
        
        # Load object detection model
        object_detector = pipeline(
            "object-detection",
            model="facebook/detr-resnet-50",
            torch_dtype=torch.float32
        )
        
        logger.info("Models loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise e

def analyze_image_content(image: Image.Image) -> Dict:
    """Analyze image using multiple models"""
    start_time = time.time()
    
    try:
        # Get image classification results
        classification_results = image_classifier(image)
        
        # Get object detection results  
        detection_results = object_detector(image)
        
        # Combine results and map to incident types
        analysis = classify_incident(classification_results, detection_results)
        
        processing_time = int((time.time() - start_time) * 1000)
        analysis["processing_time_ms"] = processing_time
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def classify_incident(classification_results: List, detection_results: List) -> Dict:
    """Advanced AI classification for all 6 incident types with intelligent scoring"""
    
    # Extract predictions
    top_classification = classification_results[0] if classification_results else {}
    detected_objects = [obj["label"].lower() for obj in detection_results[:15]]
    
    logger.info(f"Classification: {top_classification}")
    logger.info(f"Objects: {detected_objects}")
    
    # Analyze detected objects
    analysis = {
        "vehicles": [],
        "infrastructure": [],
        "water_related": [],
        "waste_related": [],
        "damage_indicators": [],
        "people": []
    }
    
    # Categorize detected objects
    for obj in detected_objects:
        if any(v in obj for v in ["car", "truck", "bus", "motorcycle", "bike", "vehicle"]):
            analysis["vehicles"].append(obj)
        elif any(i in obj for i in ["traffic light", "stop sign", "street sign", "road"]):
            analysis["infrastructure"].append(obj)
        elif any(w in obj for w in ["water", "puddle", "rain"]):
            analysis["water_related"].append(obj)
        elif any(g in obj for g in ["bottle", "bag", "trash", "garbage"]):
            analysis["waste_related"].append(obj)
        elif any(d in obj for d in ["hole", "crack", "damage", "broken"]):
            analysis["damage_indicators"].append(obj)
        elif "person" in obj:
            analysis["people"].append(obj)
    
    vehicle_count = len(analysis["vehicles"])
    people_count = len(analysis["people"])
    
    logger.info(f"Analysis: {analysis}")
    
    # Score each incident type
    incident_scores = {}
    
    for incident_type, info in INCIDENT_LABELS.items():
        score = 0.0
        confidence_reasons = []
        
        if incident_type == "traffic_jam":
            # Traffic jam: multiple vehicles + people
            if vehicle_count >= 4:
                score += 0.9
                confidence_reasons.append(f"Nhiều phương tiện ({vehicle_count})")
            elif vehicle_count >= 2:
                score += 0.6
                confidence_reasons.append(f"Có phương tiện ({vehicle_count})")
            
            if people_count > 0:
                score += 0.3
                confidence_reasons.append(f"Có người ({people_count})")
            
            # Classification keywords
            if "label" in top_classification:
                label = top_classification["label"].lower()
                traffic_words = ["traffic", "jam", "road", "street", "highway", "congestion"]
                for word in traffic_words:
                    if word in label:
                        score += 0.4
                        confidence_reasons.append(f"Từ khóa: {word}")
                        break
        
        elif incident_type == "pothole":
            # Pothole: road damage without many vehicles
            road_present = any("road" in obj or "street" in obj for obj in detected_objects)
            damage_present = len(analysis["damage_indicators"]) > 0
            
            if damage_present and road_present:
                score += 0.8
                confidence_reasons.append("Có hư hại trên đường")
            elif road_present and vehicle_count < 3:
                score += 0.5
                confidence_reasons.append("Có đường, ít phương tiện")
            
            # Penalty for too many vehicles (likely traffic jam, not pothole)
            if vehicle_count >= 4:
                score *= 0.1
                confidence_reasons.append("Penalty: quá nhiều xe")
            
            # Classification boost
            if "label" in top_classification:
                label = top_classification["label"].lower()
                damage_words = ["hole", "crack", "damage", "broken", "pothole"]
                for word in damage_words:
                    if word in label:
                        score += 0.6
                        confidence_reasons.append(f"Từ khóa hư hại: {word}")
                        break
        
        elif incident_type == "flooding":
            # Flooding: water on streets
            water_present = len(analysis["water_related"]) > 0
            
            if water_present:
                score += 0.9
                confidence_reasons.append("Phát hiện nước")
            
            # Classification keywords
            if "label" in top_classification:
                label = top_classification["label"].lower()
                water_words = ["water", "flood", "rain", "wet", "puddle", "submerged"]
                for word in water_words:
                    if word in label:
                        score += 0.7
                        confidence_reasons.append(f"Từ khóa nước: {word}")
                        break
        
        elif incident_type == "waste":
            # Waste: garbage objects without vehicles
            waste_present = len(analysis["waste_related"]) > 0
            
            if waste_present:
                score += 0.8
                confidence_reasons.append("Phát hiện rác thải")
            
            # Penalty for vehicles (might be traffic, not waste focus)
            if vehicle_count >= 3:
                score *= 0.3
                confidence_reasons.append("Penalty: nhiều xe")
            
            # Classification keywords
            if "label" in top_classification:
                label = top_classification["label"].lower()
                waste_words = ["garbage", "trash", "waste", "litter", "bottle", "bag"]
                for word in waste_words:
                    if word in label:
                        score += 0.6
                        confidence_reasons.append(f"Từ khóa rác: {word}")
                        break
        
        elif incident_type == "traffic_light":
            # Traffic light issues
            light_present = any("traffic light" in obj or "stop sign" in obj for obj in analysis["infrastructure"])
            
            if light_present:
                score += 0.9
                confidence_reasons.append("Phát hiện đèn giao thông")
            
            # Classification keywords
            if "label" in top_classification:
                label = top_classification["label"].lower()
                light_words = ["traffic light", "signal", "stop sign", "intersection"]
                for word in light_words:
                    if word in label:
                        score += 0.7
                        confidence_reasons.append(f"Từ khóa đèn: {word}")
                        break
        
        elif incident_type == "other":
            # Fallback for unclear cases
            if all(s < 0.4 for s in incident_scores.values()):
                score += 0.5
                confidence_reasons.append("Không xác định rõ loại sự cố")
        
        # Record score if significant
        if score > 0.1:
            incident_scores[incident_type] = score
            logger.info(f"{incident_type}: {score:.2f} - {confidence_reasons}")
    
    # Select best match
    if incident_scores:
        sorted_scores = sorted(incident_scores.items(), key=lambda x: x[1], reverse=True)
        best_match = sorted_scores[0]
        incident_type = best_match[0]
        raw_score = best_match[1]
        
        # Normalize confidence (0.55 - 0.95)
        confidence = min(0.55 + (raw_score * 0.4), 0.95)
        
        logger.info(f"Final decision: {incident_type} ({confidence:.2f})")
    else:
        # Ultimate fallback
        if vehicle_count >= 3:
            incident_type = "traffic_jam"
            confidence = 0.70
        elif any("water" in obj for obj in detected_objects):
            incident_type = "flooding"
            confidence = 0.65
        else:
            incident_type = "other"
            confidence = 0.60
    
    info = INCIDENT_LABELS[incident_type]
    
    return {
        "label": incident_type,
        "confidence": round(confidence, 2),
        "description": f"{info['vi']} được phát hiện trong hình ảnh",
        "severity": info["severity"],
        "suggested_priority": info["priority"],
        "location_hints": ["đường phố", "khu vực đô thị"],
        "detected_objects": detected_objects[:5],
        "model_version": "smart-v1.2",
        "debug_info": {
            "vehicle_count": vehicle_count,
            "people_count": people_count,
            "analysis_breakdown": analysis,
            "all_scores": dict(incident_scores) if incident_scores else {},
            "classification_label": top_classification.get("label", "N/A"),
            "final_reasoning": f"Selected {incident_type} based on detected patterns"
        }
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze uploaded image"""
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Analyze image
        analysis = analyze_image_content(image)
        
        logger.info(f"Analysis completed: {analysis['label']} ({analysis['confidence']})")
        
        return {
            "success": True,
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-base64")  
async def analyze_base64_image(data: dict):
    """Analyze base64 encoded image"""
    
    if "image_base64" not in data:
        raise HTTPException(status_code=400, detail="image_base64 field required")
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(data["image_base64"])
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Analyze image
        analysis = analyze_image_content(image)
        
        return {
            "success": True, 
            "analysis": analysis
        }
        
    except Exception as e:
        logger.error(f"Error processing base64 image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": image_classifier is not None and object_detector is not None
    }

@app.get("/")
async def root():
    return {"message": "SmartReportAI Vision Service", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)