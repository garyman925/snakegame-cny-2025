export class AudioSystem {
    constructor() {
        this.sounds = {
            bgm: new Howl({
                src: ['snd/theme-song.mp3'],
                loop: true,
                volume: 0.5,
                rate: 1.0,
                autoplay: false
            }),
            collect: new Howl({ src: ['snd/beep.mp3'], volume: 0.8 }),
            complete: new Howl({ src: ['snd/beep.mp3'], volume: 0.8 }),
            powerup: new Howl({ src: ['snd/speed-up.mp3'], volume: 0.8 }),
            combo: new Howl({
                src: ['snd/combo-snd.mp3'],
                loop: true,
                volume: 0.8,
                autoplay: false
            }),
            turn: new Howl({ src: ['snd/drip.mp3'], volume: 0.5 }),
            crash: new Howl({ src: ['snd/crash.mp3'],  volume: 0.5  })
        };
        this.isComboPlaying = false;
        this.bgm = this.sounds.bgm;
    }

    playSound(soundName, rate = 1.0) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].rate(rate);
            this.sounds[soundName].play();
        }
    }

    startComboSound() {
        if (this.isComboPlaying) {
            this.sounds.combo.stop();
        }
        this.sounds.combo.play();
        this.isComboPlaying = true;
    }

    stopComboSound() {
        if (this.isComboPlaying) {
            this.sounds.combo.stop();
            this.isComboPlaying = false;
        }
    }

    playBGM() {
        if (!this.bgm.playing()) {
            this.bgm.play();
        }
    }

    stopBGM() {
        this.bgm.stop();
    }

    pauseBGM() {
        this.bgm.pause();
    }

    // 其他音效相關方法...
} 