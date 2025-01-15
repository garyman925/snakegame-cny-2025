export class InputSystem {
    constructor(game) {
        this.game = game;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 30;
        this.isInputEnabled = true;
        
        // 綁定事件處理器
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupButtonControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (!this.isInputEnabled) return;
            
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    event.preventDefault();
                    this.game.snake.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    event.preventDefault();
                    this.game.snake.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    event.preventDefault();
                    this.game.snake.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    event.preventDefault();
                    this.game.snake.changeDirection('right');
                    break;
                case ' ':
                    event.preventDefault();
                    this.handlePauseInput();
                    break;
            }
        });
    }

    setupTouchControls() {
        document.addEventListener('touchstart', (event) => {
            if (!this.isInputEnabled) return;
            
            const touch = event.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', (event) => {
            if (!this.isInputEnabled) return;
            
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            if (Math.abs(deltaX) < this.swipeThreshold && 
                Math.abs(deltaY) < this.swipeThreshold) {
                return;
            }

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑動
                if (deltaX > 0) {
                    this.game.snake.changeDirection('right');
                } else {
                    this.game.snake.changeDirection('left');
                }
            } else {
                // 垂直滑動
                if (deltaY > 0) {
                    this.game.snake.changeDirection('down');
                } else {
                    this.game.snake.changeDirection('up');
                }
            }
        });
    }

    setupButtonControls() {
        const buttons = {
            'up-btn': 'up',
            'down-btn': 'down',
            'left-btn': 'left',
            'right-btn': 'right'
        };

        Object.entries(buttons).forEach(([id, direction]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    if (this.isInputEnabled) {
                        this.game.snake.changeDirection(direction);
                    }
                });
            }
        });

        // 暫停按鈕
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.handlePauseInput();
            });
        }
    }

    handlePauseInput() {
        if (this.game.isGameOver) return;
        
        if (this.game.isPaused) {
            this.game.resumeGame();
        } else {
            this.game.pauseGame();
        }
    }

    enableInput() {
        this.isInputEnabled = true;
    }

    disableInput() {
        this.isInputEnabled = false;
    }

    cleanup() {
        // 如果需要，可以在這裡移除事件監聽器
        // 但由於遊戲通常只會運行一次，所以可能不需要
    }
} 