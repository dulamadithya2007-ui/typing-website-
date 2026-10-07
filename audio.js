/**
 * Audio Synthesizer Engine using Web Audio API.
 * Synthesizes mechanical keyboard clicks, countdown tones, engine revs, nitro whoosh, and victory fanfares.
 * 100% standalone with zero external audio assets required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.keyVolume = 0.25;
    this.sfxVolume = 0.35;
    this.initFromStorage();
  }

  initFromStorage() {
    const saved = localStorage.getItem("typeracer_sound_enabled");
    if (saved !== null) {
      this.enabled = saved === "true";
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem("typeracer_sound_enabled", this.enabled);
    return this.enabled;
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Crisp mechanical keyboard switch sound (Clicky Blue / Thock style)
   */
  playKeyClick(isSpace = false) {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Transient impulse / click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Noise burst for mechanical feel
    const bufferSize = ctx.sampleRate * 0.02; // 20ms burst
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(isSpace ? 1400 : 2800 + Math.random() * 400, now);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = ctx.createGain();
    const vol = this.keyVolume * (isSpace ? 1.2 : 0.9);
    noiseGain.gain.setValueAtTime(vol * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Tonal bottom-out "thock"
    osc.type = "sine";
    const baseFreq = isSpace ? 180 : 320 + Math.random() * 40;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Mistake buzzer / metallic thud
   */
  playError() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Countdown racing lights (3... 2... 1... GO!)
   */
  playCountdown(count) {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isGo = count === 0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isGo ? "triangle" : "sine";
    const freq = isGo ? 880 : 440; // High A5 tone for GO, A4 for 3, 2, 1
    osc.frequency.setValueAtTime(freq, now);

    const duration = isGo ? 0.45 : 0.18;
    gain.gain.setValueAtTime(this.sfxVolume * (isGo ? 0.8 : 0.6), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * High-octane Nitro boost whoosh + jet stream
   */
  playNitro() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.6;

    // Filtered noise sweep
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(2.0, now);
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(800, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Sub synth punch
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

    subGain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    noise.start(now);
    subOsc.start(now);
    subOsc.stop(now + 0.35);
  }

  /**
   * Victory Grand Prix Fanfare (Major arpeggio celebration)
   */
  playVictory() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
      { freq: 659.25, time: 0.14, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.18 }, // G5
      { freq: 1046.50, time: 0.44, dur: 0.60 } // C6
    ];

    notes.forEach(n => {
      const start = ctx.currentTime + n.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.freq, start);

      gain.gain.setValueAtTime(this.sfxVolume * 0.7, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + n.dur + 0.05);
    });
  }

  /**
   * Engine rev sound on race start or car preview
   */
  playEngineRev() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.55);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.55);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  }
}

const sounds = new SoundEngine();

