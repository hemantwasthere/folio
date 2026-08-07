/**
 * The little synth on the homepage.
 *
 * There are no audio files behind this — every note is built out of oscillators
 * at play time. That keeps the whole toy at a few kilobytes of JavaScript
 * instead of a multi-megabyte sample sprite per instrument, and it means a note
 * can start the instant a key goes down rather than after a fetch.
 */

export interface SynthNote {
  /** Also the label the screen prints, with `#` swapped for a real sharp. */
  id: string;
  midi: number;
  /** Computer-keyboard key that plays it. Lower case; `e.key` is normalised. */
  key: string;
  black: boolean;
  /**
   * Diatonic index from the low C, 0-9. Drives both the key's x position and
   * where the notehead lands on the staff — a sharp shares the step of the
   * natural below it and picks up a ♯ instead.
   */
  step: number;
}

/** Two octaves-ish, C4 up to E5, laid out like the row of keys under your hand. */
export const NOTES: SynthNote[] = [
  { id: "C4", midi: 60, key: "a", black: false, step: 0 },
  { id: "C#4", midi: 61, key: "w", black: true, step: 0 },
  { id: "D4", midi: 62, key: "s", black: false, step: 1 },
  { id: "D#4", midi: 63, key: "e", black: true, step: 1 },
  { id: "E4", midi: 64, key: "d", black: false, step: 2 },
  { id: "F4", midi: 65, key: "f", black: false, step: 3 },
  { id: "F#4", midi: 66, key: "t", black: true, step: 3 },
  { id: "G4", midi: 67, key: "g", black: false, step: 4 },
  { id: "G#4", midi: 68, key: "y", black: true, step: 4 },
  { id: "A4", midi: 69, key: "h", black: false, step: 5 },
  { id: "A#4", midi: 70, key: "u", black: true, step: 5 },
  { id: "B4", midi: 71, key: "j", black: false, step: 6 },
  { id: "C5", midi: 72, key: "k", black: false, step: 7 },
  { id: "C#5", midi: 73, key: "o", black: true, step: 7 },
  { id: "D5", midi: 74, key: "l", black: false, step: 8 },
  { id: "D#5", midi: 75, key: "p", black: true, step: 8 },
  { id: "E5", midi: 76, key: ";", black: false, step: 9 },
];

const NOTE_BY_ID = new Map(NOTES.map((note) => [note.id, note]));

/** Screens and screen readers get `C♯4`, the code keeps the ASCII `C#4`. */
export const prettyNote = (id: string) => id.replace("#", "♯");

const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

interface VoiceContext {
  ctx: AudioContext;
  destination: AudioNode;
  freq: number;
  time: number;
  /** Karplus-Strong buffer for this note, cached per ring length. */
  pluck: (seconds: number) => AudioBuffer;
  /** Pulse wave of the given duty cycle, cached. */
  pulse: (duty: number) => PeriodicWave;
  noise: AudioBuffer;
}

interface Voice {
  /** Let go of the key. Only means anything for the sustained instruments. */
  release: (time: number) => void;
  /** Hard cut, used when the same note is retriggered before it has died. */
  cancel: () => void;
}

interface Instrument {
  id: string;
  /** Held notes ring until key-up; everything else decays on its own. */
  sustained: boolean;
  start: (voice: VoiceContext) => Voice;
}

/**
 * Wires an oscillator into `target` through its own gain, and hands back both
 * so the caller can shape them. Most instruments below are some arrangement of
 * these.
 */
const partial = (
  ctx: AudioContext,
  target: AudioNode,
  type: OscillatorType,
  freq: number,
  gain: number
) => {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;

  const level = ctx.createGain();
  level.gain.value = gain;

  osc.connect(level).connect(target);
  return { osc, level };
};

