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

    if (this.mode === 'webcam' && this.videoElement.readyState >= 2) {
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
    } else if (this.mode === 'uploaded' && this.customImage) {
      this.ctx.drawImage(this.customImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.renderRoadSimulation();
    }

    // Render Tesla/NVIDIA Cyber ADAS Overlay & Bounding Box
    this.renderAdasBoundingBox();

    // Update HUD counters
    const fpsElem = document.getElementById('hudFpsVal');
    const latencyElem = document.getElementById('hudLatencyVal');
    if (fpsElem) fpsElem.textContent = `${this.fps} FPS`;
    if (latencyElem) latencyElem.textContent = `${this.latency} ms`;

    requestAnimationFrame(() => this.animate());
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
      // Tech Corner Brackets
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

  updateDashboardTelemetry(sign) {
    const nameElem = document.getElementById('dashSignName');
    const codeElem = document.getElementById('dashSignCode');
    const iconElem = document.getElementById('dashSignIcon');
    const badgeElem = document.getElementById('dashSignBadge');
    const actionElem = document.getElementById('dashVehicleAction');
    const confVal = document.getElementById('dashConfValue');
    const confBar = document.getElementById('dashConfBar');
    const predTime = document.getElementById('dashPredictionTime');

    const confScore = (98.6 + Math.random() * 1.2).toFixed(1);

    if (nameElem) nameElem.textContent = sign.name;
    if (codeElem) codeElem.textContent = `${sign.id} (${sign.ircCode})`;
    if (iconElem) iconElem.innerHTML = sign.svg;
    if (confVal) confVal.textContent = `${confScore}%`;
    if (confBar) confBar.style.width = `${confScore}%`;
    if (predTime) predTime.textContent = `${this.latency} ms`;

    if (badgeElem) {
      badgeElem.textContent = sign.categoryLabel;
      badgeElem.className = `badge ${sign.category === 'mandatory' ? 'badge-red' : (sign.category === 'cautionary' ? 'badge-orange' : 'badge-blue')}`;
    }

    if (actionElem) {
      actionElem.textContent = sign.recommendation;
    }

    // Trigger Voice Alert
    if (window.voiceEngine) {
      window.voiceEngine.speakSignAlert(sign.name, sign.recommendation);
    }

    // Append to Table History
    this.addHistoryRecord(sign, confScore);
  }

  addHistoryRecord(sign, confScore) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    const tr = document.createElement('tr');
    tr.setAttribute('data-sign-name', sign.name.toLowerCase());
    tr.setAttribute('data-action', sign.recommendation.toLowerCase());
    tr.setAttribute('data-status', 'verified');

    tr.innerHTML = `
      <td style="font-family: var(--font-family-mono); color: var(--text-muted);">${timeStr}</td>
      <td style="font-weight: 700; color: #ffffff;">
        <span style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="width: 22px; height: 22px; display: inline-block;">${sign.svg}</span>
          <span>${sign.name}</span>
        </span>
      </td>
      <td style="font-family: var(--font-family-mono); color: var(--accent-nvidia-glow); font-weight: 700;">${confScore}%</td>
      <td style="font-size: 0.85rem; color: var(--text-muted);">${sign.recommendation}</td>
      <td><span class="badge badge-nvidia">Verified</span></td>
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
