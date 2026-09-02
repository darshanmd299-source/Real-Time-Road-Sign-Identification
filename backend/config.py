import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

MODEL_PATH = os.path.join(MODELS_DIR, "road_sign_model.h5")
LABELS_PATH = os.path.join(MODELS_DIR, "labels.json")

CONFIDENCE_THRESHOLD = 60.0  # Percentage threshold for valid detection
IMAGE_SIZE = (64, 64)

# Decision Logic & Virtual Control Loop Mapping
DECISION_MAPPING = {
    "No Entry": {
        "action": "Do Not Enter",
        "instruction": "STOP / DO NOT ENTER",
        "target_speed_kmh": 0,
        "warning_level": "CRITICAL",
        "brake_applied": True
    },
    "No Overtaking": {
        "action": "Do Not Overtake",
        "instruction": "DO NOT OVERTAKE",
        "target_speed_kmh": 40,
        "warning_level": "HIGH",
        "brake_applied": False
    },
    "Road Hump": {
        "action": "Reduce Speed",
        "instruction": "REDUCE SPEED",
        "target_speed_kmh": 20,
        "warning_level": "MEDIUM",
        "brake_applied": True
    },
    "No Left Turn": {
        "action": "Do Not Turn Left",
        "instruction": "NO LEFT TURN",
        "target_speed_kmh": 30,
        "warning_level": "MEDIUM",
        "brake_applied": False
    },
    "No Parking": {
        "action": "Parking Not Allowed",
        "instruction": "DO NOT PARK",
        "target_speed_kmh": 35,
        "warning_level": "LOW",
        "brake_applied": False
    }
}
