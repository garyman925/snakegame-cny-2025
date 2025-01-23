export class TimerSystem {
    constructor(game) {
        this.game = game;
        this.gameDuration = 10; // 遊戲時長（秒）
        this.endTime = 0; // 遊戲結束時間點
        this.remainingTime = this.gameDuration;
        this.timer = null;
        this.isPaused = false;
        this.pausedTimeRemaining = null;
        this.isTimeFrozen = false;
        this.frozenTimeRemaining = 0;

        // 獲取 UI 元素
        this.timerBar = document.querySelector('.timer-bar');
        this.timerText = document.querySelector('.timer-text');

        // 添加重新開始按鈕的事件監聽
        const restartButton = document.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                // 重新載入頁面
                window.location.reload();
            });
        }
    }

    // 開始計時
    startTimer() {
        this.endTime = Date.now() + (this.gameDuration * 1000);
        
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            const timeLeft = this.updateTimer();
            if (timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    // 更新計時器
    updateTimer() {
        if (this.isTimeFrozen) return this.frozenTimeRemaining;

        const timeLeft = Math.max(0, this.endTime - Date.now());
        const totalTime = this.gameDuration * 1000;
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
            if (seconds <= 30) {
                this.timerBar.classList.add('warning');
                this.timerText.classList.add('warning');
            } else {
                this.timerBar.classList.remove('warning');
                this.timerText.classList.remove('warning');
            }
        }

        return timeLeft;
    }

    // 暫停計時
    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.pausedTimeRemaining = this.endTime - Date.now();
        }
        this.isPaused = true;
    }

    // 恢復計時
    resumeTimer() {
        if (this.pausedTimeRemaining) {
            this.endTime = Date.now() + this.pausedTimeRemaining;
            this.startTimer();
        }
        this.isPaused = false;
    }

    // 時間到
    timeUp() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 使用 game 的 handleGameOver 方法來處理遊戲結束
        this.game.handleGameOver('時間到！');
    }

    // 重置計時器
    resetTimer() {
        this.remainingTime = this.gameDuration;
        this.endTime = Date.now() + (this.gameDuration * 1000);
        this.isPaused = false;
        this.pausedTimeRemaining = null;
        this.isTimeFrozen = false;
        this.frozenTimeRemaining = 0;
    }

    // 凍結時間
    freezeTime() {
        this.isTimeFrozen = true;
        this.frozenTimeRemaining = this.endTime - Date.now();
        if (this.timerBar) {
            this.timerBar.classList.add('freezing');
        }
    }

    // 解凍時間
    unfreezeTime() {
        this.isTimeFrozen = false;
        this.endTime = Date.now() + this.frozenTimeRemaining;
        if (this.timerBar) {
            this.timerBar.classList.remove('freezing');
        }
    }
} 