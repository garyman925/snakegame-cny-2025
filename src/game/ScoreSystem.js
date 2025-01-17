// 分數系統, 不包括連擊

export class ScoreSystem {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastCollectTime = 0;
        this.comboTimeWindow = 2000;
        
        this.scoreConfig = {
            base: 10,
            completion: 100,
            orderMultiplier: 0.3,
            speedIncrease: 0.01,
            timeBonus: {
                threshold: 30,
                points: 10000
            }
        };

        // 統計數據
        this.stats = {
            totalCollected: 0,
            perfectCollects: 0,
            maxCombo: 0,
            timeBonus: false
        };

        // 添加連擊相關的DOM元素引用
        this.comboIndicator = null;
    }

    calculateScore(index, isCorrectOrder) {
        let score = this.scoreConfig.base;
        let bonusText = '';

        // 使用 ComboSystem 的倍率 - 改為只在combo > 1時才計算
        if (this.game.comboSystem && this.game.comboSystem.combo > 1) {
            const multiplier = this.game.comboSystem.getCurrentMultiplier();
            score *= multiplier;
            bonusText += `連擊 x${this.game.comboSystem.combo}`;
        }

        // 順序加成 - 只在有連擊時計算
        if (isCorrectOrder && this.game.comboSystem && this.game.comboSystem.combo > 1) {
            const orderBonus = score * this.scoreConfig.orderMultiplier;
            score += orderBonus;
            bonusText += bonusText ? '\n順序加成!' : '順序加成!';
        }

        // 四捨五入最終分數
        return { 
            score: Math.round(score), 
            bonusText 
        };
    }

    updateScore(score, x, y, bonusText) {
        const oldScore = this.score;
        const newScore = oldScore + score;
        
        // 使用 anime.js 製作分數增加動畫
        anime({
            targets: this,
            score: [oldScore, newScore],
            duration: 800,  // 動畫持續800毫秒
            easing: 'easeOutQuad',
            round: 1,  // 將數值四捨五入到整數
            update: () => {
                // 更新分數顯示
                if (this.game.ui) {
                    this.game.ui.updateScore(Math.round(this.score));
                }
            }
        });

        // 處理連擊效果
        if (this.combo > 1) {
            // 顯示連擊效果
            this.showComboEffect(x, y);
            
            // 播放連擊音效
            const pitchRate = Math.min(1.0 + (this.combo - 1) * 0.2, 2.0);
            const comboSound = new Howl({
                src: ['snd/combo.mp3'],
                volume: 0.8,
                rate: pitchRate
            });
            comboSound.play();

            // 加快背景音樂
            if (this.game.bgm) {
                const bgmRate = Math.min(1.0 + (this.combo - 1) * 0.1, 1.5);
                this.game.bgm.rate(bgmRate);
            }
        }
    }

    showComboEffect(x, y) {
        const comboDisplay = document.createElement('div');
        comboDisplay.className = 'combo-display';
        
        // 計算當前倍率
        const multiplier = Math.pow(this.scoreConfig.comboMultiplier, this.combo);
        
        comboDisplay.innerHTML = `
            <span class="combo-text">連擊</span>
            <span class="combo-number">x${this.combo}</span>
            <span class="multiplier">${multiplier.toFixed(1)}倍</span>
        `;

        comboDisplay.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y - 40}px;
            animation: comboAppear 0.5s ease forwards;
        `;

        document.body.appendChild(comboDisplay);

        setTimeout(() => {
            comboDisplay.style.animation = 'comboDisappear 0.2s ease forwards';
            setTimeout(() => comboDisplay.remove(), 200);
        }, 800);
    }

    breakCombo() {
        this.combo = 0;
        
        // 移除連擊提示
        if (this.comboIndicator) {
            this.comboIndicator.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (this.comboIndicator) {
                    this.comboIndicator.remove();
                    this.comboIndicator = null;
                }
            }, 300);
        }

        // 恢復背景音樂到正常速度
        if (this.game.bgm) {
            this.game.bgm.rate(1.0);
        }
    }

    increaseCombo() {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.lastCollectTime = Date.now();
    }

    calculateFinalScore() {
        let finalScore = this.score;
        let bonuses = [];

        // 時間獎勵
        if (!this.game.isGameOver && this.game.remainingTime >= this.scoreConfig.timeBonus.threshold) {
            finalScore += this.scoreConfig.timeBonus.points;
            this.stats.timeBonus = true;
            bonuses.push({
                text: '時間獎勵',
                points: this.scoreConfig.timeBonus.points
            });
        }

        // 連擊獎勵
        if (this.maxCombo >= 5) {
            const comboBonus = this.maxCombo * 1000;
            finalScore += comboBonus;
            bonuses.push({
                text: `最高連擊 x${this.maxCombo}`,
                points: comboBonus
            });
        }

        // 更新最終分數顯示
        const finalScoreElement = document.getElementById('finalScore');
        if (finalScoreElement) {
            // 使用 anime.js 製作分數增加動畫
            anime({
                targets: finalScoreElement,
                innerHTML: [0, finalScore],
                duration: 2000,
                round: 1,
                easing: 'easeOutExpo'
            });
        }

        return { finalScore, bonuses };
    }
} 