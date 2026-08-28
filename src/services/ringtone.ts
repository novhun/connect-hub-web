/**
 * Synthesized call ringtones via the Web Audio API — no external audio files.
 * One shared AudioContext is reused so we don't hit browser autoplay limits
 * more than once per session.
 */

let audioCtx: AudioContext | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let unlocked = false;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

/** Call on any real user gesture — browsers block audio until one has occurred. */
export function unlockAudio() {
  if (unlocked) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  unlocked = true;
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.setValueAtTime(volume, Math.max(startTime + 0.02, startTime + duration - 0.05));
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function clearSchedule() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function stopRingtone() {
  clearSchedule();
}

/** Outgoing ringback — plays for the caller while the other side's phone is ringing. */
export function startRingback() {
  stopRingtone();
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const cycle = () => {
    const now = ctx.currentTime + 0.05;
    playTone(ctx, 440, now, 1.0, 0.07);
    playTone(ctx, 480, now, 1.0, 0.07);
  };
  cycle();
  intervalId = setInterval(cycle, 3000);
}

/** Incoming ring — plays for the callee while the incoming-call prompt is shown. */
export function startIncomingRing() {
  stopRingtone();
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const cycle = () => {
    const now = ctx.currentTime + 0.05;
    playTone(ctx, 587.33, now, 0.35, 0.12);
    playTone(ctx, 739.99, now + 0.4, 0.35, 0.12);
  };
  cycle();
  intervalId = setInterval(cycle, 1600);
}
