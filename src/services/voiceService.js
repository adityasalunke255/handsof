// Unified Voice Engine for Business Saathi
// Supports Text-To-Speech (TTS) & Speech-To-Text (STT) for Hindi, Marathi, and English

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.voices = [];
    this.audioCtx = null;
    
    if (typeof window !== 'undefined') {
      this.initVoices();
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  // Generate subtle pleasant feedback chime using Web Audio API
  playTone(type = 'cue') {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'mic') {
        osc.frequency.setValueAtTime(440, now); // A4
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else {
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.debug('Tone audio context error:', e);
    }
  }

  // Get best voice match for the selected language
  getVoiceForLanguage(langCode) {
    if (!this.voices.length) {
      this.initVoices();
    }

    const map = {
      hi: ['hi-IN', 'hi', 'hindi'],
      mr: ['mr-IN', 'mr', 'marathi', 'hi-IN'], // fallback to hi-IN if Marathi voice is not installed on OS
      en: ['en-IN', 'en-GB', 'en-US', 'en']
    };

    const targetTags = map[langCode] || ['en-IN', 'en'];

    for (const tag of targetTags) {
      const found = this.voices.find(v => 
        v.lang.toLowerCase().includes(tag.toLowerCase()) || 
        v.name.toLowerCase().includes(tag.toLowerCase())
      );
      if (found) return found;
    }

    return this.voices[0] || null;
  }

  // Speak text with onStart, onEnd callbacks for UI animation
  speak(text, langCode = 'hi', { onStart, onEnd, onBoundary } = {}) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this environment');
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing utterance
    this.synth.cancel();

    if (!text) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice properties tailored for low-literacy clarity
    utterance.rate = 0.95; // Slightly slower, easy to understand
    utterance.pitch = 1.05;

    const matchedVoice = this.getVoiceForLanguage(langCode);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set utterance language tag
    const langMap = { hi: 'hi-IN', mr: 'mr-IN', en: 'en-IN' };
    utterance.lang = langMap[langCode] || 'hi-IN';

    utterance.onstart = () => {
      this.playTone('cue');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Check if browser supports Speech Recognition
  isSTTSupported() {
    return typeof window !== 'undefined' && 
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Start Speech-To-Text voice dictation
  startListening(langCode = 'hi', { onResult, onStart, onEnd, onError }) {
    if (!this.isSTTSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return null;
    }

    // Stop speaking while listening to avoid microphone feedback
    this.stopSpeaking();

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();

    const langMap = { hi: 'hi-IN', mr: 'mr-IN', en: 'en-IN' };
    this.recognition.lang = langMap[langCode] || 'hi-IN';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.playTone('mic');
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('STT Error:', event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      this.isListening = false;
      if (onError) onError(e.message);
    }

    return this.recognition;
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceService = new VoiceService();
