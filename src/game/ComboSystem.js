export class ComboSystem {
    constructor(game) {
        this.game = game;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastCollectTime = 0;
        this.comboTimeWindow = 2000; // 2秒內收集可以保持連擊
    }

    // 增加連擊數
    increaseCombo() {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        this.lastCollectTime = Date.now();
        this.updateComboDisplay();
    }

    // 重置連擊
    resetCombo() {
        this.combo = 0;
        this.updateComboDisplay();
    }

    // 更新連擊顯示
    updateComboDisplay() {
        if (this.combo > 1) {
            // 播放 combo 音效
            if (this.game.audio) {
                this.game.audio.startComboSound();
            }
            
            // 更新顯示
            let comboDisplay = document.querySelector('.combo-display');
            if (comboDisplay) {
                comboDisplay.textContent = `COMBO TIME x${this.combo}`;
                comboDisplay.style.display = 'block';
            } else {
                comboDisplay = document.createElement('div');
                comboDisplay.className = 'combo-display';
                comboDisplay.textContent = `COMBO TIME x${this.combo}`;
                document.querySelector('.game-container').appendChild(comboDisplay);
            }
        } else {
            // 停止 combo 音效
            if (this.game.audio) {
                this.game.audio.stopComboSound();
            }
            
            // 隱藏顯示
            let comboDisplay = document.querySelector('.combo-display');
            if (comboDisplay) {
                comboDisplay.style.display = 'none';
            }
        }
    }

    // 檢查是否在連擊時間窗口內
    isInComboWindow() {
        return (Date.now() - this.lastCollectTime) < this.comboTimeWindow;
    }

    // 獲取當前連擊數
    getCombo() {
        return this.combo;
    }

    // 獲取最高連擊數
    getMaxCombo() {
        return this.maxCombo;
    }
} 