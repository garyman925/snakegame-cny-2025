export class AudioManager {
    constructor() {
        this.sounds = {
            bgm: new Howl({
                src: ['snd/金蛇狂舞 - 轻音乐网.mp3'],
                loop: true,
                volume: 0.5
            }),
            turn: new Howl({
                src: ['snd/721502__baggonotes__button_click1.wav'],
                volume: 0.8
            }),
            combo: new Howl({
                src: ['snd/combo.mp3'],
                volume: 0.8
            }),
            crash: new Howl({
                src: ['snd/crash.mp3'],
                volume: 0.8
            })
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].stop();
        }
    }

    setVolume(soundName, volume) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].volume(volume);
        }
    }

    setAllVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume(volume);
        });
    }

    setRate(soundName, rate) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].rate(rate);
        }
    }

    playComboSound(comboCount) {
        const pitchRate = Math.min(1.0 + (comboCount - 1) * 0.2, 2.0);
        this.sounds.combo.rate(pitchRate);
        this.sounds.combo.play();
    }
} 