// Browser-based AI Voice Assistant Narration Utility using SpeechSynthesis API
let isMuted = false;
let isSpeaking = false;
let speechQueue = [];
let isCurrentlySpeaking = false;
const listeners = new Set();

const notify = () => {
  listeners.forEach(listener => listener({ isMuted, isSpeaking }));
};

// Asynchronous loading of voices for browser compatibility
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

const processQueue = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  if (isMuted || speechQueue.length === 0 || isCurrentlySpeaking) {
    if (speechQueue.length === 0 && !isCurrentlySpeaking) {
      isSpeaking = false;
      notify();
    }
    return;
  }

  const nextText = speechQueue.shift();
  const utterance = new SpeechSynthesisUtterance(nextText);

  // Retrieve available voices on browser
  const voices = window.speechSynthesis.getVoices();
  
  // Prefer futuristic female English voices if available, fall back to best English
  let selectedVoice = voices.find(v => v.lang.startsWith('en') && (
    v.name.toLowerCase().includes('female') ||
    v.name.toLowerCase().includes('samantha') ||
    v.name.toLowerCase().includes('zira') ||
    v.name.toLowerCase().includes('tessa') ||
    v.name.toLowerCase().includes('google us english') ||
    v.name.toLowerCase().includes('hazel') ||
    v.name.toLowerCase().includes('susan')
  ));
  
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en'));
  }
  if (!selectedVoice) {
    selectedVoice = voices[0];
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Clear Cyberpunk AI SOC assistant speech profiles
  utterance.rate = 1.05; // Spoken with crisp promptness
  utterance.pitch = 1.05; // Futuristic clear tone

  utterance.onstart = () => {
    isCurrentlySpeaking = true;
    isSpeaking = true;
    notify();
  };

  utterance.onend = () => {
    isCurrentlySpeaking = false;
    processQueue();
  };

  utterance.onerror = (err) => {
    console.warn("SpeechSynthesis utterance error:", err);
    isCurrentlySpeaking = false;
    processQueue();
  };

  window.speechSynthesis.speak(utterance);
};

export const voiceNarrator = {
  subscribe(listener) {
    listeners.add(listener);
    listener({ isMuted, isSpeaking });
    return () => {
      listeners.delete(listener);
    };
  },

  toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      this.cancel();
    }
    notify();
    return isMuted;
  },

  setMuted(muted) {
    isMuted = muted;
    if (isMuted) {
      this.cancel();
    }
    notify();
  },

  speak(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isMuted) return;

    speechQueue.push(text);
    processQueue();
  },

  cancel() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    speechQueue = [];
    window.speechSynthesis.cancel();
    isCurrentlySpeaking = false;
    isSpeaking = false;
    notify();
  }
};
