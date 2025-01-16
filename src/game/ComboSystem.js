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
            
            // 獲取或創建 combo 顯示元素
            let comboDisplay = document.querySelector('.combo-display');
            if (!comboDisplay) {
                comboDisplay = document.createElement('div');
                comboDisplay.className = 'combo-display';
                document.querySelector('.game-container').appendChild(comboDisplay);
            }

            // 更新文字
            comboDisplay.textContent = `COMBO x${this.combo}`;
            
            // 重置動畫
            comboDisplay.classList.remove('active');
            // 強制瀏覽器重繪
            void comboDisplay.offsetWidth;
            // 觸發新的動畫
            comboDisplay.classList.add('active');

            // 保存引用
            this.comboDisplay = comboDisplay;
            
            // 監聽動畫結束
            comboDisplay.addEventListener('animationend', () => {
                comboDisplay.classList.remove('active');
            }, { once: true });

        } else {
            // 停止 combo 音效
            if (this.game.audio) {
                this.game.audio.stopComboSound();
            }
            
            // 隱藏顯示
            if (this.comboDisplay) {
                this.comboDisplay.classList.remove('active');
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

    showComboText() {
        if (!this.comboDisplay) return;
        // 移除之前的動畫
        this.comboDisplay.classList.remove('active');
        
        // 強制重繪
        void this.comboDisplay.offsetWidth;
        
        // 添加新的動畫
        this.comboDisplay.classList.add('active');
        
        // 監聽動畫結束
        this.comboDisplay.addEventListener('animationend', () => {
            this.comboDisplay.classList.remove('active');
        }, { once: true });
    }
} 