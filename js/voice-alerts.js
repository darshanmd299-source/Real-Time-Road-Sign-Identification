/* ==========================================================================
   BILINGUAL AI VOICE ALERT ENGINE (TEXT-TO-SPEECH)
   BharatSign AI - ADAS Driver Speech Synthesis
   ========================================================================== */

class VoiceAlertEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.enabled = true;
    this.volume = 0.85;
    this.language = 'en-IN';
    this.lastAnnouncedSign = null;
    this.lastAnnouncedTime = 0;
    this.cooldownMs = 3000; // 3-second debounce to prevent spamming
    this.femaleVoice = null;

    this.initVoices();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.initVoices();
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    
    // Select professional female English voice by default
    this.femaleVoice = voices.find(v => 
      (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Google US English')) &&
      v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, parseFloat(vol)));
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.synth) {
      this.synth.cancel();
    }
    return this.enabled;
  }

  generateCustomAlertMessage(signName) {
    const sName = signName.toLowerCase();

    if (sName.includes('stop')) {
      return "Warning! Stop sign detected. Apply brakes.";
    } else if (sName.includes('speed limit')) {
      const match = signName.match(/\d+/);
      const limit = match ? match[0] : '40';
      return `Speed Limit ${limit} detected. Reduce speed.`;
    } else if (sName.includes('no entry')) {
      return "Warning! No Entry sign ahead.";
    } else if (sName.includes('left turn') || sName.includes('turn left')) {
      return "Turn Left ahead.";
    } else if (sName.includes('right turn') || sName.includes('turn right')) {
      return "Turn Right ahead.";
    } else if (sName.includes('pedestrian')) {
      return "Caution! Pedestrian Crossing ahead.";
    } else if (sName.includes('school')) {
      return "Caution! School Zone ahead. Slow down.";
    } else if (sName.includes('give way')) {
      return "Yield! Give Way sign detected.";
    }

    return `${signName} detected ahead.`;
  }

  speakSignAlert(signName, recommendation = '') {
    if (!this.enabled || !this.synth) return;

    const now = Date.now();
    // 3-second debounce rule for duplicate sign
    if (this.lastAnnouncedSign === signName && (now - this.lastAnnouncedTime) < this.cooldownMs) {
      return;
    }

    this.lastAnnouncedSign = signName;
    this.lastAnnouncedTime = now;

    const alertMessage = this.generateCustomAlertMessage(signName);

    // Cancel current queued speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(alertMessage);
    utterance.volume = this.volume;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    if (this.femaleVoice) {
      utterance.voice = this.femaleVoice;
    }

    this.synth.speak(utterance);

    // Update UI Voice Message Banner
    this.updateVoiceDisplayBanner(alertMessage);
  }

  updateVoiceDisplayBanner(msg) {
    const bannerText = document.getElementById('voiceAlertBannerText');
    const bannerCard = document.getElementById('voiceAlertBannerCard');

    if (bannerText) {
      bannerText.textContent = `🗣️ "${msg}"`;
    }

    if (bannerCard) {
      bannerCard.classList.add('voice-speaking-pulse');
      setTimeout(() => {
        bannerCard.classList.remove('voice-speaking-pulse');
      }, 2500);
    }
  }
}

window.voiceEngine = new VoiceAlertEngine();
