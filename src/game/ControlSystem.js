export class ControlSystem {
    constructor(game) {
        this.game = game;
        this.setupKeyboardControls();
        this.setupTouchControls();
        console.log('✅ 控制系統初始化完成');
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (this.game.isGameOver) return;

            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.game.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.game.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.game.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.game.changeDirection('right');
                    break;
                case 'p':
                case 'P':
                    if (this.game.isPaused) {
                        this.game.resumeGame();
                    } else {
                        this.game.pauseGame();
                    }
                    break;
                case 'F3':
                    this.game.toggleDebug();
                    break;
            }
        });
    }

    setupTouchControls() {
        // 獲取控制按鈕
        const upButton = document.getElementById('upButton');
        const downButton = document.getElementById('downButton');
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');

        // 添加觸控事件
        if (upButton) {
            upButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.changeDirection('up');
            });
        }

        if (downButton) {
            downButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.changeDirection('down');
            });
        }

        if (leftButton) {
            leftButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.changeDirection('left');
            });
        }

        if (rightButton) {
            rightButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.changeDirection('right');
            });
        }

        // 防止 iOS Safari 的橡皮筋效果
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.controls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
} 