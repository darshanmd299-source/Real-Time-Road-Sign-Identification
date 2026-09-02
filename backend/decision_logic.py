from backend.config import DECISION_MAPPING

def process_decision_logic(predicted_class: str, confidence: float, current_speed_kmh: float = 50.0) -> dict:
    """
    Decision-Logic Layer & Virtual Control Loop.
    Converts recognized road sign class and confidence into ADAS vehicle instructions 
    and simulates target speed adjustment.
    """
    if predicted_class == "Unknown / Low Confidence" or confidence < 60.0:
        return {
            "status": "UNKNOWN",
            "warning": "Low Confidence Prediction (< 60.0%)",
            "instruction": "MAINTAIN CAUTION",
            "action": "Maintain Safe Distance",
            "target_speed_kmh": current_speed_kmh,
            "speed_change_delta": 0.0,
            "brake_applied": False
        }

    info = DECISION_MAPPING.get(predicted_class, {
        "action": "Proceed with Caution",
        "instruction": "CAUTION AHEAD",
        "target_speed_kmh": current_speed_kmh,
        "warning_level": "LOW",
        "brake_applied": False
    })

    target_speed = info["target_speed_kmh"]
    speed_delta = round(target_speed - current_speed_kmh, 1)

    return {
        "status": "VERIFIED",
        "warning_level": info["warning_level"],
        "instruction": info["instruction"],
        "action": info["action"],
        "current_speed_kmh": current_speed_kmh,
        "target_speed_kmh": target_speed,
        "speed_change_delta": speed_delta,
        "brake_applied": info["brake_applied"],
        "control_loop_msg": f"Target Speed Set to {target_speed} km/h (Delta: {speed_delta} km/h)"
    }
