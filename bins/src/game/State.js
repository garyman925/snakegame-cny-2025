export class GameState {
    constructor(game) {
        this.game = game;
        this.currentState = 'INIT';  // 初始狀態
        this.previousState = null;
        
        // 定義所有可能的狀態
        this.states = {
            INIT: {
                enter: this.enterInit.bind(this),
                exit: this.exitInit.bind(this)
            },
            MENU: {
                enter: this.enterMenu.bind(this),
                exit: this.exitMenu.bind(this)
            },
            PLAYING: {
                enter: this.enterPlaying.bind(this),
                exit: this.exitPlaying.bind(this)
            },
            PAUSED: {
                enter: this.enterPaused.bind(this),
                exit: this.exitPaused.bind(this)
            },
            GAME_OVER: {
                enter: this.enterGameOver.bind(this),
                exit: this.exitGameOver.bind(this)
            }
        };
    }

    // 狀態切換
    changeState(newState) {
        if (!this.states[newState]) {
            console.error(`Invalid state: ${newState}`);
            return;
        }

        // 退出當前狀態
        if (this.currentState && this.states[this.currentState].exit) {
            this.states[this.currentState].exit();
        }

        // 保存前一個狀態
        this.previousState = this.currentState;
        
        // 更新當前狀態
        this.currentState = newState;

        // 進入新狀態
        if (this.states[newState].enter) {
            this.states[newState].enter();
        }

        console.log(`Game state changed: ${this.previousState} -> ${this.currentState}`);
    }

    // INIT 狀態
    enterInit() {
        // 加載必要資源
        this.game.audio.loadSounds();
        this.game.loadImages();
        
        // 初始化遊戲設置
        this.game.setDifficulty('NORMAL');
        
        // 自動轉換到選單狀態
        this.changeState('MENU');
    }

    exitInit() {
        // 清理任何初始化相關的臨時資源
    }

    // MENU 狀態
    enterMenu() {
        // 顯示開始畫面
        this.game.ui.showStartScreen();
        
        // 重置遊戲數據
        this.game.resetGameData();
        
        // 播放背景音樂
        this.game.audio.play('bgm');
    }

    exitMenu() {
        // 隱藏開始畫面
        this.game.ui.hideStartScreen();
    }

    // PLAYING 狀態
    enterPlaying() {
        // 開始遊戲循環
        this.game.startGameLoop();
        
        // 啟用輸入
        this.game.input.enableInput();
        
        // 開始計時
        this.game.timer.start();
        
        // 生成初始食物
        this.game.food.spawnFood();
        
        // 開始道具生成計時器
        this.startPowerUpTimer();
    }

    exitPlaying() {
        // 停止遊戲循環
        this.game.stopGameLoop();
        
        // 停止道具生成
        if (this.powerUpTimer) {
            clearInterval(this.powerUpTimer);
        }
    }

    // PAUSED 狀態
    enterPaused() {
        // 暫停遊戲
        this.game.timer.pause();
        
        // 禁用輸入
        this.game.input.disableInput();
        
        // 顯示暫停介面
        this.game.ui.showPauseOverlay();
        
        // 暫停音樂
        this.game.audio.pause('bgm');
    }

    exitPaused() {
        // 恢復遊戲
        this.game.timer.resume();
        
        // 啟用輸入
        this.game.input.enableInput();
        
        // 隱藏暫停介面
        this.game.ui.hidePauseOverlay();
        
        // 恢復音樂
        this.game.audio.play('bgm');
    }

    // GAME_OVER 狀態
    enterGameOver() {
        // 停止遊戲循環
        this.game.stopGameLoop();
        
        // 禁用輸入
        this.game.input.disableInput();
        
        // 計算最終分數
        const finalResults = this.game.score.getFinalScore();
        
        // 顯示結果畫面
        this.game.ui.showResultScreen(finalResults);
        
        // 停止音樂
        this.game.audio.stop('bgm');
        
        // 清理遊戲資源
        this.cleanup();
    }

    exitGameOver() {
        // 隱藏結果畫面
        this.game.ui.hideResultScreen();
    }

    // 道具生成計時器
    startPowerUpTimer() {
        const frequency = this.game.currentDifficulty.powerUpFrequency;
        this.powerUpTimer = setInterval(() => {
            if (!this.game.isPaused && this.currentState === 'PLAYING') {
                this.game.powerUps.spawnPowerUp();
            }
        }, frequency);
    }

    // 清理資源
    cleanup() {
        if (this.powerUpTimer) {
            clearInterval(this.powerUpTimer);
        }
        this.game.powerUps.cleanup();
        this.game.effects.cleanup();
        this.game.ui.cleanup();
        this.game.timer.cleanup();
    }

    // 狀態查詢方法
    isPlaying() {
        return this.currentState === 'PLAYING';
    }

    isPaused() {
        return this.currentState === 'PAUSED';
    }

    isGameOver() {
        return this.currentState === 'GAME_OVER';
    }

    // 遊戲流程控制
    startGame() {
        this.changeState('PLAYING');
    }

    pauseGame() {
        if (this.isPlaying()) {
            this.changeState('PAUSED');
        }
    }

    resumeGame() {
        if (this.isPaused()) {
            this.changeState('PLAYING');
        }
    }

    gameOver() {
        this.changeState('GAME_OVER');
    }

    restartGame() {
        this.changeState('MENU');
    }
} 