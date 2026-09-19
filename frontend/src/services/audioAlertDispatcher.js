/**
 * GridGuard AI - Cyber-Physical Audio Alarm & Voice Alert Dispatcher
 * Provides:
 * 1. Web Audio API synthesized mission-control sonar chimes & warning sirens (zero external audio file dependency)
 * 2. Real-time Speech Synthesis (TTS) voice announcements for grid disturbance injections & automatic AI mitigations
 * 3. Operator voice mute/unmute toggle state persisted locally
 */

class AudioAlertDispatcher {
  constructor() {
    this.audioCtx = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
    this.voiceQueue = [];
    this.isSpeaking = false;
    this.selectedVoice = null;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gridguard_voice_alert_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
      this.initVoice();
    }
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  initVoice() {
    if (!this.synth) return;
    const updateVoice = () => {
      const voices = this.synth.getVoices();
      this.selectedVoice = voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Zira') ||
        v.name.includes('David')
      )) || voices[0] || null;
    };
    updateVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoice;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gridguard_voice_alert_muted', String(this.isMuted));
    }
    if (this.isMuted && this.synth) {
      this.synth.cancel();
    }
    return this.isMuted;
  }

  /**
   * Play high-tech synthesized audio pulse via Web Audio API
   * Type: 'alert' | 'critical' | 'mitigate' | 'nominal'
   */
  playTone(type = 'alert') {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'critical') {
        // Double fast high-alarm pulse (880Hz -> 440Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'mitigate') {
        // Calming harmonic chime (523.25Hz -> 659.25Hz -> 783.99Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Standard Cyber Ping (659.25Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn('Audio Tone generation failed:', e);
    }
  }

  /**
   * Dispatch spoken voice dispatch alert
   */
  dispatchVoiceAlert(message, toneType = 'alert') {
    if (this.isMuted) return;

    // Play tone chime first
    this.playTone(toneType);

    if (!this.synth) return;

    try {
      this.synth.cancel(); // Interrupt any backlog for immediate real-time dispatch

      const utterance = new SpeechSynthesisUtterance(message);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = 1.12; // Crisp, fast military / command dispatch tempo
      utterance.pitch = 1.02;
      utterance.volume = 0.9;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Voice dispatch failed:', e);
    }
  }

  // Pre-configured dispatchers for GridGuard events
  alertFaultInjected(faultKey, faultName) {
    const faultAlerts = {
      ev: 'Warning! EV Charging Fleet surge injected. Bus 4 frequency dip detected.',
      solar: 'Alert! Convective solar drop. 65% renewable loss on Bus 5.',
      wind: 'Warning! Coastal wind stall. Turbine output depressed by 50%.',
      industrial: 'Critical inrush current! Heavy industrial motor startup on Bus 3.',
      datacenter: 'Telemetry warning: GPU AI cluster surge on Bus 2.',
      battery: 'Critical failure: Central BESS battery storage offline! Synthetic inertia lost.'
    };
    const msg = faultAlerts[faultKey] || `Warning! ${faultName} disturbance active.`;
    this.dispatchVoiceAlert(msg, faultKey === 'battery' ? 'critical' : 'alert');
  }

  alertFaultCleared(faultKey, faultName) {
    this.dispatchVoiceAlert(`${faultName} cleared. Feeder parameters returning to nominal.`, 'mitigate');
  }

  alertAllMitigated() {
    this.dispatchVoiceAlert('Prescriptive AI countermeasure executed. All faults isolated. Grid stabilized in green zone.', 'mitigate');
  }
}

export const audioAlertDispatcher = new AudioAlertDispatcher();
