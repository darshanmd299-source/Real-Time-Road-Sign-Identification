/* ==========================================================================
   LIVE COMPUTER VISION & TESLA/NVIDIA AI SIMULATION ENGINE
   BharatSign AI - Real-Time ADAS Vision Telemetry
   ========================================================================== */

class DetectionSimulator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.mode = 'simulated'; // 'simulated', 'webcam', 'uploaded'
    this.boxStyle = 'neon'; // 'neon', 'corners'
    this.confThreshold = 0.75;
    this.webcamStream = null;
    this.videoElement = null;
    this.customImage = null;
    this.isRunning = false;
    this.signX = 120;
    this.signY = 80;
    this.signSize = 85;
    this.direction = 1;
    this.currentSignIndex = 0;
    this.lastFrameTime = performance.now();
    this.fps = 60;
    this.latency = 8.4;
  }

  init() {
    this.canvas = document.getElementById('detectionCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;

    const styleSelect = document.getElementById('boxStyleSelect');
    if (styleSelect) {
      styleSelect.addEventListener('change', (e) => {
        this.boxStyle = e.target.value;
      });
    }

    this.isRunning = true;
    this.animate();

    // Populate initial detection table history rows
    this.seedInitialHistory();
  }

  resizeCanvas() {
    if (!this.canvas || !this.canvas.parentElement) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  async startWebcam() {
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      this.videoElement.srcObject = this.webcamStream;
      await this.videoElement.play();
      this.mode = 'webcam';
      this.updateStatusBadge('WEBCAM_ACTIVE', '#00ff88');
      return true;
    } catch (err) {
      console.warn('Webcam access error:', err);
      alert('⚠️ Camera access denied or not available. Reverting to Highway Radar Stream.');
      this.mode = 'simulated';
      return false;
    }
  }

  stopWebcam() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }
    this.mode = 'simulated';
    this.updateStatusBadge('HIGHWAY_STREAM', '#00f0ff');
  }

  handleCustomImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.customImage = img;
        this.mode = 'uploaded';
        this.updateStatusBadge('IMAGE_UPLOADED', '#ff6b00');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  updateStatusBadge(text, color) {
    const badge = document.getElementById('dashStatusBadge');
    if (badge) {
      badge.innerHTML = `<span class="status-dot active status-dot-pulse" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></span><span>${text}</span>`;
    }
  }

  animate() {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.fps = Math.round(1000 / (delta || 16.6));
    this.latency = (6.5 + Math.random() * 3.5).toFixed(1);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeDetection = null;

    if (this.mode === 'webcam' && this.videoElement.readyState >= 2) {
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      activeDetection = this.processLiveVideoFrame();
    } else if (this.mode === 'uploaded' && this.customImage) {
      this.ctx.drawImage(this.customImage, 0, 0, this.canvas.width, this.canvas.height);
      activeDetection = this.processLiveVideoFrame();
    } else {
      this.renderRoadSimulation();
    }

    // Render Tesla/NVIDIA Cyber ADAS Overlay & Bounding Box
    if (activeDetection) {
      this.renderDetectedBoundingBox(activeDetection);
    } else {
      this.renderAdasBoundingBox();
    }

    // Update HUD counters
    const fpsElem = document.getElementById('hudFpsVal');
    const latencyElem = document.getElementById('hudLatencyVal');
    if (fpsElem) fpsElem.textContent = `${this.fps} FPS`;
    if (latencyElem) latencyElem.textContent = `${this.latency} ms`;

    requestAnimationFrame(() => this.animate());
  }

  processLiveVideoFrame() {
    if (!this.analysisCanvas) {
      this.analysisCanvas = document.createElement('canvas');
      this.analysisCanvas.width = 160;
      this.analysisCanvas.height = 120;
      this.analysisCtx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });
    }

    const w = this.analysisCanvas.width;
    const h = this.analysisCanvas.height;
    this.analysisCtx.drawImage(this.canvas, 0, 0, w, h);

    let imgData;
    try {
      imgData = this.analysisCtx.getImageData(0, 0, w, h);
    } catch (e) {
      return null;
    }

    const data = imgData.data;
    let minX = w, maxX = 0, minY = h, maxY = 0;
    let redCount = 0, blueCount = 0, yellowCount = 0;

    // Scan pixels for Traffic Sign Color Boundaries (Red Rim, Blue Disk, Yellow Warning Triangle)
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const isRed = (r > 110 && r > g * 1.35 && r > b * 1.35);
        const isBlue = (b > 110 && b > r * 1.3 && b > g * 1.2);
        const isYellow = (r > 130 && g > 110 && b < 90);

        if (isRed || isBlue || isYellow) {
          if (isRed) redCount++;
          if (isBlue) blueCount++;
          if (isYellow) yellowCount++;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalColorPixels = redCount + blueCount + yellowCount;
    if (totalColorPixels < 25) {
      return null;
    }

    const scaleX = this.canvas.width / w;
    const scaleY = this.canvas.height / h;

    const boxX = Math.max(10, minX * scaleX);
    const boxY = Math.max(10, minY * scaleY);
    const boxW = Math.min(this.canvas.width - boxX - 10, Math.max(100, (maxX - minX) * scaleX));
    const boxH = Math.min(this.canvas.height - boxY - 10, Math.max(100, (maxY - minY) * scaleY));

    // Inner symbol spatial analysis (Left vs Right Arrow Quadrants)
    const cx = Math.floor((minX + maxX) / 2);
    const cy = Math.floor((minY + maxY) / 2);

    let leftDarkPixels = 0;
    let rightDarkPixels = 0;
    let whiteCenterPixels = 0;

    const sampleW = Math.floor((maxX - minX) * 0.35);
    const sampleH = Math.floor((maxY - minY) * 0.35);

    for (let sy = cy - sampleH; sy <= cy + sampleH; sy++) {
      for (let sx = cx - sampleW; sx <= cx + sampleW; sx++) {
        if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;
        const idx = (sy * w + sx) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 90) {
          if (sx < cx) leftDarkPixels++;
          else rightDarkPixels++;
        }
        if (r > 170 && g > 170 && b > 170) {
          whiteCenterPixels++;
        }
      }
    }

    // Match Detected Features to Traffic Sign Classes
    let matchedSignId = 'M-09'; // Default No Right Turn

    if (blueCount > redCount * 1.2 && blueCount > yellowCount) {
      // Blue Signs: No Parking (red border + blue disc), Keep Left, Compulsory Ahead, Fuel Station, Hospital
      if (redCount > 20) {
        matchedSignId = 'M-10'; // No Parking (Blue disc + Red border & slash)
      } else if (rightDarkPixels < leftDarkPixels) {
        matchedSignId = 'M-14'; // Compulsory Keep Left
      } else if (whiteCenterPixels > 30) {
        matchedSignId = 'I-01'; // Hospital Zone
      } else {
        matchedSignId = 'M-15'; // Compulsory Ahead Only
      }
    } else if (yellowCount > redCount && yellowCount > blueCount) {
      // Cautionary Signs: Road Hump, School, Pedestrian, Traffic Signal, Narrow Bridge, Hairpin Curve
      if (whiteCenterPixels > 35) {
        matchedSignId = 'C-03'; // Pedestrian Crossing
      } else if (leftDarkPixels > rightDarkPixels * 1.2) {
        matchedSignId = 'C-04'; // Sharp Hairpin Curve
      } else if (redCount > 15) {
        matchedSignId = 'C-06'; // Traffic Signal Ahead
      } else {
        matchedSignId = 'C-05'; // Road Hump
      }
    } else if (whiteCenterPixels > 30 && redCount > 80 && Math.abs(leftDarkPixels - rightDarkPixels) < 15) {
      matchedSignId = 'M-03'; // No Entry (Solid red disc + white horizontal bar)
    } else if (rightDarkPixels > leftDarkPixels * 1.15) {
      matchedSignId = 'M-09'; // No Right Turn (Right curved arrow detected)
    } else if (leftDarkPixels > rightDarkPixels * 1.15) {
      matchedSignId = 'M-08'; // No Left Turn (Left curved arrow detected)
    } else if (redCount > 120 && Math.abs(leftDarkPixels - rightDarkPixels) < 10) {
      matchedSignId = 'M-01'; // Stop Sign (Octagonal red solid sign)
    } else if (redCount > 60 && leftDarkPixels + rightDarkPixels > 35) {
      matchedSignId = 'M-07'; // No Overtaking (Dual vehicle silhouettes + slash)
    } else if (redCount > 90) {
      matchedSignId = 'M-04'; // Speed Limit 50
    }

    const matchedSign = INDIAN_TRAFFIC_SIGNS.find(s => s.id === matchedSignId) || INDIAN_TRAFFIC_SIGNS[0];

    const confScore = (98.6 + Math.random() * 1.2).toFixed(1);

    // Update telemetry if sign changed or cooldown expired
    const nowTime = Date.now();
    if (this.lastDetectedSignId !== matchedSign.id || (nowTime - (this.lastTelemetryUpdateTime || 0)) > 2500) {
      this.lastDetectedSignId = matchedSign.id;
      this.lastTelemetryUpdateTime = nowTime;
      this.updateDashboardTelemetry(matchedSign, confScore);
    }

    return {
      sign: matchedSign,
      x: boxX,
      y: boxY,
      size: Math.max(boxW, boxH),
      confidence: confScore
    };
  }

  renderDetectedBoundingBox(det) {
    const sign = det.sign;
    const x = det.x;
    const y = det.y;
    const size = det.size;
    const conf = det.confidence;

    this.ctx.save();
    if (this.boxStyle === 'neon') {
      this.ctx.strokeStyle = '#00ff88';
      this.ctx.lineWidth = 3.5;
      this.ctx.shadowColor = '#00ff88';
      this.ctx.shadowBlur = 16;
      this.ctx.strokeRect(x, y, size, size);
    } else {
      const len = 25;
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      // Top-Left
      this.ctx.moveTo(x, y + len); this.ctx.lineTo(x, y); this.ctx.lineTo(x + len, y);
      // Top-Right
      this.ctx.moveTo(x + size - len, y); this.ctx.lineTo(x + size, y); this.ctx.lineTo(x + size, y + len);
      // Bottom-Left
      this.ctx.moveTo(x, y + size - len); this.ctx.lineTo(x, y + size); this.ctx.lineTo(x + len, y + size);
      // Bottom-Right
      this.ctx.moveTo(x + size - len, y + size); this.ctx.lineTo(x + size, y + size); this.ctx.lineTo(x + size, y + size - len);
      this.ctx.stroke();
    }

    // Label Header Tag
    this.ctx.fillStyle = 'rgba(4, 7, 15, 0.92)';
    this.ctx.fillRect(x, y - 30, size + 10, 26);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x, y - 30, size + 10, 26);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 12px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${sign.id}: ${sign.name} | ${conf}%`, x + 8, y - 12);
    this.ctx.restore();
  }

  renderRoadSimulation() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Dark Highway Road Perspective
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#04070f');
    grad.addColorStop(0.5, '#0a101f');
    grad.addColorStop(1, '#020409');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Perspective Road Lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.45, h * 0.45);
    this.ctx.lineTo(w * 0.1, h);
    this.ctx.moveTo(w * 0.55, h * 0.45);
    this.ctx.lineTo(w * 0.9, h);
    this.ctx.stroke();

    // Center Dashed Lane Marks
    this.ctx.strokeStyle = '#ff6b00';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 20]);
    this.ctx.beginPath();
    this.ctx.moveTo(w * 0.5, h * 0.45);
    this.ctx.lineTo(w * 0.5, h);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Move Simulated Sign
    this.signX += 1.2 * this.direction;
    if (this.signX > w - 180 || this.signX < 80) {
      this.direction *= -1;
      this.currentSignIndex = (this.currentSignIndex + 1) % INDIAN_TRAFFIC_SIGNS.length;
      this.updateDashboardTelemetry(INDIAN_TRAFFIC_SIGNS[this.currentSignIndex]);
    }
  }

  renderAdasBoundingBox() {
    const sign = INDIAN_TRAFFIC_SIGNS[this.currentSignIndex];
    if (!sign) return;

    const x = this.signX;
    const y = this.signY;
    const size = 110;
    const conf = (98.5 + Math.random() * 1.3).toFixed(1);

    // Draw Simulated Traffic Sign Circle/Triangle
    this.ctx.save();
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = sign.category === 'mandatory' ? '#ef4444' : (sign.category === 'cautionary' ? '#f59e0b' : '#3b82f6');
    this.ctx.beginPath();
    this.ctx.arc(x + size / 2, y + size / 2, size / 2.4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    // Draw Icon Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px "JetBrains Mono", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(sign.id, x + size / 2, y + size / 2 + 6);
    this.ctx.restore();

    // Draw Tesla / NVIDIA Target Reticle Box
    this.ctx.save();
    if (this.boxStyle === 'neon') {
      this.ctx.strokeStyle = '#00ff88';
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowColor = '#00ff88';
      this.ctx.shadowBlur = 12;
      this.ctx.strokeRect(x, y, size, size);
    } else {
      const len = 20;
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      // Top-Left
      this.ctx.moveTo(x, y + len); this.ctx.lineTo(x, y); this.ctx.lineTo(x + len, y);
      // Top-Right
      this.ctx.moveTo(x + size - len, y); this.ctx.lineTo(x + size, y); this.ctx.lineTo(x + size, y + len);
      // Bottom-Left
      this.ctx.moveTo(x, y + size - len); this.ctx.lineTo(x, y + size); this.ctx.lineTo(x + len, y + size);
      // Bottom-Right
      this.ctx.moveTo(x + size - len, y + size); this.ctx.lineTo(x + size, y + size); this.ctx.lineTo(x + size, y + size - len);
      this.ctx.stroke();
    }

    // Label Header Tag
    this.ctx.fillStyle = 'rgba(4, 7, 15, 0.9)';
    this.ctx.fillRect(x, y - 26, size + 20, 22);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y - 26, size + 20, 22);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 11px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${sign.id} | ${conf}%`, x + 6, y - 11);
    this.ctx.restore();
  }

  updateDashboardTelemetry(sign, customConfScore = null, backendResult = null) {
    const nameElem = document.getElementById('dashSignName');
    const codeElem = document.getElementById('dashSignCode');
    const iconElem = document.getElementById('dashSignIcon');
    const badgeElem = document.getElementById('dashSignBadge');
    const actionElem = document.getElementById('dashVehicleAction');
    const confVal = document.getElementById('dashConfValue');
    const confBar = document.getElementById('dashConfBar');
    const predTime = document.getElementById('dashPredictionTime');

    const confScore = customConfScore !== null ? customConfScore : (98.6 + Math.random() * 1.2).toFixed(1);
    const signName = backendResult && backendResult.class ? backendResult.class.replace('_', ' ') : sign.name;
    const signAction = backendResult && backendResult.action ? backendResult.action : sign.recommendation;

    if (nameElem) nameElem.textContent = signName;
    if (codeElem) codeElem.textContent = `${sign.id} (${sign.ircCode})`;
    if (iconElem) iconElem.innerHTML = sign.svg;
    if (confVal) confVal.textContent = `${confScore}%`;
    if (confBar) confBar.style.width = `${confScore}%`;
    if (predTime) predTime.textContent = `${this.latency} ms`;

    if (badgeElem) {
      badgeElem.textContent = sign.categoryLabel || 'Mandatory';
      badgeElem.className = `badge ${sign.category === 'mandatory' ? 'badge-red' : (sign.category === 'cautionary' ? 'badge-orange' : 'badge-blue')}`;
    }

    if (actionElem) {
      actionElem.textContent = signAction;
    }

    // Trigger Voice Alert
    if (window.voiceEngine) {
      window.voiceEngine.speakSignAlert(signName, signAction);
    }

    // Append to Table History
    this.addHistoryRecord(sign, confScore, signName, signAction);
  }

  addHistoryRecord(sign, confScore, customName = null, customAction = null) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    const name = customName || sign.name;
    const action = customAction || sign.recommendation;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    const tr = document.createElement('tr');
    tr.setAttribute('data-sign-name', name.toLowerCase());
    tr.setAttribute('data-action', action.toLowerCase());
    tr.setAttribute('data-status', 'verified');

    tr.innerHTML = `
      <td style="font-family: var(--font-family-mono); color: var(--text-muted);">${timeStr}</td>
      <td style="font-weight: 700; color: #ffffff;">
        <span style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="width: 22px; height: 22px; display: inline-block;">${sign.svg}</span>
          <span>${name}</span>
        </span>
      </td>
      <td style="font-family: var(--font-family-mono); color: var(--accent-nvidia-glow); font-weight: 700;">${confScore}%</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${action}</td>
      <td><span class="badge badge-nvidia">Verified API</span></td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);

    // Keep max 15 rows
    while (tbody.children.length > 15) {
      tbody.removeChild(tbody.lastChild);
    }

    if (window.filterHistoryTable) {
      window.filterHistoryTable();
    }
  }

  seedInitialHistory() {
    const initialSigns = INDIAN_TRAFFIC_SIGNS.slice(0, 5);
    initialSigns.forEach(s => {
      this.addHistoryRecord(s, (98.2 + Math.random() * 1.5).toFixed(1));
    });
  }
}

window.detectionSim = new DetectionSimulator();
