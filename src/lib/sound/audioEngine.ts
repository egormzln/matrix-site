"use client";

/**
 * Fully synthesized audio — no asset files. A low ambient hum (two detuned
 * oscillators through a lowpass) plus short bandpass-filtered noise bursts for
 * key clicks. Muted by default: the AudioContext is only created on the first
 * unmute gesture, which also satisfies browser autoplay policies.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private muted = true;

  private ensureContext() {
    if (this.context) return this.context;
    const context = new AudioContext();
    this.context = context;

    this.masterGain = context.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(context.destination);

    this.startHum(context, this.masterGain);
    this.clickBuffer = this.buildClickBuffer(context);
    return context;
  }

  private startHum(context: AudioContext, destination: GainNode) {
    const humGain = context.createGain();
    humGain.gain.value = 0.015;

    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 200;
    lowpass.connect(humGain);
    humGain.connect(destination);

    const osc1 = context.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    osc1.detune.value = -4;
    osc1.connect(lowpass);
    osc1.start();

    const osc2 = context.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = 110;
    osc2.detune.value = 4;
    const osc2Gain = context.createGain();
    osc2Gain.gain.value = 0.4;
    osc2.connect(osc2Gain);
    osc2Gain.connect(lowpass);
    osc2.start();

    // Slow LFO drifting the hum volume so it feels alive.
    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.1;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain);
    lfoGain.connect(humGain.gain);
    lfo.start();
  }

  private buildClickBuffer(context: AudioContext) {
    const length = Math.floor(context.sampleRate * 0.03);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    return buffer;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.context?.suspend();
      return;
    }
    const context = this.ensureContext();
    context.resume();
  }

  /** Short filtered noise burst; randomized bandpass keeps repeats organic. */
  click() {
    if (this.muted || !this.context || !this.clickBuffer || !this.masterGain)
      return;
    const context = this.context;

    const source = context.createBufferSource();
    source.buffer = this.clickBuffer;

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2500 + (Math.random() * 600 - 300);
    bandpass.Q.value = 4;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.03);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  suspend() {
    this.context?.suspend();
  }

  resume() {
    if (!this.muted) this.context?.resume();
  }
}

export const audioEngine = new AudioEngine();
