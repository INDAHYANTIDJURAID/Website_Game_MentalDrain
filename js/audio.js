/**
 * Enhanced Audio Manager using Web Audio API.
 * Features a procedural rhythmic BGM.
 */
export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.6; // Increased from 0.3

        this.bgmNodes = [];
        this.isPlaying = false;
        this.tempo = 120; // BPM
        this.nextNoteTime = 0;
        this.timerID = null;
        this.sequenceIndex = 0;

        // Simple scale (C minor pentatonicish)
        this.scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25];
    }

    init() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, vol = 0.2) { // Default vol up from 0.1
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playSuccess() {
        this.playTone(600, 'sine', 0.1, 0.3); // Louder
        setTimeout(() => this.playTone(800, 'sine', 0.15, 0.3), 100);
    }

    playError() {
        this.playTone(150, 'sawtooth', 0.3, 0.4); // Louder
        setTimeout(() => this.playTone(100, 'sawtooth', 0.3, 0.4), 150);
    }

    playHover() {
        this.playTone(300, 'triangle', 0.05, 0.1); // Louder
    }

    // --- Rhythm System ---

    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBeat(this.nextNoteTime);
            this.nextNoteTime += 60.0 / this.tempo; // Quarter note
        }
        this.timerID = setTimeout(() => this.scheduler(), 25);
    }

    playBeat(time) {
        // Bass kick on beat 1 and 3
        if (this.sequenceIndex % 4 === 0) {
            this.playKick(time);
        }

        // Hi-hat every beat
        this.playHiHat(time);

        // Random melodic beep occasionally
        if (Math.random() > 0.7) {
            const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.05, time); // Up from 0.02
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.2);
        }

        this.sequenceIndex++;
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.8, time); // Up from 0.5
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    playHiHat(time) {
        // Noise buffer would be better but keeping it simple with high freq osc
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(10000, time);
        gain.gain.setValueAtTime(0.1, time); // Up from 0.05
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.05);
    }

    startDrone() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    stopDrone() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
    }

    updateIntensity(level) {
        // Speed up tempo with level
        this.tempo = 100 + (level * 5);
        // Cap at 180
        if (this.tempo > 180) this.tempo = 180;
    }
}
