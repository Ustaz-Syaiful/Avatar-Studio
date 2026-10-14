/**
 * Web Audio API synthesizer for child-friendly sound effects:
 * - Camera shutter click
 * - Countdown timer beeps
 * - Success celebration chime
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Realistic camera shutter click:
 * 1. Quick mechanical click
 * 2. Short noise burst (aperture blade sound)
 * 3. Second winding click
 */
export function playCameraShutterSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Click 1 (Mirror flip up)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(350, now);
  osc1.frequency.exponentialRampToValueAtTime(100, now + 0.04);
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.04);

  // Noise burst (Aperture opening and closing)
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now + 0.04);
  filter.Q.setValueAtTime(3, now + 0.04);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now + 0.04);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now + 0.04);

  // Click 2 (Mirror return)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(500, now + 0.12);
  osc2.frequency.exponentialRampToValueAtTime(80, now + 0.18);
  gain2.gain.setValueAtTime(0.3, now + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.12);
  osc2.stop(now + 0.18);
}

/**
 * Countdown timer tick (high-pitch cheerful beep)
 */
export function playCountdownTick(isFinal: boolean = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const freq = isFinal ? 1320 : 880;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.3 : 0.15));

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + (isFinal ? 0.3 : 0.15));
}

/**
 * Cheerful success chime
 */
export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.09;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}