/** A band of noise, used for mallet knocks and breath. */
const noiseThrough = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  target: AudioNode,
  type: BiquadFilterType,
  freq: number,
  q: number
) => {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const band = ctx.createBiquadFilter();
  band.type = type;
  band.frequency.value = freq;
  band.Q.value = q;

  const level = ctx.createGain();
  source.connect(band).connect(level).connect(target);
  return { source, level };
};

/**
 * Karplus-Strong: fill a delay line the length of one period with noise, then
 * feed it back through a two-tap average. The averaging eats the high partials
 * faster than the low ones, which is what a plucked string does, and it costs
 * one pass over a Float32Array.
 */
const pluckBuffer = (ctx: AudioContext, freq: number, seconds: number) => {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);

  const period = Math.max(2, Math.round(rate / freq));
  for (let i = 0; i <= period; i++) data[i] = Math.random() * 2 - 1;

  // Per-sample loss, solved so the fundamental reaches silence at `seconds`
  // whatever the sample rate happens to be.
  const decay = Math.exp(-Math.log(1000) / (seconds * rate));
  for (let i = period + 1; i < length; i++) {
    data[i] = decay * 0.5 * (data[i - period] + data[i - period - 1]);
  }

  return buffer;
};

const noiseBuffer = (ctx: AudioContext) => {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

/**
 * Fourier series for a pulse wave of the given duty cycle. A 25% pulse is the
 * sound of every square-wave chip ever put in a games console; the browser only
 * gives us a 50% square, so it gets built by hand.
 */
const pulseWave = (ctx: AudioContext, duty: number) => {
  const harmonics = 32;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);

  for (let n = 1; n < harmonics; n++) {
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
  }

  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
};

/**
 * A decaying voice: it is fully described the moment it starts, so `release`
 * does nothing and letting go of the key just lets it ring.
 */
const struck = (
  ctx: AudioContext,
  amp: GainNode,
  nodes: AudioScheduledSourceNode[],
  end: number
): Voice => ({
  release: () => {},
  cancel: () => {
    const now = ctx.currentTime;
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(Math.max(amp.gain.value, 0.0001), now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    for (const node of nodes) node.stop(Math.min(end, now + 0.08));
  },
});

/** Shared shape for the two voices that ring until you let go. */
const held = (
  ctx: AudioContext,
  amp: GainNode,
  nodes: AudioScheduledSourceNode[],
  releaseTime: number
): Voice => {
  const stop = (at: number) => {
    for (const node of nodes) node.stop(at);
    nodes[0].onended = () => amp.disconnect();
  };

  return {
    release: (at) => {
      amp.gain.cancelScheduledValues(at);
      amp.gain.setValueAtTime(Math.max(amp.gain.value, 0.0001), at);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + releaseTime);
      stop(at + releaseTime + 0.04);
    },
    cancel: () => {
      const now = ctx.currentTime;
      amp.gain.cancelScheduledValues(now);
      amp.gain.setValueAtTime(0.0001, now);
      stop(now + 0.02);
    },
  };
};

/**
 * The instrument wheel, in the order the arrows step through it. Piano is first
 * because it is what the screen shows before the roulette has picked.
 */
