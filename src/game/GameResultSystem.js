export class GameResultSystem {
    constructor(game) {
        this.game = game;
        this.resultElement = document.getElementById('gameResult');
        
        // 綁定重新開始按鈕
        const restartButton = this.resultElement.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.resetGame();
            });
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
        if (scoreDisplay) {
            scoreDisplay.textContent = this.game.score;
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
            perfectCollects: this.resultElement.querySelector('#perfectCollects'),
            maxCombo: this.resultElement.querySelector('#maxCombo'),
            bonusesList: this.resultElement.querySelector('#bonusesList')
        };

        if (stats.totalCollected) stats.totalCollected.textContent = this.game.stats.totalCollected;
        if (stats.perfectCollects) stats.perfectCollects.textContent = this.game.stats.perfectCollects;
        if (stats.maxCombo) stats.maxCombo.textContent = this.game.comboSystem.getMaxCombo();

        // 計算最終分數和獎勵
        const { finalScore, bonuses } = this.game.calculateFinalScore();

        // 更新獎勵列表
        if (stats.bonusesList) {
            stats.bonusesList.innerHTML = bonuses.map(bonus => `
                <div class="bonus-item">
                    <span>${bonus.text}</span>
                    <span>+${bonus.points}</span>
                </div>
            `).join('');
        }
        
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