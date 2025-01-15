import { difficulties } from '../config/difficulties.js';

export class UISystem {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // 主要容器
        this.elements.gameContainer = document.querySelector('.game-container');
        this.elements.startScreen = document.querySelector('.start-screen');
        this.elements.gameScreen = document.querySelector('.game-screen');
        this.elements.resultScreen = document.querySelector('.game-result');
        
        // 遊戲頭部資訊
        this.elements.scoreValue = document.querySelector('.score-value');
        this.elements.comboValue = document.querySelector('.combo-value');
        this.elements.timerText = document.querySelector('.timer-text');
        this.elements.currentPhrase = document.querySelector('.current-phrase');
        
        // 收集的字詞容器
        this.elements.collectedWords = document.querySelector('.collected-words');
        
        // 結果相關元素
        this.elements.finalScore = document.querySelector('.final-score');
        this.elements.maxCombo = document.querySelector('.max-combo');
        this.elements.timeBonus = document.querySelector('.time-bonus');
        this.elements.totalScore = document.querySelector('.total-score');
        
        // 難度選擇按鈕
        this.elements.difficultyButtons = {
            EASY: document.querySelector('.difficulty-btn[data-difficulty="EASY"]'),
            NORMAL: document.querySelector('.difficulty-btn[data-difficulty="NORMAL"]'),
            HARD: document.querySelector('.difficulty-btn[data-difficulty="HARD"]')
        };
    }

    setupEventListeners() {
        // 開始按鈕
        const startBtn = document.querySelector('.start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.hideStartScreen();
                this.game.startGame();
            });
        }

        // 難度選擇按鈕
        Object.entries(this.elements.difficultyButtons).forEach(([difficulty, button]) => {
            if (button) {
                button.addEventListener('click', () => {
                    this.selectDifficulty(difficulty);
                });
            }
        });

        // 重新開始按鈕
        const restartBtn = document.querySelector('.restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hideResultScreen();
                this.game.resetGame();
            });
        }
    }

    selectDifficulty(difficulty) {
        // 移除所有按鈕的活動狀態
        Object.values(this.elements.difficultyButtons).forEach(button => {
            if (button) {
                button.classList.remove('active');
            }
        });

        // 設置選中的難度按鈕
        const selectedButton = this.elements.difficultyButtons[difficulty];
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // 更新遊戲難度
        this.game.setDifficulty(difficulty);
    }

    showStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'flex';
        }
        if (this.elements.gameScreen) {
            this.elements.gameScreen.style.display = 'none';
        }
    }

    hideStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'none';
        }
        if (this.elements.gameScreen) {
            this.elements.gameScreen.style.display = 'block';
        }
    }

    showResultScreen(results) {
        if (this.elements.resultScreen) {
            this.elements.resultScreen.style.display = 'flex';
            
            // 更新結果數據
            if (this.elements.finalScore) {
                this.elements.finalScore.textContent = results.score;
            }
            if (this.elements.maxCombo) {
                this.elements.maxCombo.textContent = results.maxCombo;
            }
            if (this.elements.timeBonus) {
                this.elements.timeBonus.textContent = results.timeBonus;
            }
            if (this.elements.totalScore) {
                this.elements.totalScore.textContent = results.total;
            }
        }
    }

    hideResultScreen() {
        if (this.elements.resultScreen) {
            this.elements.resultScreen.style.display = 'none';
        }
    }

    updateScore(score) {
        if (this.elements.scoreValue) {
            this.elements.scoreValue.textContent = score;
        }
    }

    updateCombo(combo) {
        if (this.elements.comboValue) {
            this.elements.comboValue.textContent = combo;
        }
    }

    updateTimer(time) {
        if (this.elements.timerText) {
            this.elements.timerText.textContent = time;
        }
    }

    updateCurrentPhrase(words) {
        if (this.elements.currentPhrase) {
            this.elements.currentPhrase.textContent = words.join('');
        }
    }

    showPauseOverlay() {
        const pauseOverlay = document.createElement('div');
        pauseOverlay.className = 'pause-overlay';
        pauseOverlay.innerHTML = `
            <div class="pause-content">
                <h2>遊戲暫停</h2>
                <button class="resume-btn">繼續遊戲</button>
            </div>
        `;

        pauseOverlay.querySelector('.resume-btn').addEventListener('click', () => {
            this.game.resumeGame();
        });

        document.body.appendChild(pauseOverlay);
    }

    hidePauseOverlay() {
        const overlay = document.querySelector('.pause-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showMessage(message, duration = 2000) {
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, duration);
    }

    cleanup() {
        // 清理所有UI元素和事件監聽器
        this.hidePauseOverlay();
        const messages = document.querySelectorAll('.game-message');
        messages.forEach(msg => msg.remove());
    }
} 