export const INSTRUMENTS: Instrument[] = [
  {
    id: "piano",
    sustained: false,
    start: ({ ctx, destination, freq, time }) => {
      // Higher strings are shorter and die sooner, same as the real thing.
      const decay = 2.9 - Math.min(1.3, (freq - 261) / 400);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 0.7;
      // Bright at the hammer strike, then closing down — that falling cutoff is
      // most of what sells it as a struck string rather than a held tone.
      filter.frequency.setValueAtTime(Math.min(9000, freq * 14), time);
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(420, freq * 2.2),
        time + decay * 0.6
      );

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.linearRampToValueAtTime(0.85, time + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      filter.connect(amp).connect(destination);

      // The 4.02 is deliberate: real strings are slightly inharmonic, and the
      // detune keeps the upper partial from locking into a hollow octave.
      const oscs = (
        [
          ["triangle", 1, 1],
          ["sine", 2, 0.32],
          ["sine", 3, 0.13],
          ["sine", 4.02, 0.055],
        ] as const
      ).map(([type, ratio, gain]) => {
        const { osc } = partial(ctx, filter, type, freq * ratio, gain);
        osc.start(time);
        osc.stop(time + decay + 0.1);
        return osc;
      });

      oscs[0].onended = () => {
        filter.disconnect();
        amp.disconnect();
      };

      return struck(ctx, amp, oscs, time + decay + 0.1);
    },
  },
  {
    id: "musicbox",
    sustained: false,
    start: ({ ctx, destination, freq, time }) => {
      const decay = 2.4;

      const amp = ctx.createGain();
      amp.gain.value = 0.5;
      amp.connect(destination);

      // Stretched, non-integer partials that fade at different rates — the
      // shimmer of a struck metal tine comes from the top ones leaving first.
      const oscs = (
        [
          [1, 1, 1],
          [2.01, 0.42, 0.75],
          [3.04, 0.26, 0.55],
          [4.19, 0.15, 0.4],
          [5.47, 0.08, 0.3],
        ] as const
      ).map(([ratio, gain, life]) => {
        const { osc, level } = partial(ctx, amp, "sine", freq * ratio, 0.0001);
        level.gain.setValueAtTime(0.0001, time);
        level.gain.linearRampToValueAtTime(gain, time + 0.004);
        level.gain.exponentialRampToValueAtTime(0.0001, time + decay * life);
        osc.start(time);
        osc.stop(time + decay + 0.1);
        return osc;
      });

      oscs[0].onended = () => amp.disconnect();

      return struck(ctx, amp, oscs, time + decay + 0.1);
    },
  },
  {
    id: "xylophone",
    sustained: false,
    start: ({ ctx, destination, freq, time, noise }) => {
      const decay = 0.6;

      const amp = ctx.createGain();
      amp.gain.value = 0.6;
      amp.connect(destination);

      // A rosewood bar is tuned so its overtones land near the 3rd and 9th
      // harmonic, which is why a xylophone is bright but still reads as pitched.
      const oscs = (
        [
          [1, 1, 1],
          [3, 0.3, 0.45],
          [6.05, 0.11, 0.28],
        ] as const
      ).map(([ratio, gain, life]) => {
        const { osc, level } = partial(ctx, amp, "sine", freq * ratio, 0.0001);
        level.gain.setValueAtTime(0.0001, time);
        level.gain.linearRampToValueAtTime(gain, time + 0.002);
        level.gain.exponentialRampToValueAtTime(0.0001, time + decay * life);
        osc.start(time);
        osc.stop(time + decay + 0.05);
        return osc;
      });

      // The knock of the mallet on the wood, before any of that rings.
      const knock = noiseThrough(ctx, noise, amp, "bandpass", freq * 4, 1);
      knock.level.gain.setValueAtTime(0.35, time);
      knock.level.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
      knock.source.start(time);
      knock.source.stop(time + 0.06);

      oscs[0].onended = () => amp.disconnect();

      return struck(ctx, amp, [...oscs, knock.source], time + decay + 0.05);
    },
  },
  {
    id: "harp",
    sustained: false,
    start: ({ ctx, destination, time, pluck }) => {
      const source = ctx.createBufferSource();
      source.buffer = pluck(2.2);

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.9, time);
      source.connect(amp).connect(destination);
      source.start(time);
      source.onended = () => amp.disconnect();

      return struck(ctx, amp, [source], time + 2.3);
    },
  },
  {
    id: "banjo",
    sustained: false,
    start: ({ ctx, destination, time, pluck }) => {
      // Same plucked string as the harp, but a much shorter ring and all the
      // top end left in — that is most of the difference between the two.
      const source = ctx.createBufferSource();
      source.buffer = pluck(0.8);

      const twang = ctx.createBiquadFilter();
      twang.type = "highshelf";
      twang.frequency.value = 1200;
      twang.gain.value = 9;

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.75, time);
      source.connect(twang).connect(amp).connect(destination);
      source.start(time);
      source.onended = () => {
        twang.disconnect();
        amp.disconnect();
      };

      return struck(ctx, amp, [source], time + 0.9);
    },
  },
  {
    id: "ocarina",
    sustained: true,
    start: ({ ctx, destination, freq, time, noise }) => {
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.linearRampToValueAtTime(0.6, time + 0.06);
      amp.connect(destination);

      // Nearly a pure sine. A vessel flute has almost no upper harmonics, which
      // is exactly why an ocarina sounds so hollow and round.
      const oscs = (
        [
          [1, 1],
          [2, 0.06],
        ] as const
      ).map(([ratio, gain]) => {
        const { osc } = partial(ctx, amp, "sine", freq * ratio, gain);
        osc.start(time);
        return osc;
      });

      // Vibrato fades in rather than starting with the note, the way a player
      // would settle into it.
      const vibrato = ctx.createOscillator();
      vibrato.frequency.value = 5;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, time);
      depth.gain.linearRampToValueAtTime(8, time + 0.5);
      vibrato.connect(depth);
      for (const osc of oscs) depth.connect(osc.detune);
      vibrato.start(time);

      // A whisper of air across the mouthpiece.
      const breath = noiseThrough(ctx, noise, amp, "bandpass", freq * 2, 1.2);
      breath.level.gain.value = 0.035;
      breath.source.start(time);

      return held(ctx, amp, [...oscs, vibrato, breath.source], 0.2);
    },
  },
  {
    id: "organ",
    sustained: true,
    start: ({ ctx, destination, freq, time }) => {
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.linearRampToValueAtTime(0.3, time + 0.025);
      amp.connect(destination);

      // Drawbar stack: straight integer harmonics, no filter, no decay.
      const oscs = (
        [
          [1, 1],
          [2, 0.45],
          [3, 0.28],
          [4, 0.2],
          [6, 0.1],
          [8, 0.06],
        ] as const
      ).map(([ratio, gain]) => {
        const { osc } = partial(ctx, amp, "sine", freq * ratio, gain);
        osc.start(time);
        return osc;
      });

      // Slow tremolo so a held chord breathes instead of sitting dead flat.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.4;
      const depth = ctx.createGain();
      depth.gain.value = 0.05;
      lfo.connect(depth).connect(amp.gain);
      lfo.start(time);

      return held(ctx, amp, [...oscs, lfo], 0.16);
    },
  },
  {
    id: "vox",
    sustained: true,
    start: ({ ctx, destination, freq, time }) => {
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.linearRampToValueAtTime(0.5, time + 0.08);
      amp.connect(destination);

      // Formant synthesis: a buzzy glottal source pushed through three fixed
      // resonances. These three frequencies are roughly an "ah", which is why
      // it comes out sounding like someone holding a note rather than a filter.
      const source = ctx.createOscillator();
      source.type = "sawtooth";
      source.frequency.value = freq;

      for (const [hz, q, gain] of [
        [730, 9, 1],
        [1090, 11, 0.5],
        [2440, 13, 0.22],
      ] as const) {
        const formant = ctx.createBiquadFilter();
        formant.type = "bandpass";
        formant.frequency.value = hz;
        formant.Q.value = q;

        const level = ctx.createGain();
        level.gain.value = gain;
        source.connect(formant).connect(level).connect(amp);
      }

      const vibrato = ctx.createOscillator();
      vibrato.frequency.value = 5.5;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, time);
      depth.gain.linearRampToValueAtTime(14, time + 0.45);
      vibrato.connect(depth).connect(source.detune);
      vibrato.start(time);

      source.start(time);

      return held(ctx, amp, [source, vibrato], 0.18);
    },
  },
  {
    id: "chip",
    sustained: false,
    start: ({ ctx, destination, freq, time, pulse }) => {
      const decay = 0.45;

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.linearRampToValueAtTime(0.3, time + 0.004);
      // Flat and then cut, the way a tracker envelope does it — no soft tail.
      amp.gain.setValueAtTime(0.3, time + decay * 0.55);
      amp.gain.exponentialRampToValueAtTime(0.0001, time + decay);
      amp.connect(destination);

      const osc = ctx.createOscillator();
      osc.setPeriodicWave(pulse(0.25));
      // The little upward blip on the attack, straight off a coin pickup.
      osc.frequency.setValueAtTime(freq * 1.5, time);
      osc.frequency.setValueAtTime(freq, time + 0.035);
      osc.connect(amp);
      osc.start(time);
      osc.stop(time + decay + 0.02);
      osc.onended = () => amp.disconnect();

      return struck(ctx, amp, [osc], time + decay + 0.02);
    },
  },
  {
    id: "farts",
    sustained: false,
    start: ({ ctx, destination, freq, time, noise }) => {
      // Every one is a bit different, which is most of the joke.
      const length = 0.35 + Math.random() * 0.45;
      const flutterRate = 14 + Math.random() * 20;

      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.linearRampToValueAtTime(0.55, time + 0.02);
      amp.gain.setValueAtTime(0.55, time + length * 0.45);
      amp.gain.exponentialRampToValueAtTime(0.0001, time + length);
      amp.connect(destination);

      // An octave down and sagging as it goes, squeezed through a resonant
      // filter that closes up. The flutter is what makes it rude rather than
      // just a buzzy sawtooth.
      const body = ctx.createOscillator();
      body.type = "sawtooth";
      body.frequency.setValueAtTime(freq / 2, time);
      body.frequency.exponentialRampToValueAtTime(freq / 3.2, time + length);

      const flutter = ctx.createOscillator();
      flutter.type = "square";
      flutter.frequency.value = flutterRate;
      const flutterDepth = ctx.createGain();
      flutterDepth.gain.value = 150;
      flutter.connect(flutterDepth).connect(body.detune);
      flutter.start(time);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 7;
      filter.frequency.setValueAtTime(freq * 3, time);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.8, time + length);
      body.connect(filter).connect(amp);
      body.start(time);
      body.stop(time + length + 0.05);

      const air = noiseThrough(ctx, noise, amp, "bandpass", 420, 0.8);
      air.level.gain.setValueAtTime(0.2, time);
      air.level.gain.exponentialRampToValueAtTime(0.0001, time + length);
      air.source.start(time);
      air.source.stop(time + length + 0.05);

      body.onended = () => amp.disconnect();

      return struck(
        ctx,
        amp,
        [body, flutter, air.source],
        time + length + 0.05
      );
    },
  },
];

