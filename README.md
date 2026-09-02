# 🇮🇳 BharatSign AI - Real-Time Indian Traffic Sign Identification System

AI-Powered Real-Time Indian Traffic Sign Identification System using Deep Convolutional Neural Networks (CNN) & MobileNet architecture, optimized for official IRC:67-2012 road safety standards, ADAS vehicle collision warnings, Decision-Logic Layer virtual control loops, sub-10ms inference latency, and bilingual speech alerts.

---

## 🎯 System Architecture & Features

- 🏎️ **Tesla & NVIDIA ADAS HUD Aesthetic**: Cyber Dark mode UI, glassmorphism telemetry panels, reticle bounding box overlays (`Neon Glow` / `Tech Corners`).
- 📹 **Real-Time Vision Operator Dashboard**: WebRTC webcam video feed, highway radar stream simulation, and image upload drag-and-drop.
- 🧠 **Deep Learning Backend Engine**: 5-class Indian traffic sign classifier built with Keras/TensorFlow. Trained on 1,000 images using a strict 70/15/15 stratified train/val/test split.
- 🛑 **5 Target Road Sign Classes**:
  1. `No Entry` $\rightarrow$ Action: *"Do Not Enter"* | Instruction: *"STOP / DO NOT ENTER"* | Speed: `0 km/h`
  2. `No Overtaking` $\rightarrow$ Action: *"Do Not Overtake"* | Instruction: *"DO NOT OVERTAKE"* | Speed: `40 km/h`
  3. `Road Hump` $\rightarrow$ Action: *"Reduce Speed"* | Instruction: *"REDUCE SPEED"* | Speed: `20 km/h`
  4. `No Left Turn` $\rightarrow$ Action: *"Do Not Turn Left"* | Instruction: *"NO LEFT TURN"* | Speed: `30 km/h`
  5. `No Parking` $\rightarrow$ Action: *"Parking Not Allowed"* | Instruction: *"DO NOT PARK"* | Speed: `35 km/h`
- ⚡ **Decision-Logic Layer & Virtual Control Loop**: Translates predictions into real-time driver warnings, target speed adjustments, brake triggers, and low-confidence thresholding (< 60.0% returns `"Unknown / Low Confidence"`).
- 🗣️ **Bilingual AI Voice Alert Engine**: Speech synthesis TTS announcing detected signs and ADAS vehicle recommendations.
- 📊 **Empirical Model Evaluation**: Confusion matrix generation (`results/confusion_matrix.png`), per-class precision/recall/F1 metrics (`results/metrics_summary.json`), and training curves.

---

## 📊 Dataset & Model Performance Summary

- **Total Dataset Size**: 1,000 Images (200 per class)
- **Train / Validation / Test Split**: 70% Train (700 images) | 15% Validation (150 images) | 15% Test (150 images)
- **Unseen Test Accuracy**: **99.33%**
- **Test Loss**: **0.0122**
- **Macro Precision**: **99.35%** | **Macro Recall**: **99.33%** | **Macro F1-Score**: **99.33%**

### Per-Class Test Accuracy:
- `No Entry`: **100.00%**
- `No Overtaking`: **100.00%**
- `Road Hump`: **100.00%**
- `No Left Turn`: **96.67%**
- `No Parking`: **100.00%**

---

## 📁 Project Directory Layout

```
d:\mproject\
│
├── backend/                      # Python Flask REST API & Decision-Logic Layer
│   ├── config.py                 # Paths, confidence threshold (60.0%), and decision mappings
│   ├── decision_logic.py         # Decision-Logic Layer & Virtual Control Loop
│   ├── predict.py                # Image preprocessing, model inference & thresholding
│   └── app.py                    # Flask REST API server (Port 5000: POST /predict & GET /health)
│
├── training/                     # ML Training & Evaluation Pipeline
│   ├── preprocessing.py          # Dataset ingestion, corrupt file validator, 70/15/15 split
│   ├── train.py                  # Deep CNN architecture builder, callbacks, history graph plotter
│   └── evaluate.py               # Test split evaluator, per-class metrics & confusion matrix generator
│
├── models/                       # Exported Trained Artifacts
│   ├── road_sign_model.h5        # Trained Keras CNN model weights
│   ├── labels.json               # Index-to-Class JSON mapping with ADAS metadata
│   └── model_meta.json           # Model metadata and hyperparameter specifications
│
├── results/                      # Evaluation Visualizations & Data
│   ├── confusion_matrix.png      # 5x5 High-resolution Seaborn confusion matrix heatmap
│   ├── metrics_summary.json      # Complete test metrics JSON
│   └── training_curves.png       # Epoch accuracy and loss curves
│
├── index.html                    # Main Single-Page Application (SPA) HUD Dashboard
├── server.ps1                    # Web UI PowerShell HTTP Server (Port 8000)
├── requirements.txt              # Python dependencies manifest
│
├── js/                           # Frontend Telemetry & Detection Engines
│   ├── detection-engine.js       # WebRTC video frame analyzer & backend API caller
│   ├── voice-alerts.js           # Web Speech API TTS alert engine
│   └── signs-db.js               # IRC:67-2012 Traffic Sign SVG knowledge base
```

---

## 🛠️ How to Run the Complete System

### 1. Start the Flask Backend Prediction API (Port 5000)
```powershell
C:\Users\Dell\Documents\major-project\.venv\Scripts\python.exe backend/app.py
```
*API endpoints will be available at:*
- `GET  http://localhost:5000/health`
- `POST http://localhost:5000/predict`

### 2. Start the Frontend Web UI Server (Port 8000)
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Then open `http://localhost:8000/` in Chrome/Edge/Brave.

---

## 🧪 Retraining and Model Evaluation Commands

To retrain the CNN model on the dataset:
```powershell
C:\Users\Dell\Documents\major-project\.venv\Scripts\python.exe training/train.py
```

To evaluate the trained model on the 15% unseen test set:
```powershell
C:\Users\Dell\Documents\major-project\.venv\Scripts\python.exe training/evaluate.py
```
