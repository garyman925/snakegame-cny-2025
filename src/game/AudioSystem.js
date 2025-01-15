export class AudioSystem {
    constructor() {
        this.sounds = {
            bgm: new Howl({
                src: ['snd/theme-song.mp3'],
                loop: true,
                volume: 0.5,
                rate: 1.0
            }),
            collect: new Howl({ src: ['snd/drip.mp3'], volume: 0.8 }),
            complete: new Howl({ src: ['snd/beep.mp3'], volume: 0.8 }),
            powerup: new Howl({ src: ['snd/speed-up.mp3'], volume: 0.8 }),
            combo: new Howl({ src: ['snd/combo.mp3'], volume: 0.8, rate: 1.0 }),
            turn: new Howl({ src: ['snd/turn.mp3'], volume: 0.5 }),
            crash: new Howl({ src: ['snd/crash.mp3'] })
        };
    }

    playSound(soundName, rate = 1.0) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].rate(rate);
            this.sounds[soundName].play();
        }
    }

    // 其他音效相關方法...
} 