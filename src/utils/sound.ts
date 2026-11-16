// Synthesized Web Audio API arcade sound effects (zero external dependencies)

class ArcadeAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    delay = 0,
    volume = 0.08
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(540, 0.07, 'triangle', 0, 0.06);
  }

  public playTransition() {
    this.playTone(440, 0.08, 'sine', 0, 0.05);
    this.playTone(660, 0.12, 'sine', 0.06, 0.06);
  }

  public playCorrect() {
    this.playTone(523.25, 0.12, 'triangle', 0, 0.08);
    this.playTone(659.25, 0.12, 'triangle', 0.09, 0.08);
    this.playTone(783.99, 0.14, 'triangle', 0.18, 0.09);
    this.playTone(1046.5, 0.25, 'sine', 0.27, 0.09);
  }

  public playWrong() {
    this.playTone(260, 0.16, 'sawtooth', 0, 0.05);
    this.playTone(195, 0.24, 'sawtooth', 0.14, 0.05);
  }

  public playBossEnter() {
    this.playTone(220, 0.18, 'triangle', 0, 0.08);
    this.playTone(277.18, 0.18, 'triangle', 0.14, 0.08);
    this.playTone(329.63, 0.22, 'triangle', 0.28, 0.09);
    this.playTone(440, 0.35, 'sawtooth', 0.44, 0.05);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.45 : 0.14, 'triangle', idx * 0.09, 0.08);
    });
  }
}

export const arcadeSound = new ArcadeAudioEngine();
