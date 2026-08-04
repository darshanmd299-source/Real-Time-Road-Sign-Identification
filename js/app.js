/* ==========================================================================
   MAIN APPLICATION CONTROLLER & INTERACTION HANDLERS
   BharatSign AI - App Logic, Settings & Voice Alert Control
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Trigger AI Loading Sequence on Initial App Load
  triggerAiLoaderSequence();

  // 2. Initialize Core Engines
  if (window.detectionSim) window.detectionSim.init();
  if (window.telemetry) window.telemetry.init();
  if (window.apiViewer) window.apiViewer.init();

  // 3. Navigation Smooth Scrolling & ScrollSpy
  initNavigation();

  // 4. Dataset Signs Grid & Filter
  renderDatasetGrid('all');
  initDatasetFilters();

  // 5. Search & Filter Functionality for Detection History Table
  initHistoryTableFilter();

  // 6. Source Switcher (Highway Stream / Webcam / Photo)
  initSourceSwitchers();

  // 7. Camera Controls
  initCameraControls();

  // 8. Voice Alert UI Controls
  initVoiceAlertUiControls();

  // 9. Settings Controller
  initSettingsController();

  // 10. Modal Handlers
  initModalHandlers();
});

// --------------------------------------------------------------------------
// 1. AI LOADING ANIMATION SEQUENCE (3 STAGES)
// --------------------------------------------------------------------------
function triggerAiLoaderSequence(callback) {
  const overlay = document.getElementById('aiLoaderOverlay');
  const loaderText = document.getElementById('aiLoaderText');
  const loaderSubText = document.getElementById('aiLoaderSubText');
  const loaderFill = document.getElementById('aiLoaderFill');

  if (!overlay || !loaderText || !loaderFill) {
    if (callback) callback();
    return;
  }

  overlay.classList.add('active');
  loaderFill.style.width = '0%';

  loaderText.textContent = 'Loading CNN Model...';
  if (loaderSubText) loaderSubText.textContent = 'Loading TensorRT FP16 Weights & MobileNetV3 Backbone';
  setTimeout(() => { loaderFill.style.width = '35%'; }, 100);

  setTimeout(() => {
    loaderText.textContent = 'Initializing Camera...';
    if (loaderSubText) loaderSubText.textContent = 'Configuring WebRTC Sensor Stream (1080p@60FPS)';
    loaderFill.style.width = '70%';
  }, 1100);

  setTimeout(() => {
    loaderText.textContent = 'Preparing Detection...';
    if (loaderSubText) loaderSubText.textContent = 'Calibrating CLAHE Contrast & Bounding Box Anchors';
    loaderFill.style.width = '100%';
  }, 2200);

  setTimeout(() => {
    overlay.classList.remove('active');
    if (callback) callback();
  }, 3100);
}

// --------------------------------------------------------------------------
// 2. Voice Alert UI Controls (Speaker Mute Toggle & Volume Slider)
// --------------------------------------------------------------------------
function initVoiceAlertUiControls() {
  const muteBtn = document.getElementById('voiceMuteToggleBtn');
  const muteIcon = document.getElementById('voiceMuteIcon');
  const volSlider = document.getElementById('voiceVolumeSlider');
  const volDisplay = document.getElementById('voiceVolValDisplay');

  if (muteBtn && window.voiceEngine) {
    muteBtn.addEventListener('click', () => {
      const isEnabled = window.voiceEngine.toggleMute();
      if (muteIcon) {
        muteIcon.textContent = isEnabled ? '🔊' : '🔇';
      }
      muteBtn.style.borderColor = isEnabled ? 'rgba(0, 240, 255, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    });
  }

  if (volSlider && window.voiceEngine) {
    volSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      window.voiceEngine.setVolume(val);
      if (volDisplay) {
        volDisplay.textContent = `${Math.round(val * 100)}%`;
      }
    });
  }
}

// --------------------------------------------------------------------------
// 3. Navigation Smooth Scrolling & ScrollSpy
// --------------------------------------------------------------------------
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  const navToggleBtn = document.getElementById('navToggleBtn');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    const scrollPos = window.pageYOffset + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  if (navToggleBtn && navMenu) {
    navToggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}

// --------------------------------------------------------------------------
// 4. Settings Page Controller
// --------------------------------------------------------------------------
function initSettingsController() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const cameraSelect = document.getElementById('cameraSelect');
  const confSlider = document.getElementById('confidenceThresholdSlider');
  const confValDisplay = document.getElementById('confSliderValueDisplay');
  const langSelect = document.getElementById('languageSelect');
  const saveBtn = document.getElementById('saveSettingsBtn');

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && cameraSelect) {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      cameraSelect.innerHTML = '';
      if (videoDevices.length === 0) {
        cameraSelect.innerHTML = `
          <option value="default">Front Dashcam (Integrated WebCam)</option>
          <option value="usb1">Secondary Road Sensor (USB Cam 02)</option>
        `;
      } else {
        videoDevices.forEach((device, index) => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.textContent = device.label || `Camera Sensor ${index + 1} (${device.deviceId.slice(0, 8)}...)`;
          cameraSelect.appendChild(option);
        });
      }
    }).catch(() => {
      cameraSelect.innerHTML = `
        <option value="default">Front Dashcam (Integrated WebCam)</option>
        <option value="usb1">Secondary Road Sensor (USB Cam 02)</option>
      `;
    });
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      if (!e.target.checked) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
    });
  }

  if (confSlider && confValDisplay) {
    confSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      confValDisplay.textContent = `${val}%`;
      if (window.detectionSim) {
        window.detectionSim.confThreshold = val / 100;
      }
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const lang = e.target.value;
      if (window.voiceEngine) {
        window.voiceEngine.language = lang;
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const savedLang = langSelect ? langSelect.value : 'en-IN';
      const savedConf = confSlider ? confSlider.value : '75';
      const isDark = darkModeToggle ? darkModeToggle.checked : true;

      localStorage.setItem('bharat_dark_mode', isDark);
      localStorage.setItem('bharat_conf_thresh', savedConf);
      localStorage.setItem('bharat_language', savedLang);

      alert(`✅ System Settings Saved Successfully!\n\n• Theme Mode: ${isDark ? 'Dark Mode' : 'Light Mode'}\n• Minimum Confidence: ${savedConf}%\n• Voice Alert Language: ${savedLang}\n• Camera Sensor: Connected & Calibrated`);
    });
  }
}

// --------------------------------------------------------------------------
// 5. Search & Filter Engine for Detection History Table
// --------------------------------------------------------------------------
function initHistoryTableFilter() {
  const searchInput = document.getElementById('tableSearchInput');
  const statusFilter = document.getElementById('tableStatusFilter');

  window.filterHistoryTable = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStatus = statusFilter ? statusFilter.value.toLowerCase() : 'all';

    const rows = document.querySelectorAll('#historyTableBody tr');
    let visibleCount = 0;

    rows.forEach(row => {
      const signName = row.getAttribute('data-sign-name') || '';
      const actionText = row.getAttribute('data-action') || '';
      const rowStatus = row.getAttribute('data-status') || '';
      const rowText = row.textContent.toLowerCase();

      const matchesQuery = !query || rowText.includes(query) || signName.includes(query) || actionText.includes(query);
      const matchesStatus = selectedStatus === 'all' || rowStatus === selectedStatus;

      if (matchesQuery && matchesStatus) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const badge = document.getElementById('historyCounterBadge');
    if (badge) {
      badge.textContent = `${visibleCount} Records Shown`;
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', window.filterHistoryTable);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', window.filterHistoryTable);
  }
}

// --------------------------------------------------------------------------
// 6. Render Dataset Signs Cards Grid
// --------------------------------------------------------------------------
function renderDatasetGrid(categoryFilter = 'all', searchQuery = '') {
  const container = document.getElementById('signsGridContainer');
  if (!container) return;

  const filtered = INDIAN_TRAFFIC_SIGNS.filter(sign => {
    const matchesCat = categoryFilter === 'all' || sign.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      sign.name.toLowerCase().includes(q) || 
      sign.id.toLowerCase().includes(q) || 
      sign.ircCode.toLowerCase().includes(q) ||
      sign.categoryLabel.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);" class="glass-panel">
        <h3>No traffic signs match your filter criteria</h3>
        <p>Try searching for "Speed Limit", "Stop", or "School Ahead"</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(sign => {
    const badgeClass = sign.category === 'mandatory' ? 'badge-red' : (sign.category === 'cautionary' ? 'badge-orange' : 'badge-blue');

    html += `
      <div class="glass-panel sign-card tech-corners" onclick="openSignModal('${sign.id}')">
        <div class="sign-code">${sign.id}</div>
        <div class="sign-preview">${sign.svg}</div>
        <div class="sign-name">${sign.name}</div>
        <div class="badge ${badgeClass}" style="margin-bottom: 0.6rem;">${sign.categoryLabel}</div>
        <div class="sign-desc">${sign.description}</div>
        <button class="btn btn-glass btn-sm style-100" style="margin-top: auto; width: 100%;">Inspect Sign Rules</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// --------------------------------------------------------------------------
// 7. Dataset Category Tabs & Search Filter
// --------------------------------------------------------------------------
function initDatasetFilters() {
  const categoryBtns = document.querySelectorAll('.category-btn');
  const searchInput = document.getElementById('signSearchInput');

  let activeCat = 'all';

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-category');
      renderDatasetGrid(activeCat, searchInput ? searchInput.value : '');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderDatasetGrid(activeCat, e.target.value);
    });
  }
}

// --------------------------------------------------------------------------
// 8. Source Switcher (Highway / Webcam / Photo)
// --------------------------------------------------------------------------
function initSourceSwitchers() {
  const tabBtns = document.querySelectorAll('.source-tab-btn');
  const uploadArea = document.getElementById('fileUploadArea');
  const fileInput = document.getElementById('imageFileInput');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');

      if (mode === 'webcam') {
        if (uploadArea) uploadArea.style.display = 'none';
        triggerAiLoaderSequence(async () => {
          const success = await window.detectionSim.startWebcam();
          if (!success) {
            tabBtns[0].classList.add('active');
            btn.classList.remove('active');
          }
        });
      } else if (mode === 'uploaded') {
        window.detectionSim.stopWebcam();
        if (uploadArea) uploadArea.style.display = 'flex';
      } else {
        window.detectionSim.stopWebcam();
        if (uploadArea) uploadArea.style.display = 'none';
      }
    });
  });

  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        window.detectionSim.handleCustomImageUpload(e.target.files[0]);
        uploadArea.style.display = 'none';
      }
    });
  }
}

// --------------------------------------------------------------------------
// 9. Camera Controls
// --------------------------------------------------------------------------
function initCameraControls() {
  const startCamBtn = document.getElementById('startCamBtn');
  const stopCamBtn = document.getElementById('stopCamBtn');
  const heroStartBtn = document.getElementById('heroStartDetectionBtn');

  if (startCamBtn) {
    startCamBtn.addEventListener('click', async () => {
      const webcamTab = document.querySelector('.source-tab-btn[data-mode="webcam"]');
      if (webcamTab) webcamTab.click();
    });
  }

  if (heroStartBtn) {
    heroStartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
      triggerAiLoaderSequence();
    });
  }

  if (stopCamBtn) {
    stopCamBtn.addEventListener('click', () => {
      window.detectionSim.stopWebcam();
      const simTab = document.querySelector('.source-tab-btn[data-mode="simulated"]');
      if (simTab) simTab.click();
    });
  }
}

// --------------------------------------------------------------------------
// 10. Modal Inspection Logic
// --------------------------------------------------------------------------
function initModalHandlers() {
  const backdrop = document.getElementById('signModalBackdrop');
  const closeBtn = document.getElementById('modalCloseBtn');

  window.openSignModal = (signId) => {
    const sign = INDIAN_TRAFFIC_SIGNS.find(s => s.id === signId);
    if (!sign) return;

    document.getElementById('modalSignSvg').innerHTML = sign.svg;
    document.getElementById('modalSignTitle').textContent = sign.name;
    document.getElementById('modalSignCode').textContent = `${sign.id} | ${sign.ircCode}`;
    document.getElementById('modalSignDesc').textContent = sign.description;
    document.getElementById('modalSignAction').textContent = sign.recommendation;
    document.getElementById('modalMvActSection').textContent = `${sign.penaltyRule} (MV Act)`;
    document.getElementById('modalFineAmount').textContent = sign.fineAmount;

    const catBadge = document.getElementById('modalSignCategory');
    catBadge.textContent = sign.categoryLabel;
    catBadge.className = `badge ${sign.category === 'mandatory' ? 'badge-red' : (sign.category === 'cautionary' ? 'badge-orange' : 'badge-blue')}`;

    backdrop.classList.add('active');
  };

  if (closeBtn && backdrop) {
    closeBtn.addEventListener('click', () => backdrop.classList.remove('active'));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });
  }
}
