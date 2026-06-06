// Web Audio API Halal Soundscape Generator
// Synthesizes organic UI sound effects (clicks & hovers) dynamically without background ambient music.

class HalalAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false; // Start unmuted so users get immediate hover feedback
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
    this.initialized = true;
  }

  toggleMute() {
    this.init();

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playClick() {
    this.init();
    if (this.isMuted || !this.initialized) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Organic synthetic click: quick decay
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playHover() {
    this.init();
    if (this.isMuted || !this.initialized) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Soft UI ping
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.012, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }
}

export const audioManager = new HalalAudioManager();
