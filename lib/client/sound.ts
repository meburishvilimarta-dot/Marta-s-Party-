"use client";

// Every sound is synthesised with the Web Audio API — no audio files to
// download. Nothing plays until the visitor explicitly turns sound on.

type Listener = (on: boolean) => void;
export type Sfx = "crack" | "whoosh" | "chime" | "thunder" | "boo" | "flutter";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientStop: (() => void) | null = null;
  private listeners = new Set<Listener>();
  enabled = false;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async toggle() {
    if (this.enabled) this.disable();
    else await this.enable();
  }

  async enable() {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (ctx.state === "suspended") await ctx.resume();
    this.enabled = true;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    if (!this.ambientStop) this.ambientStop = this.startAmbient();
    this.emit();
  }

  disable() {
    this.enabled = false;
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      window.setTimeout(() => {
        if (!this.enabled) {
          this.ambientStop?.();
          this.ambientStop = null;
          void ctx.suspend();
        }
      }, 700);
    }
    this.emit();
  }

  private noiseBuffer(seconds: number, brown = false) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else d[i] = w;
    }
    return buf;
  }

  private startAmbient() {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = 0.55;
    out.connect(this.master!);

    // Wind: looping brown noise through a slowly breathing low-pass filter.
    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer(6, true);
    wind.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.8;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(lp.frequency);
    const windGain = ctx.createGain();
    windGain.gain.value = 0.22;
    wind.connect(lp).connect(windGain).connect(out);

    // Low organ-like drone (A1 + E2) with a gentle tremolo.
    const drone = ctx.createGain();
    drone.gain.value = 0.035;
    const trem = ctx.createOscillator();
    trem.frequency.value = 0.18;
    const tremGain = ctx.createGain();
    tremGain.gain.value = 0.015;
    trem.connect(tremGain).connect(drone.gain);
    const oscs = [55, 82.41, 110.3].map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(drone);
      return o;
    });
    drone.connect(out);

    const t = ctx.currentTime;
    [wind, lfo, trem, ...oscs].forEach((n) => n.start(t));

    // A distant bell every so often.
    const bell = window.setInterval(() => this.enabled && this.play("chime", 0.25), 26000);

    return () => {
      window.clearInterval(bell);
      [wind, lfo, trem, ...oscs].forEach((n) => {
        try {
          n.stop();
        } catch {}
      });
      out.disconnect();
    };
  }

  play(name: Sfx, volume = 1) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = volume;
    out.connect(this.master);

    const env = (g: GainNode, peak: number, attack: number, decay: number) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    };

    const noise = (seconds: number, filterType: BiquadFilterType, freq: number, q = 1) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(seconds);
      const f = ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      src.connect(f).connect(g).connect(out);
      src.start(t);
      return { f, g };
    };

    const tone = (freq: number, type: OscillatorType, peak: number, attack: number, decay: number, glideTo?: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + attack + decay);
      const g = ctx.createGain();
      env(g, peak, attack, decay);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + attack + decay + 0.05);
    };

    switch (name) {
      case "crack": {
        const { g } = noise(0.25, "highpass", 1800, 0.7);
        env(g, 0.9, 0.003, 0.12);
        tone(140, "sine", 0.6, 0.005, 0.25, 40);
        break;
      }
      case "whoosh": {
        const { f, g } = noise(1.1, "bandpass", 300, 1.2);
        f.frequency.setValueAtTime(250, t);
        f.frequency.exponentialRampToValueAtTime(2600, t + 0.55);
        f.frequency.exponentialRampToValueAtTime(600, t + 1);
        env(g, 0.5, 0.25, 0.75);
        break;
      }
      case "chime": {
        [880, 1318.5, 1760, 2637].forEach((fr, i) => tone(fr, "sine", 0.18 / (i + 1), 0.005, 2.6 - i * 0.4));
        break;
      }
      case "thunder": {
        const { g } = noise(3.2, "lowpass", 180, 0.5);
        env(g, 1.2, 0.08, 3);
        break;
      }
      case "boo": {
        tone(320, "triangle", 0.12, 0.25, 1.2, 140);
        tone(326, "sine", 0.08, 0.3, 1.2, 150);
        break;
      }
      case "flutter": {
        for (let i = 0; i < 6; i++) {
          const src = ctx.createBufferSource();
          src.buffer = this.noiseBuffer(0.06);
          const f = ctx.createBiquadFilter();
          f.type = "bandpass";
          f.frequency.value = 900;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.07 + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.06);
          src.connect(f).connect(g).connect(out);
          src.start(t + i * 0.07);
        }
        break;
      }
    }
    window.setTimeout(() => out.disconnect(), 4000);
  }
}

export const sound = new SoundEngine();
