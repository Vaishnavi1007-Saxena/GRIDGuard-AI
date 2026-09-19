/**
 * Modular Speech Service for GRIDGUARD AI Bot
 * Handles Speech-to-Text (STT via SpeechRecognition)
 * and Text-to-Speech (TTS via SpeechSynthesis)
 * Cleanly abstracted so cloud providers can be swapped if needed.
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.initRecognition();
    this.initVoice();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  initVoice() {
    if (!this.synth) return;
    const setVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer natural English voices
      this.selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))) || voices[0] || null;
    };
    setVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoice;
    }
  }

  isSTTSupported() {
    return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  }

  isTTSSupported() {
    return !!(typeof window !== 'undefined' && window.speechSynthesis);
  }

  /**
   * Start recording user voice
   * @param {Function} onInterim Callback for live interim words
   * @param {Function} onFinal Callback when speech is finalized
   * @param {Function} onError Error callback
   * @param {Function} onEnd End callback
   */
  startListening(onInterim, onFinal, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome/Edge or text input.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (onInterim && interimTranscript) {
        onInterim(interimTranscript);
      }
      if (finalTranscript && onFinal) {
        onFinal(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  /**
   * Speak text out loud using browser speech synthesis
   * @param {string} text Markdown or plain text to speak
   * @param {Function} onStart
   * @param {Function} onEnd
   */
  speak(text, onStart, onEnd) {
    if (!this.synth) return;

    // Stop any ongoing speech
    this.synth.cancel();

    // Strip markdown characters for natural speech
    const cleanText = text
      .replace(/[*#_`~>[\]]/g, '')
      .replace(/###/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 350); // Keep spoken speech concise

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
