import { gameConfig } from '../config/gameConfig.js';

export class ScoreSystem {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.scoreElement = document.querySelector('.score-value');
        this.comboElement = document.querySelector('.combo-value');
    }

    increaseCombo() {
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // 更新連擊顯示
        if (this.comboElement) {
            this.comboElement.textContent = this.combo;
        }

        // 播放連擊音效
        if (this.combo > 1) {
            this.game.audio.playComboSound(this.combo);
        }

        // 增加移動速度
        const speedIncrease = Math.min(this.combo * gameConfig.scoreConfig.speedIncrease, 0.1);
        this.game.snake.setMoveSpeed(0.15 + speedIncrease);

        // 更新背景音樂速度
        const musicRate = Math.min(1.0 + (this.combo - 1) * 0.1, 1.5);
        this.game.audio.setRate('bgm', musicRate);
    }

    resetCombo() {
        this.combo = 0;
        if (this.comboElement) {
            this.comboElement.textContent = '0';
        }
        
        // 重置移動速度和音樂速度
        this.game.snake.setMoveSpeed(0.15);
        this.game.audio.setRate('bgm', 1.0);
    }

    calculateScore(index, isCorrectOrder) {
        let points = gameConfig.scoreConfig.base;
        let bonusText = '';

        // 連擊加成
        if (this.combo > 1) {
            const comboBonus = Math.floor(points * (this.combo - 1) * gameConfig.scoreConfig.comboMultiplier);
            points += comboBonus;
            bonusText = `連擊 x${this.combo}`;
        }

        // 正確順序加成
        if (isCorrectOrder) {
            const orderBonus = Math.floor(points * gameConfig.scoreConfig.orderMultiplier);
            points += orderBonus;
            bonusText = bonusText ? `${bonusText} + 順序加成` : '順序加成';
        }

        return { score: points, bonusText };
    }

    updateScore(points, x, y, bonusText) {
        this.score += points;
        
        // 更新分數顯示
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }

        // 顯示得分動畫
        this.showScoreAnimation(points, x, y, bonusText);
    }

    showScoreAnimation(points, x, y, bonusText) {
        const scorePopup = document.createElement('div');
        scorePopup.className = 'score-popup';
        
        // 如果有加成文字，顯示在上方
        if (bonusText) {
            const bonusElement = document.createElement('div');
            bonusElement.className = 'bonus-text';
            bonusElement.textContent = bonusText;
            scorePopup.appendChild(bonusElement);
        }

        // 顯示分數
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-text';
        scoreElement.textContent = `+${points}`;
        scorePopup.appendChild(scoreElement);

        // 設置位置
        scorePopup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y - 60}px;
            pointer-events: none;
            z-index: 1000;
        `;

        document.body.appendChild(scorePopup);

        // 使用 GSAP 製作動畫
        gsap.fromTo(scorePopup,
            {
                opacity: 0,
                scale: 0.5,
                y: '+=20'
            },
            {
                opacity: 1,
                scale: 1,
                y: '-=40',
                duration: 0.3,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    gsap.to(scorePopup, {
                        opacity: 0,
                        y: '-=30',
                        duration: 0.2,
                        delay: 0.5,
                        ease: 'power1.in',
                        onComplete: () => scorePopup.remove()
                    });
                }
            }
        );
    }

    getFinalScore() {
        return {
            score: this.score,
            maxCombo: this.maxCombo,
            timeBonus: this.game.timer.getTimeBonus(),
            total: this.score + this.game.timer.getTimeBonus()
        };
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        
        if (this.scoreElement) {
            this.scoreElement.textContent = '0';
        }
        if (this.comboElement) {
            this.comboElement.textContent = '0';
        }
    }
} 