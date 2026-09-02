import os
import sys
import json
import numpy as np
from PIL import Image
import io
import tensorflow as tf

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from backend.config import MODEL_PATH, LABELS_PATH, CONFIDENCE_THRESHOLD, IMAGE_SIZE
from backend.decision_logic import process_decision_logic

class RoadSignPredictor:
    def __init__(self):
        self.model = None
        self.labels = None
        self.load_model_and_labels()

    def load_model_and_labels(self):
        """Loads trained CNN model and labels JSON mapping."""
        if not os.path.exists(MODEL_PATH):
            print(f"⚠️ Model file not found at {MODEL_PATH}.")
            return
        
        try:
            self.model = tf.keras.models.load_model(MODEL_PATH)
            print(f"✅ Loaded CNN model from {MODEL_PATH}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")

        if os.path.exists(LABELS_PATH):
            with open(LABELS_PATH, "r") as f:
                self.labels = json.load(f)
            print(f"✅ Loaded {len(self.labels)} class labels from {LABELS_PATH}")

    def preprocess_image_bytes(self, image_bytes: bytes) -> np.ndarray:
        """Decodes image bytes, resizes to (64, 64), normalizes to [0, 1]."""
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB')
        img = img.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0) # Add batch dimension (1, 64, 64, 3)

    def predict(self, image_bytes: bytes) -> dict:
        """
        Processes image bytes, runs inference through trained CNN model, 
        evaluates confidence threshold, and applies Decision-Logic Layer.
        """
        if self.model is None or self.labels is None:
            self.load_model_and_labels()
            if self.model is None:
                return {
                    "sign_id": -1,
                    "class": "Unknown / Model Not Trained",
                    "confidence": 0.0,
                    "action": "Model Error",
                    "instruction": "MODEL NOT READY",
                    "target_speed": 40
                }

        # Preprocess input frame
        try:
            tensor_input = self.preprocess_image_bytes(image_bytes)
        except Exception as e:
            return {
                "sign_id": -1,
                "class": "Invalid Image Format",
                "confidence": 0.0,
                "action": "Unreadable Frame",
                "instruction": "INVALID FRAME",
                "target_speed": 40
            }

        # Run model inference
        preds = self.model.predict(tensor_input, verbose=0)[0]
        class_idx = int(np.argmax(preds))
        confidence = round(float(preds[class_idx] * 100), 2)

        class_info = self.labels.get(str(class_idx), {
            "sign_id": class_idx,
            "class": "Unknown Sign",
            "action": "Proceed with Caution",
            "instruction": "CAUTION",
            "target_speed": 40
        })

        # Threshold check for low-confidence / unknown road signs
        if confidence < CONFIDENCE_THRESHOLD:
            decision = process_decision_logic("Unknown / Low Confidence", confidence)
            return {
                "sign_id": -1,
                "class": "Unknown / Low Confidence",
                "confidence": confidence,
                "action": decision["action"],
                "instruction": decision["instruction"],
                "target_speed": decision["target_speed_kmh"],
                "decision_logic": decision
            }

        # Process Decision-Logic Layer & Control Loop for verified prediction
        predicted_class_name = class_info["class"]
        decision = process_decision_logic(predicted_class_name, confidence)

        return {
            "sign_id": class_idx,
            "class": predicted_class_name,
            "confidence": confidence,
            "action": class_info["action"],
            "instruction": class_info["instruction"],
            "target_speed": decision["target_speed_kmh"],
            "decision_logic": decision
        }

predictor = RoadSignPredictor()
