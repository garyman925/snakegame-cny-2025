// Howl 已通過 CDN 在全局範圍內可用

export class AudioManager {
    constructor() {
        // 初始化音效
        this.sounds = {
            bgm: new Howl({
                src: ['snd/theme-song.mp3'],
                loop: true,
                volume: 0.5,
                rate: 1.0,
                autoplay: false
            }),
            collect: new Howl({
                src: ['snd/drip.mp3'],
                volume: 0.8
            }),
            complete: new Howl({
                src: ['snd/beep.mp3'],
                volume: 0.8
            }),
            powerup: new Howl({
                src: ['snd/speed-up.mp3'],
                volume: 0.8
            }),
            combo: new Howl({
                src: ['snd/combo.mp3'],
                volume: 0.8,
                rate: 1.0
            }),
            turn: new Howl({
                src: ['snd/turn.mp3'],
                volume: 0.5
            }),
            crash: new Howl({ 
                src: ['snd/crash.mp3'] 
            })
        };

        // 為了保持兼容性，保留 bgm 引用
        this.bgm = this.sounds.bgm;
    }

    // 播放指定音效
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    // 停止指定音效
    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].stop();
        }
    }

    // 暫停指定音效
    pause(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
        }
    }

    // 設置音效音量
    setVolume(soundName, volume) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].volume(volume);
        }
    }

    // 設置所有音效音量
    setAllVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume(volume);
        });
    }

    // 設置音效播放速率
    setRate(soundName, rate) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].rate(rate);
        }
    }

    // 檢查音效是否正在播放
    isPlaying(soundName) {
        return this.sounds[soundName]?.playing() || false;
    }

    // 播放帶有特定音調的 combo 音效
    playComboSound(comboCount) {
        const pitchRate = Math.min(1.0 + (comboCount - 1) * 0.2, 2.0);
        const comboSound = new Howl({
            src: ['snd/combo.mp3'],
            volume: 0.8,
            rate: pitchRate
        });
        comboSound.play();
    }
} 