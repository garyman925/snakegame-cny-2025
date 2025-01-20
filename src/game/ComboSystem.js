export class ComboSystem {
    constructor(game) {
        this.game = game;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastComboTime = 0;
        this.comboTimeWindow = 2000; // 2秒內需要收集下一個
        this.comboDisplay = null;
    }

    increaseCombo() {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.lastComboTime = Date.now();
        this.updateComboDisplay();
    }

    resetCombo() {
        this.combo = 0;
        this.lastComboTime = 0;
        if (this.game.audio) {
            this.game.audio.stopComboSound();
        }
        if (this.comboDisplay) {
            this.comboDisplay.classList.remove('active');
        }
    }

    getCurrentMultiplier() {
        // 使用對數函數計算倍率
        return this.combo > 1 ? 1 + Math.log(this.combo) : 1;
    }

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

            // 計算當前倍率並格式化
            const multiplier = this.getCurrentMultiplier();

            // 更新文字，加入倍率顯示
            comboDisplay.innerHTML = `
                <div class="combo-text">COMBO</div>
                <div class="combo-number">x${this.combo}</div>
                <div class="multiplier">${multiplier.toFixed(1)}倍</div>
            `;
            
            // 重置動畫
            comboDisplay.classList.remove('active');
            void comboDisplay.offsetWidth; // 強制瀏覽器重繪
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

    isInComboWindow() {
        if (this.combo === 0) return true;
        return Date.now() - this.lastComboTime < this.comboTimeWindow;
    }

    getCombo() {
        return this.combo;
    }

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