/**
 * Owns the AudioContext and everything hanging off it. One instance per mounted
 * synth; the context is not built until the first note, because browsers will
 * not start one outside a user gesture anyway.
 */
export class SynthEngine {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private plucks = new Map<string, AudioBuffer>();
  private pulses = new Map<number, PeriodicWave>();
  private voices = new Map<string, Voice>();

  /**
   * Called from the gesture handler. Returns null when Web Audio is missing, in
   * which case the keyboard still lights up — it just does it silently.
   */
  private context(): AudioContext | null {
    if (this.ctx) {
      // Safari suspends the context whenever the tab loses focus. `resume` can
      // reject if the browser is not ready to let us have it back; there is
      // nothing useful to do about that beyond not crashing.
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return this.ctx;
    }

    if (typeof window === "undefined" || !window.AudioContext) return null;

    const ctx = new AudioContext();
    const bus = ctx.createGain();
    bus.gain.value = 0.5;

    // Nothing limits how many keys can be down at once — a fistful of held
    // organ notes sums well past full scale — so everything goes through a
    // compressor rather than clipping.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;

    // A short generated impulse response. Nothing subtle, but a completely dry
    // keyboard sounds like a broken toy, and this costs no download.
    const convolver = ctx.createConvolver();
    const length = Math.floor(ctx.sampleRate * 1.6);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
      }
    }
    convolver.buffer = impulse;

    const wet = ctx.createGain();
    wet.gain.value = 0.22;

    // Final safety net behind the compressor. The compressor's 3ms attack lets
    // the very front of a hard transient through, so the last stage is a soft
    // clip: it is inaudible until the signal approaches full scale and then
    // saturates rather than tearing.
    const ceiling = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      // Scaled to stop just under full scale: the curve is the hard bound on
      // the output, so leaving a sliver of headroom means nothing downstream
      // can round its way back up to a clipped sample.
      curve[i] = 0.96 * (Math.tanh(x * 1.4) / Math.tanh(1.4));
    }
    ceiling.curve = curve;
    // Oversampling would filter the shaped signal and can ring a few percent
    // past the curve's range, which is the one thing this node exists to stop.
    ceiling.oversample = "none";

    bus.connect(limiter);
    bus.connect(convolver).connect(wet).connect(limiter);
    limiter.connect(ceiling).connect(ctx.destination);

    this.ctx = ctx;
    this.bus = bus;
    return ctx;
  }

  /** Warm the context up on the first gesture so the first note is not late. */
  resume() {
    this.context();
  }

  play(noteId: string, instrumentId: string) {
    const ctx = this.context();
    const bus = this.bus;
    const note = NOTE_BY_ID.get(noteId);
    const instrument = INSTRUMENTS.find((item) => item.id === instrumentId);
    if (!ctx || !bus || !note || !instrument) return;

    this.voices.get(noteId)?.cancel();

    if (!this.noise) this.noise = noiseBuffer(ctx);

    const freq = frequency(note.midi);

    const voice = instrument.start({
      ctx,
      destination: bus,
      freq,
      time: ctx.currentTime,
      noise: this.noise,
      pluck: (seconds) => {
        const key = `${note.midi}:${seconds}`;
        const cached = this.plucks.get(key);
        if (cached) return cached;

        const built = pluckBuffer(ctx, freq, seconds);
        this.plucks.set(key, built);
        return built;
      },
      pulse: (duty) => {
        const cached = this.pulses.get(duty);
        if (cached) return cached;

        const built = pulseWave(ctx, duty);
        this.pulses.set(duty, built);
        return built;
      },
    });

    this.voices.set(noteId, voice);
  }

  release(noteId: string) {
    const voice = this.voices.get(noteId);
    if (!voice || !this.ctx) return;

    voice.release(this.ctx.currentTime);
    this.voices.delete(noteId);
  }

  releaseAll() {
    for (const noteId of [...this.voices.keys()]) this.release(noteId);
  }

  /** The tick the instrument selector makes as it spins. */
  blip() {
    const ctx = this.context();
    const bus = this.bus;
    if (!ctx || !bus) return;

    const time = ctx.currentTime;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.14, time);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    amp.connect(bus);

    const { osc } = partial(ctx, amp, "square", 1400, 1);
    osc.start(time);
    osc.stop(time + 0.06);
    osc.onended = () => amp.disconnect();
  }

  /** …and the one it makes when it settles. */
  chime() {
    const ctx = this.context();
    const bus = this.bus;
    if (!ctx || !bus) return;

    const time = ctx.currentTime;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.linearRampToValueAtTime(0.2, time + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.55);
    amp.connect(bus);

    for (const [ratio, gain] of [
      [1, 1],
      [2.76, 0.3],
    ] as const) {
      const { osc } = partial(ctx, amp, "sine", 1760 * ratio, gain);
      osc.start(time);
      osc.stop(time + 0.6);
    }
  }

  dispose() {
    this.voices.clear();
    void this.ctx?.close();
    this.ctx = null;
    this.bus = null;
  }
}
