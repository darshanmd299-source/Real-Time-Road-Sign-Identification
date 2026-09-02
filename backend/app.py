import os
import sys
import base64
from flask import Flask, request, jsonify

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.predict import predictor
from backend.config import CONFIDENCE_THRESHOLD

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    model_loaded = predictor.model is not None
    return jsonify({
        "status": "ONLINE",
        "service": "BharatSign AI Prediction API",
        "model_loaded": model_loaded,
        "confidence_threshold": CONFIDENCE_THRESHOLD
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint.
    Accepts image file upload (multipart/form-data) OR JSON base64 data ('image').
    Returns prediction JSON with class, confidence %, decision action, and control loop.
    """
    image_bytes = None

    # Handle multipart file upload
    if 'image' in request.files:
        file = request.files['image']
        image_bytes = file.read()
    # Handle JSON payload (base64 string)
    elif request.is_json:
        data = request.get_json()
        if data and 'image' in data:
            base64_str = data['image']
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            image_bytes = base64.b64decode(base64_str)

    if not image_bytes:
        return jsonify({
            "error": "No image provided. Send image file in 'image' form-data key or base64 JSON key."
        }), 400

    # Run inference & decision logic
    result = predictor.predict(image_bytes)
    return jsonify(result), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("==========================================================")
    print(f"🚀 BharatSign AI Flask API listening on http://localhost:{port}/")
    print("==========================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
