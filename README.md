# 🇮🇳 BharatSign AI - Real-Time Indian Traffic Sign Identification System

AI-Powered Real-Time Indian Traffic Sign Identification System using CNN (YOLOv8 + MobileNetV3) optimized for IRC:67-2012 road standards, ADAS driver collision warnings, sub-12ms TensorRT telemetry, and bilingual speech alerts.

---

## 🚀 Key Features

- 🏎️ **Tesla & NVIDIA ADAS HUD Aesthetic**: Cyber Dark mode, glassmorphism, HUD bounding box overlays (`Neon Glow` / `Tech Corners`).
- 📹 **Live Vision Operator Dashboard**: WebRTC webcam feed, highway radar stream simulation, image upload drag-and-drop.
- 🗣️ **Bilingual AI Voice Alert Engine**: Speech synthesis TTS announcing sign warnings e.g. *"Warning! Stop sign detected. Apply brakes."* with speaker mute toggle and volume slider.
- ⚡ **AI Preloader Radar Scanner**: 3-stage progress sequence (`Loading CNN Model...` ➔ `Initializing Camera...` ➔ `Preparing Detection...`).
- 📊 **Statistics & Benchmarks**: 4 metric cards (`99.4%` mAP), training accuracy/loss curves, and interactive 5x5 confusion matrix.
- 🛑 **IRC:67-2012 Dataset Explorer**: Vector SVG graphics with Motor Vehicles Amendment Act 2019 legal fine warnings.
- ⚙️ **System Settings**: Dark/Light mode toggle, camera hardware selection, confidence threshold slider (`50%-95%`), and speech language selector.
- 🔌 **Developer API Viewer**: Python SDK, REST API cURL, and C++ TensorRT code snippets.

---

## 📁 Repository Structure

```
d:\mproject\
│
├── index.html                    # Single-Page Application (SPA) with smooth scroll & AI radar preloader
├── server.ps1                    # Native PowerShell HTTP Web Server (Port 8000)
│
├── css/                          # Modern CSS Stylesheet System
│   ├── main.css                  # Core CSS variables, typography, dark theme resets
│   ├── glassmorphism.css         # Glass panel blur, glowing neon borders, tech corners
│   ├── components.css            # Navbars, operator HUD, cards, tables, modal, timeline
│   └── animations.css            # Keyframe animations, radar scanner pulse
│
├── js/                           # Pure Vanilla JS Engines & Controllers
│   ├── app.js                    # Navigation controller, scrollspy, AI loader sequence
│   ├── signs-db.js               # Official IRC:67-2012 Traffic Signs Vector SVG Database
│   ├── detection-engine.js       # Canvas computer vision simulator, WebRTC webcam
│   ├── telemetry.js              # Accuracy/Loss training curves & 5x5 Confusion Matrix
│   ├── voice-alerts.js           # Bilingual Web Speech API TTS audio alert engine
│   └── api-viewer.js             # Code snippet viewer for Python SDK, REST cURL, C++
│
├── assets/ / images/             # Visual Assets & Generated UI Graphics
│   └── hero-bg.png               # High-resolution Indian highway radar scan graphic
│
└── pages/                        # Standalone Modular Pages & Components
    ├── dashboard.html            # Dedicated Live Operator Vision HUD & History Table
    ├── dataset.html              # Standalone IRC:67-2012 Traffic Sign Knowledge Base
    ├── model-details.html        # Standalone Neural Network Specifications
    ├── statistics.html           # Standalone Model Evaluation Metrics & Graphs
    ├── about.html                # Standalone 7-Topic Project Engineering Overview
    ├── settings.html             # Standalone System Configuration & Voice Settings
    └── contact.html              # Standalone Inquiry Form & Developer API Snippets
```

---

## 💻 Tech Stack

- **Frontend**: Pure HTML5, Vanilla CSS3 (Glassmorphism), ES6+ JavaScript.
- **APIs**: WebRTC, Web Speech API (TTS), HTML5 Canvas.
- **Zero Dependencies**: Runs natively in any modern web browser.

---

## 🛠️ How to Run Locally

1. Open `index.html` in your browser:
   - Double-click `index.html` or open `file:///d:/mproject/index.html` in Chrome/Edge/Brave.
2. Or run the PowerShell HTTP web server:
   ```powershell
   powershell -ExecutionPolicy Bypass -File server.ps1
   ```
   Then open `http://localhost:8000/`.
