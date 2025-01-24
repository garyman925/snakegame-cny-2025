export class GameResultSystem {
    constructor(game) {
        this.game = game;
        this.resultElement = null;
        this.setupRankingToggle();  // 在初始化時設置排行榜切換功能
        this.setupRestartButton();   // 添加重啟按鈕功能
    }

    setupRestartButton() {
        const restartButton = document.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    setupRankingToggle() {
        const rankingButton = document.querySelector('.ranking-button');
        
        console.log('設置排行榜切換功能');

        if (rankingButton) {
            console.log('找到排行榜按鈕，添加點擊事件');
            
            rankingButton.addEventListener('click', () => {
                const rankingContainer = document.querySelector('#gameResult .ranking-container');
                const scoreContainer = document.querySelector('#gameResult .score-div');

                console.log('DOM結構:', {
                    gameResult: document.getElementById('gameResult'),
                    resultContainer: document.querySelector('.result-container'),
                    scoreElement: document.querySelector('.score-'),
                    rankingElement: document.querySelector('.ranking-container'),
                    fullDOM: document.getElementById('gameResult')?.innerHTML
                });

                if (rankingContainer && scoreContainer) {
                    if (!rankingContainer.classList.contains('show')) {
                        console.log('切換到排行榜視圖');
                        scoreContainer.classList.add('hide');
                    
                        setTimeout(() => {
                            rankingContainer.classList.add('show');
                        }, 300);
                        rankingButton.textContent = '返回成績';
                    } else {
                        console.log('切換到成績視圖');

                        setTimeout(() => {
                            rankingContainer.classList.remove('show');
                            scoreContainer.classList.remove('hide');
                        }, 300);
                        rankingButton.textContent = '查看排行榜';
                    }
                } else {
                    console.warn('找不到必要元素:', {
                        rankingContainer: !!rankingContainer,
                        scoreContainer: !!scoreContainer,
                        resultContainer: !!document.querySelector('.result-container'),
                        scoreClass: document.querySelector('.score-')?.className,
                        rankingClass: document.querySelector('.ranking-container')?.className
                    });
                }
            });
        } else {
            console.warn('找不到排行榜按鈕');
        }
    }

    resetGame() {
        try {
            // 隱藏結果界面
            this.hideGameResult();
            
            // 重新載入頁面
            window.location.reload();
        } catch (error) {
            console.error('重置遊戲失敗:', error);
            // 如果出錯也是重新載入頁面
            window.location.reload();
        }
    }

    showGameResult(reason) {
        console.log('顯示遊戲結果：', reason);
        
        // 使用 ID 和 class 兩種方式尋找元素
        this.resultElement = this.resultElement || document.getElementById('gameResult');
        const resultByClass = document.querySelector('.game-result');
        
        // 使用找到的任一元素
        const resultElement = this.resultElement || resultByClass;
        
        if (!resultElement) {
            console.error('找不到 gameResult 元素', {
                elementId: 'gameResult',
                className: 'game-result',
                document: document.body.innerHTML
            });
            return;
        }
        
        // 更新 this.resultElement 引用
        this.resultElement = resultElement;

        // 確保元素存在且可見
        this.resultElement.style.display = 'flex';  // 使用 flex 以保持原有布局
        this.resultElement.classList.remove('hidden');
        this.resultElement.classList.add('active');
        
        console.log('Result element visibility:', {
            display: this.resultElement.style.display,
            classList: Array.from(this.resultElement.classList),
            visibility: window.getComputedStyle(this.resultElement).visibility
        });

        // 設置結束原因
        const reasonElement = this.resultElement.querySelector('.game-over-reason');
        if (reasonElement) {
            reasonElement.textContent = reason;
            console.log('已設置遊戲結束原因:', reason);
        } else {
            console.error('找不到遊戲結束原因元素');
        }

        // 更新分數
        const scoreDisplay = this.resultElement.querySelector('.score-value');
        const finalScoreElement = document.getElementById('finalScore');
        const totalScore = this.game.scoreSystem.score; // 從 ScoreSystem 獲取分數
        
        // 計算金幣
        const coinDisplay = this.resultElement.querySelector('#totalCoins');
        const coins = Math.floor(totalScore / 10);
        const maxCoins = 50;
        const finalCoins = Math.min(Math.max(coins, 0), maxCoins);
        
        if (finalCoins == maxCoins) {
            console.log('*你已到兌換戲上限');
            const warningElement = document.querySelector('.coins-limit-warning');
            if (warningElement) {
                warningElement.classList.add('show');
            } else {
                
            }
        }

        console.log('coins:', finalCoins);
        console.log('score:', totalScore);

        // 建立動畫序列
        if (scoreDisplay) {
            anime({
                targets: scoreDisplay,
                innerHTML: [0, totalScore],
                duration: 2000,
                round: 1,
                easing: 'easeInOutQuart',
                update: function(anim) {
                    if (anim.progress > 0 && anim.progress < 100) {
                        scoreDisplay.classList.add('score-jump');
                    } else {
                        scoreDisplay.classList.remove('score-jump');
                    }
                }
            }).finished.then(() => {
                // 播放金幣動畫
                return anime({
                    targets: coinDisplay,
                    innerHTML: [0, finalCoins],
                    duration: 1500,
                    round: 1,
                    easing: 'easeOutExpo'
                }).finished;
            }).then(() => {
                // 播放總收集數動畫
                return anime({
                    targets: stats.totalCollected,
                    innerHTML: [0, this.game.stats.totalCollected || 0],
                    duration: 1000,
                    round: 1,
                    easing: 'easeOutExpo'
                }).finished;
            }).then(() => {
                // 播放最高連擊動畫
                return anime({
                    targets: stats.maxCombo,
                    innerHTML: [0, this.game.comboSystem.getMaxCombo()],
                    duration: 1000,
                    round: 1,
                    easing: 'easeOutExpo'
                }).finished;
            }).then(() => {
                // 最後播放 confetti 效果
                if (this.game.confettiSystem) {
                    this.game.confettiSystem.playEndGameEffect();
                }
            });
        }

        // 更新完成的祝賀詞列表
        const completedWordsList = this.resultElement.querySelector('#completedWordsList');
        if (completedWordsList) {
            completedWordsList.innerHTML = this.game.completedGreetings.map(greeting => `
                <tr>
                    <td>${greeting}</td>
                </tr>
            `).join('');
        }

        // 更新統計數據
        const stats = {
            totalCollected: this.resultElement.querySelector('#totalCollected'),
            maxCombo: this.resultElement.querySelector('#maxCombo')
        };

        if (stats.totalCollected) stats.totalCollected.textContent = this.game.stats.totalCollected;
        if (stats.maxCombo) stats.maxCombo.textContent = this.game.comboSystem.getMaxCombo();

        // 計算最終分數和獎勵
        const { finalScore, bonuses } = this.game.calculateFinalScore();
        
        // 強制重繪
        void this.resultElement.offsetWidth;

        // 更新排行榜
        this.game.updateRankingData('score');
    }

    hideGameResult() {
        if (this.resultElement) {
            this.resultElement.classList.add('hidden');
            this.resultElement.classList.remove('active');
            // 等待過渡效果完成後再設置 display
            setTimeout(() => {
                if (this.resultElement.classList.contains('hidden')) {
                    this.resultElement.style.display = 'none';
                }
            }, 300);
        }
    }
} 