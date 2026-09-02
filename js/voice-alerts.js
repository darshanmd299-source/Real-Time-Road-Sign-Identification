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

    if (sName.includes('no entry')) {
      return "Warning! No Entry sign ahead. Do not proceed in this direction.";
    } else if (sName.includes('no overtaking') || sName.includes('overtaking')) {
      return "Warning! No Overtaking zone. Do not attempt to pass vehicles.";
    } else if (sName.includes('no left turn')) {
      return "Caution! No Left Turn permitted at this junction.";
    } else if (sName.includes('no right turn')) {
      return "Caution! No Right Turn permitted at this junction.";
    } else if (sName.includes('no u-turn') || sName.includes('u-turn')) {
      return "Warning! No U-Turn permitted here.";
    } else if (sName.includes('road hump') || sName.includes('hump') || sName.includes('speed breaker')) {
      return "Caution! Road Hump ahead. Reduce speed to 20 kilometers per hour.";
    } else if (sName.includes('no parking') || sName.includes('parking prohibited')) {
      return "Notice! No Parking zone. Towing enforced.";
    } else if (sName.includes('stop')) {
      return "Warning! Stop sign detected. Apply brakes immediately.";
    } else if (sName.includes('give way') || sName.includes('yield')) {
      return "Yield! Give Way sign detected. Prepare to yield right-of-way.";
    } else if (sName.includes('speed limit')) {
      const match = signName.match(/\d+/);
      const limit = match ? match[0] : '50';
      return `Speed Limit ${limit} kilometers per hour detected. Maintain safe speed.`;
    } else if (sName.includes('school')) {
      return "Caution! School Zone ahead. Slow down and watch for children.";
    } else if (sName.includes('pedestrian')) {
      return "Caution! Pedestrian Crossing ahead.";
    } else if (sName.includes('traffic signal') || sName.includes('signal')) {
      return "Caution! Automated Traffic Signal Junction ahead.";
    } else if (sName.includes('keep left')) {
      return "Notice! Compulsory Keep Left lane.";
    } else if (sName.includes('ahead only') || sName.includes('compulsory ahead')) {
      return "Notice! Compulsory Ahead Only lane.";
    } else if (sName.includes('hospital')) {
      return "Informational! Hospital Zone ahead. Silence zone enforced.";
    } else if (sName.includes('fuel') || sName.includes('petrol')) {
      return "Informational! Fuel station ahead on service lane.";
    } else if (sName.includes('bridge') || sName.includes('narrow')) {
      return "Caution! Narrow Bridge ahead. Proceed single file.";
    } else if (sName.includes('hairpin') || sName.includes('curve')) {
      return "Caution! Sharp Hairpin Curve ahead. Sound horn before turn.";
    }

    return `${signName} detected ahead. Exercise caution.`;
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
