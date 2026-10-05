// Web Audio API Procedural Sound Synthesizer for Bike Engine, Stunts, Background Music, and FX

class SoundFX {
  private ctx: AudioContext | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private nitroGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private lastThrottle: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private isGameActive: boolean = false;

  // Weather wind ambience
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private isWindPlaying: boolean = false;

  // Background Music (BGM) system
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private isMusicMuted: boolean = false;
  private musicVolume: number = 0.75;
  private sfxVolume: number = 0.8;
  private musicTimer: number | null = null;
  private musicStep: number = 0;
  private nextNoteTime: number = 0;
  private readonly tempo: number = 82; // 82 BPM Gangsta's Paradise West-Coast Hip-Hop Beat

  constructor() {
    // Lazy initialize on first user gesture
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      const currentMasterGain = (this.isMuted ? 0 : this.sfxVolume * 0.85);
      this.masterGain.gain.setValueAtTime(currentMasterGain, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Separate gain for background music so it can be controlled cleanly
      this.musicGain = this.ctx.createGain();
      const currentMusicGain = (this.isMusicMuted ? 0 : this.musicVolume * 0.45);
      this.musicGain.gain.setValueAtTime(currentMusicGain, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public setGameActive(active: boolean) {
    this.isGameActive = active;
  }

  public getIsGameActive(): boolean {
    return this.isGameActive;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.sfxVolume * 0.85;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      const targetGain = this.isMusicMuted ? 0 : this.musicVolume * 0.45;
      this.musicGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicMuted = !enabled;
    if (this.musicGain && this.ctx) {
      const targetGain = this.isMusicMuted ? 0 : this.musicVolume * 0.45;
      this.musicGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    if (enabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.sfxVolume * 0.85;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- BACKGROUND MUSIC ENGINE (Gangsta's Paradise West-Coast Hip-Hop Arrangement) ---
  public startMusic() {
    this.init();
    if (!this.ctx || !this.musicGain || this.isMusicPlaying || this.isMusicMuted) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.isMusicPlaying = true;
    this.musicStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Run lookahead scheduler
    const scheduleAheadTime = 0.12;
    const intervalTime = 25; // check every 25ms

    const scheduler = () => {
      if (!this.isMusicPlaying || !this.ctx) return;

      const secondsPer16th = 60 / this.tempo / 4;
      while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        this.scheduleMusicStep(this.musicStep, this.nextNoteTime);
        this.nextNoteTime += secondsPer16th;
        this.musicStep = (this.musicStep + 1) % 64; // 64 16th-notes = 4 bars full theme loop
      }

      this.musicTimer = window.setTimeout(scheduler, intervalTime);
    };

    scheduler();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  private scheduleMusicStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain || this.isMusicMuted || this.isMuted) return;

    const bar = Math.floor(step / 16);
    const stepInBar = step % 16;

    // 1. Classic Boom-Bap Kick Drum (steps 0, 10, 16, 26, 32, 42, 48, 58)
    if (stepInBar === 0 || stepInBar === 10 || stepInBar === 14) {
      this.playKickDrum(time);
    }

    // 2. West-Coast Hip-Hop Snare / Clap on beats 2 and 4 (stepInBar 4 and 12)
    if (stepInBar === 4 || stepInBar === 12) {
      this.playSnareDrum(time);
    }

    // 3. Ticking 16th Hi-hats
    if (stepInBar % 2 === 0) {
      this.playHiHat(time, stepInBar % 4 === 2 ? 0.07 : 0.035);
    }

    // 4. Deep G-Funk Bassline (C minor -> Ab major -> F minor -> G7)
    // Bar 0: C2 (65.41Hz) | Bar 1: Ab1 (51.91Hz) | Bar 2: F1 (43.65Hz) | Bar 3: G1 (49.00Hz)
    let bassFreq = 65.41;
    if (bar === 0) bassFreq = 65.41;       // C2
    else if (bar === 1) bassFreq = 51.91;  // Ab1
    else if (bar === 2) bassFreq = 43.65;  // F1
    else if (bar === 3) bassFreq = 49.00;  // G1

    if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 12) {
      this.playSynthBass(bassFreq, time, 0.22);
    }

    // 5. Iconic "Gangsta's Paradise" Choir / Strings Lead Melody
    // Frequencies: G4 (392.0), Ab4 (415.3), F4 (349.2), Eb4 (311.1), D4 (293.7), C4 (261.6), B3 (246.9)
    const g4 = 392.00;
    const ab4 = 415.30;
    const f4 = 349.23;
    const eb4 = 311.13;
    const d4 = 293.66;
    const c4 = 261.63;
    const b3 = 246.94;

    const gangstaMelodyMap: { [key: number]: { note: number; dur: number } } = {
      // Bar 0: G4 -> G4 -> Ab4 -> G4 -> F4 -> Eb4 -> F4
      0:  { note: g4,  dur: 0.35 },
      3:  { note: g4,  dur: 0.18 },
      4:  { note: ab4, dur: 0.30 },
      7:  { note: g4,  dur: 0.25 },
      8:  { note: f4,  dur: 0.30 },
      11: { note: eb4, dur: 0.22 },
      12: { note: f4,  dur: 0.45 },

      // Bar 1: G4 -> G4 -> G4 -> F4 -> Eb4 -> D4
      16: { note: g4,  dur: 0.35 },
      19: { note: g4,  dur: 0.18 },
      20: { note: g4,  dur: 0.35 },
      24: { note: f4,  dur: 0.30 },
      27: { note: eb4, dur: 0.25 },
      28: { note: d4,  dur: 0.55 },

      // Bar 2: Eb4 -> Eb4 -> F4 -> Eb4 -> D4 -> C4 -> D4
      32: { note: eb4, dur: 0.35 },
      35: { note: eb4, dur: 0.18 },
      36: { note: f4,  dur: 0.30 },
      39: { note: eb4, dur: 0.25 },
      40: { note: d4,  dur: 0.30 },
      43: { note: c4,  dur: 0.22 },
      44: { note: d4,  dur: 0.45 },

      // Bar 3: Eb4 -> Eb4 -> D4 -> C4 -> B3 -> C4
      48: { note: eb4, dur: 0.35 },
      51: { note: eb4, dur: 0.18 },
      52: { note: d4,  dur: 0.35 },
      56: { note: c4,  dur: 0.30 },
      59: { note: b3,  dur: 0.25 },
      60: { note: c4,  dur: 0.65 },
    };

    if (gangstaMelodyMap[step]) {
      const item = gangstaMelodyMap[step];
      this.playGangstaMelody(item.note, time, item.dur);
    }
  }

  private playKickDrum(time: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.09);

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.15);
    } catch {}
  }

  private playSnareDrum(time: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      // Noise burst for snare snap
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(900, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.12);
    } catch {}
  }

