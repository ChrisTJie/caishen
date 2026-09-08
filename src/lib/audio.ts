const BGM_SRC = `${import.meta.env.BASE_URL}viacheslavstarostin-chinese-lunar-new-year-465871.mp3`;
const BGM_VOLUME = 0.18;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

class AudioService {
  private ctx: AudioContext | null = null;
  private muted = true;
  private bgm: HTMLAudioElement | null = null;
  private oscillators = new Set<OscillatorNode>();
  private fallbackTimer: number | null = null;
  private fallbackIndex = 0;
  private usingFallback = false;

  private init() {
    if (this.ctx || typeof window === 'undefined') return;
    const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
  }

  async ensureResumed(): Promise<void> {
    this.init();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private connectOsc(
    type: OscillatorType,
    freq: number,
    gainValue: number,
    duration: number,
    when = 0,
  ) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(Math.max(gainValue, 0.001), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    this.oscillators.add(osc);
    osc.onended = () => this.oscillators.delete(osc);
    osc.start(now);
    osc.stop(now + duration);
  }

  private stopAllOsc() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
    this.oscillators.clear();
  }

  async playGong() {
    if (this.muted) return;
    await this.ensureResumed();
    [110, 165, 220, 330].forEach((freq, i) => {
      this.connectOsc(i === 0 ? 'sine' : 'triangle', freq, 0.3 / (i + 1), 2.5);
    });
  }

  async playClick() {
    if (this.muted) return;
    await this.ensureResumed();
    this.connectOsc('square', 1200, 0.03, 0.05);
  }

  async playWin() {
    if (this.muted) return;
    await this.ensureResumed();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.connectOsc('triangle', freq, 0.2, 1.5, i * 0.1);
    });
  }

  private ensureBgmElement() {
    if (this.bgm) return this.bgm;
    const audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = BGM_VOLUME;
    audio.addEventListener('error', () => {
      if (!this.muted) this.startFallbackBGM();
    });
    this.bgm = audio;
    return audio;
  }

  private stopFallback() {
    if (this.fallbackTimer != null) {
      window.clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    this.usingFallback = false;
  }

  private startFallbackBGM() {
    this.stopFallback();
    this.usingFallback = true;
    const phrase = [
      { freq: 196.0, duration: 900 },
      { freq: 261.63, duration: 900 },
      { freq: 329.63, duration: 1200 },
      { freq: 392.0, duration: 700 },
      { freq: 329.63, duration: 700 },
      { freq: 293.66, duration: 1100 },
      { freq: 261.63, duration: 1600 },
      { freq: 0, duration: 1400 },
    ];
    this.fallbackIndex = 0;

    const tick = () => {
      if (this.muted || !this.usingFallback) return;
      const note = phrase[this.fallbackIndex % phrase.length];
      this.fallbackIndex += 1;
      if (note.freq > 0) {
        this.connectOsc('triangle', note.freq, 0.045, note.duration / 1000 + 0.4);
        this.connectOsc('sine', note.freq / 2, 0.02, note.duration / 1000 + 0.6);
      }
      this.fallbackTimer = window.setTimeout(tick, note.duration);
    };
    tick();
  }

  async startBGM() {
    this.muted = false;
    this.stopFallback();
    const audio = this.ensureBgmElement();

    try {
      await audio.play();
    } catch {
      await this.ensureResumed();
      this.startFallbackBGM();
    }
  }

  stopBGM() {
    this.stopFallback();
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopBGM();
      this.stopAllOsc();
    }
  }

  isMuted() {
    return this.muted;
  }
}

export const audioService = new AudioService();
