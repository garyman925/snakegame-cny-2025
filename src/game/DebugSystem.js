export class DebugSystem {
    constructor(game) {
        this.game = game;
        this.isDebugging = false;
        this.setupKeyBindings();
        
        console.log('✓ DebugSystem 初始化完成');
    }

    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            // 只在按住 Ctrl 時啟用這些快捷鍵
            if (e.ctrlKey) {
                switch(e.key.toLowerCase()) {
                    case 'r': // Ctrl + R: 顯示結果彈窗
                        e.preventDefault();
                        this.showResultPopup();
                        break;
                    case 'p': // Ctrl + P: 暫停/繼續遊戲
                        e.preventDefault();
                        this.togglePause();
                        break;
                    case 'd': // Ctrl + D: 切換 debug 模式
                        e.preventDefault();
                        this.toggleDebugMode();
                        break;
                }
            }
        });

        console.log('✓ Debug快捷鍵已設置：\n' +
                   '  Ctrl + R: 顯示結果彈窗\n' +
                   '  Ctrl + P: 暫停/繼續遊戲\n' +
                   '  Ctrl + D: 切換Debug模式');
    }

    showResultPopup() {
        if (!this.game.isGameOver) {
            console.log('🔍 Debug: 強制顯示結果彈窗');
            this.game.gameOver();
        }
    }

    togglePause() {
        if (this.game.isPaused) {
            console.log('🔍 Debug: 繼續遊戲');
            this.game.resumeGame();
        } else {
            console.log('🔍 Debug: 暫停遊戲');
            this.game.pauseGame();
        }
    }

    toggleDebugMode() {
        this.isDebugging = !this.isDebugging;
        if (this.isDebugging) {
            console.log('🔍 Debug模式已開啟');
            this.showDebugInfo();
        } else {
            console.log('🔍 Debug模式已關閉');
            this.hideDebugInfo();
        }
    }

    showDebugInfo() {
        if (!this.debugPanel) {
            this.debugPanel = document.createElement('div');
            this.debugPanel.className = 'debug-panel';
            this.debugPanel.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                z-index: 9999;
            `;
            document.body.appendChild(this.debugPanel);
        }
        this.updateDebugInfo();
    }

    updateDebugInfo() {
        if (!this.isDebugging) return;

        const info = {
            gameState: this.game.isGameOver ? '遊戲結束' : '遊戲中',
            isPaused: this.game.isPaused ? '已暫停' : '進行中',
            score: this.game.score || 0,
            snakeLength: this.game.snake?.length || 0,
            currentTime: Math.ceil((this.game.endTime - Date.now()) / 1000)
        };

        this.debugPanel.innerHTML = `
            <div>遊戲狀態: ${info.gameState}</div>
            <div>暫停狀態: ${info.isPaused}</div>
            <div>當前分數: ${info.score}</div>
            <div>蛇的長度: ${info.snakeLength}</div>
            <div>剩餘時間: ${info.currentTime}秒</div>
            <div style="margin-top: 10px; color: #aaa;">
                快捷鍵：<br>
                Ctrl + R: 結果彈窗<br>
                Ctrl + P: 暫停/繼續<br>
                Ctrl + D: 切換Debug
            </div>
        `;
    }

    hideDebugInfo() {
        if (this.debugPanel) {
            this.debugPanel.remove();
            this.debugPanel = null;
        }
    }
} 