  private playHiHat(time: number, volume: number = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(7500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.045);
    } catch {}
  }

  private playSynthBass(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, time);
      filter.frequency.exponentialRampToValueAtTime(160, time + duration);

      gain.gain.setValueAtTime(0.26, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    } catch {}
  }

  private playGangstaMelody(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 1.003, time); // Subtle chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, time);

      gain.gain.setValueAtTime(0.24, time);
      gain.gain.linearRampToValueAtTime(0.18, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration + 0.05);
      osc2.stop(time + duration + 0.05);
    } catch {}
  }

  public stopWeatherAmbience() {
    if (this.windGain && this.ctx) {
      try {
        this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {}
    }
  }

  public stopAll() {
    this.stopEngine();
    this.stopMusic();
    this.stopWeatherAmbience();
  }

  public startEngine() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isEngineRunning) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      // Create 2-stroke dirt bike synthesis
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      this.engineOsc1.frequency.setValueAtTime(65, this.ctx.currentTime);
      this.engineOsc2.frequency.setValueAtTime(130, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

      // Kept completely silent (0 gain) until user actually presses race or enters pause!
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
      this.lastThrottle = false;
    } catch {
      // Ignore audio start errors
    }
  }

  // Throttle acceleration punch effect when race is first pressed
  public playThrottleRev() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1500, now + 0.12);
      filter.Q.setValueAtTime(2.2, now);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Silent catch
    }
  }

  public updateEngine(rpm: number, throttle: boolean, isNitro: boolean, isPaused: boolean = false) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;

    const now = this.ctx.currentTime;

    if (this.isMuted) {
      this.engineGain.gain.setTargetAtTime(0.0001, now, 0.05);
      this.lastThrottle = false;
      return;
    }

    // When game is paused: bike engine keeps running with an authentic idle sound!
    if (isPaused) {
      const idleFreq = 58;
      const idleFilterFreq = 420;
      const targetGain = 0.12 * this.sfxVolume;

      this.engineOsc1.frequency.setTargetAtTime(idleFreq, now, 0.08);
      this.engineOsc2.frequency.setTargetAtTime(idleFreq * 1.85, now, 0.08);
      this.engineFilter.frequency.setTargetAtTime(idleFilterFreq, now, 0.08);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
      this.lastThrottle = false;
      return;
    }

    // Bike sound during active driving:
    if (!throttle) {
      // Smooth idle hum when throttle is released during race
      const idleFreq = 54;
      const idleFilterFreq = 380;
      const targetGain = 0.04 * this.sfxVolume;

      this.engineOsc1.frequency.setTargetAtTime(idleFreq, now, 0.08);
      this.engineOsc2.frequency.setTargetAtTime(idleFreq * 1.8, now, 0.08);
      this.engineFilter.frequency.setTargetAtTime(idleFilterFreq, now, 0.08);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.06);
      this.lastThrottle = false;
      return;
    }

    // Trigger throttle acceleration effect when race button is pressed
    if (!this.lastThrottle) {
      this.lastThrottle = true;
      this.playThrottleRev();
    }

    // Dynamic revving engine sound with rpm and nitro
    const baseFreq = 65 + rpm * 210;
    const filterFreq = 480 + rpm * 1400 + (isNitro ? 850 : 0);
    const targetGain = (0.15 + rpm * 0.13 + (isNitro ? 0.07 : 0)) * this.sfxVolume;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.88, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.04);
  }

  public playPauseSound() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.09);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  public stopEngine() {
    this.lastThrottle = false;
    if (this.engineGain && this.ctx) {
      try {
        this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {}
    }
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc1) {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
        this.engineOsc1 = null;
      }
      if (this.engineOsc2) {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
        this.engineOsc2 = null;
      }
    } catch {
      // Silent catch
    }
    this.isEngineRunning = false;
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio error catch
    }
  }

  public playFuel() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio error catch
    }
  }

  public playStunt() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch {
      // Silent catch
    }
  }

  public playSafeLandingStuntBonus() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // High-energy celebratory arpeggio for safely banked stunt bonus
      const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch {
      // Silent catch
    }
  }

  public playLand(intensity: number = 0.5) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

      gain.gain.setValueAtTime(Math.min(0.3, 0.1 + intensity * 0.2), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Silent catch
    }
  }

  public playCrash() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;

      // Crash boom
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      oscGain.gain.setValueAtTime(0.4, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);

      // Noise burst
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.35);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.4);
    } catch {
      // Silent catch
    }
  }

  public playFuelOut() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Sputtering engine choking down when running out of gas
      const pitches = [140, 110, 85, 60, 35];
      pitches.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        osc.frequency.exponentialRampToValueAtTime(Math.max(25, freq * 0.6), now + idx * 0.1 + 0.08);

        gain.gain.setValueAtTime(0.3, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.095);
      });
    } catch {
      // Silent catch
    }
  }

  public playTimeOut() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Double urgent buzzer tone for time expiration
      [0, 0.16, 0.32].forEach((delay) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now + delay);
        osc.frequency.setValueAtTime(160, now + delay + 0.08);
        gain.gain.setValueAtTime(0.35, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.13);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + delay);
        osc.stop(now + delay + 0.14);
      });
    } catch {
      // Silent catch
    }
  }

  public playTimeTick() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Silent catch
    }
  }

  public playLowFuelWarning() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [0, 0.09].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, now + offset);
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch {
      // Silent catch
    }
  }

  public playEngineBlowout() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Detonation pop + white noise hiss
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.45);

      // Steam hiss
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, now);
      noiseGain.gain.setValueAtTime(0.4, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now + 0.05);
      noise.stop(now + 0.55);
    } catch {
      // Silent catch
    }
  }

  public playTireBlowout() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Sharp high-pressure pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);

      // Air decompression whoosh
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      noise.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now + 0.02);
      noise.stop(now + 0.38);
    } catch {
      // Silent catch
    }
  }

  public playQuicksandSink() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Gurgling descending suction
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch {
      // Silent catch
    }
  }

  public playLevelWin() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // Fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.25, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    } catch {
      // Silent catch
    }
  }

  public updateWeatherAmbience(weatherType: string, intensity: number) {
    if (this.isMuted) {
      if (this.windGain && this.ctx) {
        this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return;
    }

    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      // Lazy start looping noise node for wind if needed
      if (!this.isWindPlaying && weatherType === 'sandstorm') {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink/Brownian noise for realistic wind roar
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
        this.windFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

        noiseNode.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);

        noiseNode.start();
        this.isWindPlaying = true;
      }

      if (this.windGain && this.ctx && this.windFilter) {
        const now = this.ctx.currentTime;
        if (weatherType === 'sandstorm' && intensity > 0.05) {
          const targetVol = Math.min(0.28, intensity * 0.24 * this.sfxVolume);
          const targetCutoff = 350 + intensity * 600;
          this.windGain.gain.setTargetAtTime(targetVol, now, 0.2);
          this.windFilter.frequency.setTargetAtTime(targetCutoff, now, 0.2);
        } else if (weatherType === 'sun_glare' && intensity > 0.3) {
          // Subtle heat shimmer drone
          const targetVol = Math.min(0.08, intensity * 0.06 * this.sfxVolume);
          this.windGain.gain.setTargetAtTime(targetVol, now, 0.4);
          this.windFilter.frequency.setTargetAtTime(220, now, 0.4);
        } else {
          // Fade wind out
          this.windGain.gain.setTargetAtTime(0.0001, now, 0.3);
        }
      }
    } catch {
      // Audio node silent catch
    }
  }
}

export const soundFX = new SoundFX();
