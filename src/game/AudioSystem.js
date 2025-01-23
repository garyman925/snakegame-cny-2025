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
                src: ['snd/crash.mp3'],
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
        try {
            if (!this.bgm.playing()) {
                const playPromise = this.bgm.play();
                
                // 處理播放承諾
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('背景音樂播放失敗:', error);
                    });
                }
            }
        } catch (error) {
            console.warn('嘗試播放背景音樂時出錯:', error);
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