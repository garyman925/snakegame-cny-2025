import { gameConfig } from '../config/gameConfig.js';

export class Timer {
    constructor(game) {
        this.game = game;
        this.gameDuration = gameConfig.gameDuration * 1000; // 轉換為毫秒
        this.endTime = 0;
        this.remainingTime = 0;
        this.isTimeFrozen = false;
        this.frozenTimeRemaining = 0;
        this.timerInterval = null;
        
        // 獲取 DOM 元素
        this.timerText = document.querySelector('.timer-text');
        this.timerBar = document.querySelector('.timer-bar');
    }

    start() {
        this.endTime = Date.now() + this.gameDuration;
        this.remainingTime = this.gameDuration;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            const timeLeft = this.update();
            if (timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    update() {
        // 如果時間暫停中，不更新時間
        if (this.isTimeFrozen) {
            return this.frozenTimeRemaining;
        }

        const timeLeft = Math.max(0, this.endTime - Date.now());
        const totalTime = this.gameDuration;
        const percentage = timeLeft / totalTime;

        // 更新時間文字
        const seconds = Math.ceil(timeLeft / 1000);
        if (this.timerText) {
            this.timerText.textContent = seconds;
        }

        // 更新計時條
        if (this.timerBar) {
            this.timerBar.style.transform = `scaleY(${percentage})`;

            // 當時間少於 30 秒時添加警告效果
            if (seconds <= 30 && !this.isTimeFrozen) {
                this.timerBar.classList.add('warning');
                this.timerText.classList.add('warning');
            } else {
                this.timerBar.classList.remove('warning');
                this.timerText.classList.remove('warning');
            }
        }

        this.remainingTime = timeLeft;
        return timeLeft;
    }

    timeUp() {
        if (!this.game.isGameOver) {
            this.game.gameOver();
        }
    }

    pause() {
        clearInterval(this.timerInterval);
        this.frozenTimeRemaining = this.remainingTime;
    }

    resume() {
        this.endTime = Date.now() + this.frozenTimeRemaining;
        this.start();
    }

    // 時間暫停道具相關方法
    freeze() {
        this.isTimeFrozen = true;
        this.frozenTimeRemaining = this.endTime - Date.now();
        
        // 視覺效果
        if (this.timerBar) {
            this.timerBar.classList.add('frozen');
        }
        if (this.timerText) {
            this.timerText.classList.add('frozen');
        }
    }

    unfreeze() {
        this.isTimeFrozen = false;
        this.endTime = Date.now() + this.frozenTimeRemaining;
        
        // 移除視覺效果
        if (this.timerBar) {
            this.timerBar.classList.remove('frozen');
        }
        if (this.timerText) {
            this.timerText.classList.remove('frozen');
        }
    }

    getRemainingTime() {
        return this.remainingTime;
    }

    getTimeBonus() {
        const remainingSeconds = Math.floor(this.remainingTime / 1000);
        if (remainingSeconds >= gameConfig.scoreConfig.timeBonus.threshold) {
            return gameConfig.scoreConfig.timeBonus.points;
        }
        return 0;
    }

    cleanup() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
} 