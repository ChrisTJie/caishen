/**
 * Simple procedural audio utility to avoid external dependencies.
 */
class AudioService {
    private ctx: AudioContext | null = null;
    private bgm: HTMLAudioElement | null = null;
    private isSFXMuted: boolean = true; // Default to muted to match 🔇 icon

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    // Play a "Gong" sound - Enhanced with harmonics for a richer, more majestic sound
    public playGong() {
        if (this.isSFXMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 2.5;

        // Main strike
        [110, 165, 220, 330].forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

            gain.gain.setValueAtTime(0.3 / (i + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // Play a "Ball rolling" clicking sound - Faster, crisper
    public playClick() {
        if (this.isSFXMuted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square'; // Sharper sound
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Play a Win/Reward Chime - Multi-layered "Ta-da"
    public playWin() {
        if (this.isSFXMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major chord)

        notes.forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + (i * 0.1));

            gain.gain.setValueAtTime(0, now + (i * 0.1));
            gain.gain.linearRampToValueAtTime(0.2, now + (i * 0.1) + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 1.5);

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.start(now + (i * 0.1));
            osc.stop(now + 2);
        });
    }

    // Play BGM (using the local public file)
    public startBGM() {
        if (!this.bgm) {
            this.bgm = new Audio('./viacheslavstarostin-chinese-lunar-new-year-465871.mp3');
            this.bgm.loop = true;
            this.bgm.volume = 0.2;
        }

        this.bgm.play().catch(e => {
            console.log("BGM Play blocked or failed:", e);
        });
    }

    public stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            // Don't null it out, keep it for reuse
        }
    }

    public setSFXMuted(muted: boolean) {
        this.isSFXMuted = muted;
    }
}

export const audioService = new AudioService();
