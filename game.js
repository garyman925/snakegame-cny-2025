class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        this.gridSize = 40;
        this.snake = [];
        this.direction = 'right';
        this.words = ['龍', '馬', '精', '神'];
        this.currentWordIndex = 0;
        this.score = 0;
        this.food = null;
        this.gameLoop = null;
        this.isGameOver = true;

        this.numberOfDecoys = 3;
        this.decoyFoods = [];

        // 加載圖片
        this.headImage = new Image();
        this.bodyImage = new Image();
        this.headImage.src = 'img/head.png';
        this.bodyImage.src = 'img/body.png';

        // 加載地板貼圖
        this.floorImage1 = new Image();
        this.floorImage2 = new Image();
        this.floorImage1.src = 'img/floor-1.png';
        this.floorImage2.src = 'img/floor-2.png';

        // 添加計時相關的屬性
        this.gameTime = 60; // 60秒
        this.remainingTime = this.gameTime;
        this.timer = null;
        this.completedWords = []; // 記錄完成的祝賀詞

        // 添加結果顯示相關的屬性
        this.resultElement = document.getElementById('gameResult');

        // 確保所有圖片都加載完成
        Promise.all([
            new Promise(resolve => this.headImage.onload = resolve),
            new Promise(resolve => this.bodyImage.onload = resolve),
            new Promise(resolve => this.floorImage1.onload = resolve),
            new Promise(resolve => this.floorImage2.onload = resolve)
        ]).then(() => {
            this.setupEventListeners();
            this.updateWordDisplay();
            this.drawInitialScreen();
        }).catch(error => {
            console.error('圖片加載失敗:', error);
        });
    }

    drawInitialScreen() {
        // 繪製地板作為背景
        this.drawFloor();
        
        // 添加半透明的遮罩
        this.ctx.fillStyle = 'rgba(235, 252, 255, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製文字
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('按開始遊戲按鈕開始', this.canvas.width / 2, this.canvas.height / 2);
    }

    initializeGame() {
        this.snake = [
            {x: 2, y: 1},
            {x: 1, y: 1},
            {x: 0, y: 1}
        ];
        this.direction = 'right';
        this.score = 0;
        this.currentWordIndex = 0;
        this.isGameOver = false;
        this.spawnFood();
        this.updateScore();
        this.remainingTime = this.gameTime;
        this.completedWords = [];
        
        // 開始計時
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
        this.updateTimer(); // 立即更新顯示

        // 隱藏結果顯示
        this.hideGameResult();
    }

    spawnFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
            y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        } while (this.snake.some(segment => segment.x === x && segment.y === y));

        this.food = {
            x: x,
            y: y,
            word: this.words[this.currentWordIndex]
        };

        this.decoyFoods = [];
        for (let i = 0; i < this.numberOfDecoys; i++) {
            let dx, dy;
            do {
                dx = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
                dy = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
            } while (
                this.snake.some(segment => segment.x === dx && segment.y === dy) ||
                (dx === this.food.x && dy === this.food.y) ||
                this.decoyFoods.some(decoy => decoy.x === dx && decoy.y === dy)
            );

            let decoyWord;
            do {
                decoyWord = this.words[Math.floor(Math.random() * this.words.length)];
            } while (decoyWord === this.words[this.currentWordIndex]);

            this.decoyFoods.push({
                x: dx,
                y: dy,
                word: decoyWord
            });
        }
    }

    updateWordDisplay() {
        document.getElementById('wordSequence').textContent = this.words.join(' → ');
        document.getElementById('currentTarget').textContent = this.words[this.currentWordIndex];
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    draw() {
        // 首先繪製地板
        this.drawFloor();
        
        // 繪製網格線（可選）
        this.drawGrid();
        
        // 背景
        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 繪製蛇頭，根據方向旋轉
                this.ctx.save();
                // 移動到蛇頭位置的中心點
                this.ctx.translate(
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2
                );
                
                // 根據方向旋轉
                let rotation = 0;
                switch(this.direction) {
                    case 'up': rotation = -Math.PI/2; break;
                    case 'down': rotation = Math.PI/2; break;
                    case 'left': rotation = Math.PI; break;
                    case 'right': rotation = 0; break;
                }
                this.ctx.rotate(rotation);
                
                // 繪製蛇頭圖片
                this.ctx.drawImage(
                    this.headImage,
                    -this.gridSize/2,
                    -this.gridSize/2,
                    this.gridSize,
                    this.gridSize
                );
                this.ctx.restore();
            } else {
                // 繪製蛇身
                this.ctx.drawImage(
                    this.bodyImage,
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize,
                    this.gridSize
                );
            }
        });

        if (this.food) {
            this.ctx.fillStyle = '#ffd600';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.food.word,
                this.food.x * this.gridSize + this.gridSize/2,
                this.food.y * this.gridSize + this.gridSize/2 + 8
            );
        }

        this.ctx.fillStyle = '#fff';
        this.decoyFoods.forEach(decoy => {
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                decoy.word,
                decoy.x * this.gridSize + this.gridSize/2,
                decoy.y * this.gridSize + this.gridSize/2 + 8
            );
        });
    }

    move() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        const maxX = this.canvas.width / this.gridSize;
        const maxY = this.canvas.height / this.gridSize;

        if (head.x < 0) {
            head.x = maxX - 1;
        } else if (head.x >= maxX) {
            head.x = 0;
        }

        if (head.y < 0) {
            head.y = maxY - 1;
        } else if (head.y >= maxY) {
            head.y = 0;
        }

        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            // 記錄完成的詞
            this.completedWords.push(this.words[this.currentWordIndex]);
            this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            this.updateScore();
            this.updateWordDisplay();
            this.spawnFood();
        } else if (this.decoyFoods.some(decoy => decoy.x === head.x && decoy.y === head.y)) {
            this.score = 0;
            this.currentWordIndex = 0;
            this.completedWords = []; // 清空完成的詞
            this.updateScore();
            this.updateWordDisplay();
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.timer);
        
        this.showGameResult();
        document.getElementById('startButton').textContent = '開始遊戲';
        this.drawInitialScreen();
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            
            this.initializeGame();
            this.gameLoop = setInterval(() => {
                this.move();
                this.draw();
            }, 200);
            
            document.getElementById('startButton').textContent = '重新開始';
        });

        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': if (this.direction !== 'down') this.direction = 'up'; break;
                case 'ArrowDown': if (this.direction !== 'up') this.direction = 'down'; break;
                case 'ArrowLeft': if (this.direction !== 'right') this.direction = 'left'; break;
                case 'ArrowRight': if (this.direction !== 'left') this.direction = 'right'; break;
                // 添加 'End' 鍵作為快捷鍵
                case 'End':
                    if (!this.isGameOver) {
                        this.score = 999; // 測試用分數
                        this.completedWords = ['龍', '馬', '精', '神']; // 測試用完成詞組
                        this.gameOver();
                    }
                    break;
            }
        });

        document.getElementById('upButton').addEventListener('click', () => {
            if (this.direction !== 'down') this.direction = 'up';
        });
        document.getElementById('downButton').addEventListener('click', () => {
            if (this.direction !== 'up') this.direction = 'down';
        });
        document.getElementById('leftButton').addEventListener('click', () => {
            if (this.direction !== 'right') this.direction = 'left';
        });
        document.getElementById('rightButton').addEventListener('click', () => {
            if (this.direction !== 'left') this.direction = 'right';
        });
    }

    // 添加計時器更新方法
    updateTimer() {
        this.remainingTime--;
        // 更新顯示
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (this.remainingTime <= 0) {
            this.timeUp();
        }
    }

    // 時間到方法
    timeUp() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.timer);
        
        this.showGameResult();
        document.getElementById('startButton').textContent = '開始遊戲';
        this.drawInitialScreen();
    }

    // 添加顯示結果的方法
    showGameResult() {
        document.getElementById('finalScore').textContent = this.score;
        
        const completedWordsList = document.getElementById('completedWordsList');
        if (this.completedWords.length > 0) {
            completedWordsList.textContent = this.completedWords.join('、');
        } else {
            completedWordsList.textContent = '未能完成任何祝賀詞';
        }
        
        this.resultElement.classList.remove('hidden');
    }

    // 隱藏結果
    hideGameResult() {
        this.resultElement.classList.add('hidden');
    }

    // 添加繪製地板的方法
    drawFloor() {
        const tileSize = this.gridSize; // 使用與遊戲網格相同的大小
        const numTilesX = Math.ceil(this.canvas.width / tileSize);
        const numTilesY = Math.ceil(this.canvas.height / tileSize);

        for (let y = 0; y < numTilesY; y++) {
            for (let x = 0; x < numTilesX; x++) {
                // 交替使用兩種地板貼圖
                const currentTile = (x + y) % 2 === 0 ? this.floorImage1 : this.floorImage2;
                this.ctx.drawImage(
                    currentTile,
                    x * tileSize,
                    y * tileSize,
                    tileSize,
                    tileSize
                );
            }
        }
    }

    // 添加繪製網格的方法（可選，幫助玩家更清楚地看到移動單位）
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;

        // 繪製垂直線
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // 繪製水平線
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}

window.onload = () => {
    new SnakeGame();
};