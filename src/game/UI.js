export class UISystem {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // 初始化UI元素
        this.elements = {
            scoreDisplay: document.querySelector('.current-score'),
            timerText: document.querySelector('.timer-text'),
            timerBar: document.querySelector('.timer-bar'),
            collectedWords: document.querySelector('.collected-words'),
            gameResult: document.getElementById('gameResult'),
            completionPopup: document.getElementById('completionPopup')
        };
    }

    showEffectText(text, duration) {
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message effect-message';
        messageElement.textContent = text;
        
        const comboElement = document.querySelector('.combo-value');
        if (comboElement) {
            comboElement.parentNode.insertBefore(messageElement, comboElement.nextSibling);
        } else {
            document.body.appendChild(messageElement);
        }

        setTimeout(() => {
            messageElement.remove();
        }, duration * 1000);
    }

    updateScore(score) {
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = score;
        }
    }

    updateTimer(timeLeft, totalTime) {
        const percentage = timeLeft / totalTime;
        const seconds = Math.ceil(timeLeft / 1000);

        if (this.elements.timerText) {
            this.elements.timerText.textContent = seconds;
        }

        if (this.elements.timerBar) {
            this.elements.timerBar.style.transform = `scaleY(${percentage})`;
            
            // 時間警告效果
            if (seconds <= 30) {
                this.elements.timerBar.classList.add('warning');
                this.elements.timerText.classList.add('warning');
            } else {
                this.elements.timerBar.classList.remove('warning');
                this.elements.timerText.classList.remove('warning');
            }
        }
    }

    setupEventListeners() {
        // UI相關的事件監聽器
    }
} 