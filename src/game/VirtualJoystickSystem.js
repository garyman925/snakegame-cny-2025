export class VirtualJoystickSystem {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.container = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            this.createJoystick();
            this.setupEventListeners();
            // 初始化時先隱藏
            this.hide();
        }
    }

    createJoystick() {
        // 創建虛擬搖桿容器
        this.container = document.createElement('div');
        this.container.className = 'virtual-joystick';
        
        // 創建方向按鈕
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(dir => {
            const button = document.createElement('button');
            button.className = `joystick-btn ${dir}`;
            button.setAttribute('data-direction', dir);
            
            // 添加箭頭圖標
            const arrow = document.createElement('span');
            arrow.className = 'arrow';
            button.appendChild(arrow);
            
            this.container.appendChild(button);
        });

        // 將虛擬搖桿添加到遊戲容器中，而不是 body
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.container);
        }
    }

    setupEventListeners() {
        // 為每個按鈕添加觸摸事件
        const buttons = this.container.querySelectorAll('.joystick-btn');
        
        buttons.forEach(button => {
            // 觸摸開始
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = button.getAttribute('data-direction');
                this.handleDirectionChange(direction);
                button.classList.add('active');
            });

            // 觸摸結束
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('active');
            });

            // 觸摸取消
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.classList.remove('active');
            });
        });
    }

    handleDirectionChange(direction) {
        // 防止反向移動
        const currentDir = this.game.direction;
        if ((direction === 'up' && currentDir === 'down') ||
            (direction === 'down' && currentDir === 'up') ||
            (direction === 'left' && currentDir === 'right') ||
            (direction === 'right' && currentDir === 'left')) {
            return;
        }
        
        this.game.direction = direction;
    }

    show() {
        if (this.container && this.isMobile) {
            this.container.style.display = 'grid';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }

    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
} 