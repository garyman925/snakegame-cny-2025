class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化圖片加載狀態
        this.imagesLoaded = false;
        
        // 加載所有圖片
        this.loadImages().then(() => {
            this.imagesLoaded = true;
            // 設置全屏
            this.resizeCanvas();
            // 監聽視窗大小變化
            window.addEventListener('resize', () => this.resizeCanvas());
            
            this.setupEventListeners();
            this.updateWordDisplay();
            this.drawInitialScreen();
        });

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

        // 添加計時相關的屬性
        this.gameTime = 60; // 60秒
        this.remainingTime = this.gameTime;
        this.timer = null;
        this.completedWords = []; // 記錄完成的祝賀詞

        // 添加結果顯示相關的屬性
        this.resultElement = document.getElementById('gameResult');

        // 添加一個標記來追蹤已經吃掉的食物
        this.foodEaten = false;

        // 加載祝賀詞數據
        this.loadWordsData();
        
        // 當前祝賀詞組索引
        this.currentGreetingIndex = 0;
        // 當前字詞組
        this.currentWords = [];
        // 已完成的祝賀詞
        this.completedGreetings = [];

        // 初始化收集的字詞顯示
        this.collectedWordsElements = Array.from({length: 4}, (_, i) => 
            document.getElementById(`word${i}`));

        // 添加暫停狀態
        this.isPaused = false;

        // 添加暫停前的剩餘時間
        this.pausedTimeRemaining = null;
    }

    // 添加圖片加載方法
    async loadImages() {
        // 加載圖片
        this.headImage = await this.loadImage('img/head.png');
        this.bodyImage = await this.loadImage('img/body.png');
        this.floorImage1 = await this.loadImage('img/floor-1.png');
        this.floorImage2 = await this.loadImage('img/floor-2.png');
    }

    // 輔助方法：加載單個圖片
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    drawInitialScreen() {
        // 確保圖片已加載
        if (!this.imagesLoaded) return;

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

        this.foodEaten = false; // 重置食物狀態

        this.currentGreetingIndex = 0;
        this.currentWordIndex = 0;
        this.completedGreetings = [];
        this.selectNextGreeting();

        this.clearCollectedWords();
    }

    spawnFood() {
        let x, y;
        const maxX = Math.floor(this.canvas.width / this.gridSize);
        const maxY = Math.floor(this.canvas.height / this.gridSize);
        
        do {
            x = Math.floor(Math.random() * maxX);
            y = Math.floor(Math.random() * maxY);
        } while (this.snake.some(segment => segment.x === x && segment.y === y));

        this.food = {
            x: x,
            y: y,
            word: this.currentWords[this.currentWordIndex]
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
                const randomGreeting = this.greetingsData[Math.floor(Math.random() * this.greetingsData.length)];
                decoyWord = randomGreeting.words[Math.floor(Math.random() * randomGreeting.words.length)];
            } while (decoyWord === this.currentWords[this.currentWordIndex]);

            this.decoyFoods.push({
                x: dx,
                y: dy,
                word: decoyWord
            });
        }
    }

    updateWordDisplay() {
        // 移除目標顯示的更新
        // 如果之後需要在其他地方使用這個方法，可以保留但不更新 DOM
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    draw() {
        // 確保圖片已加載
        if (!this.imagesLoaded) return;

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

        // 只在食物沒有被吃掉時繪製食物
        if (this.food && !this.foodEaten) {
            this.ctx.fillStyle = '#ffd600';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.food.word,
                this.food.x * this.gridSize + this.gridSize/2,
                this.food.y * this.gridSize + this.gridSize/2 + 8
            );
        }

        // 繪製干擾食物
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

        const maxX = Math.floor(this.canvas.width / this.gridSize);
        const maxY = Math.floor(this.canvas.height / this.gridSize);

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

        if (head.x === this.food.x && head.y === this.food.y && !this.foodEaten) {
            this.foodEaten = true;
            
            if (this.food.word === this.currentWords[this.currentWordIndex]) {
                this.showCollectedWord(this.food.word, this.currentWordIndex);
                this.currentWordIndex++;
                
                if (this.currentWordIndex >= this.currentWords.length) {
                    this.score++;
                    this.completedGreetings.push(this.greetingsData[this.currentGreetingIndex].meaning);
                    
                    // �示完成動畫（會自動暫停遊戲）
                    this.showCompletionAnimation(this.currentWords);
                    
                    setTimeout(() => {
                        this.clearCollectedWords();
                    }, 3000);
                    
                    this.currentGreetingIndex = (this.currentGreetingIndex + 1) % this.greetingsData.length;
                    this.currentWordIndex = 0;
                    this.selectNextGreeting();
                }
                
                this.updateScore();
                this.updateWordDisplay();
            } else {
                // 收集錯誤，清空已收集的字
                this.clearCollectedWords();
                this.currentWordIndex = 0;
                this.updateWordDisplay();
            }
            
            setTimeout(() => {
                this.foodEaten = false;
                this.spawnFood();
            }, 200);
        } else if (this.decoyFoods.some(decoy => decoy.x === head.x && decoy.y === head.y)) {
            this.score = 0;
            this.currentWordIndex = 0;
            this.completedWords = [];
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
                // 添加 'P' 鍵作為測試彈出視窗的快捷鍵
                case 'p':
                case 'P':
                    if (!this.isGameOver) {
                        this.showCompletionAnimation(['龍', '馬', '精', '神']);
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
        if (this.completedGreetings.length > 0) {
            completedWordsList.textContent = this.completedGreetings.join('、');
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
        // 確保圖片已加載
        if (!this.imagesLoaded) return;

        const tileSize = this.gridSize;
        const numTilesX = Math.ceil(this.canvas.width / tileSize);
        const numTilesY = Math.ceil(this.canvas.height / tileSize);

        for (let y = 0; y < numTilesY; y++) {
            for (let x = 0; x < numTilesX; x++) {
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
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
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

    // 添加調整畫布大小的方法
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 重新計算網格大小以適應屏幕
        const minDimension = Math.min(this.canvas.width, this.canvas.height);
        this.gridSize = Math.floor(minDimension / 20);
        
        // 只在圖片加載完成後重繪
        if (this.imagesLoaded) {
            if (!this.isGameOver) {
                this.draw();
            } else {
                this.drawInitialScreen();
            }
        }
    }

    // 加載祝賀詞數據
    async loadWordsData() {
        try {
            const response = await fetch('words.json');
            const data = await response.json();
            this.greetingsData = data.greetings;
            this.selectNextGreeting();
        } catch (error) {
            console.error('加載祝賀詞數據失敗:', error);
            // 使用默認數據
            this.greetingsData = [{
                words: ['龍', '馬', '精', '神'],
                meaning: '龍馬精神'
            }];
            this.selectNextGreeting();
        }
    }

    // 選擇下一組祝賀詞
    selectNextGreeting() {
        const greeting = this.greetingsData[this.currentGreetingIndex];
        this.words = greeting.words;
        this.currentWords = [...greeting.words];
        this.currentWordIndex = 0;
        this.updateWordDisplay();
    }

    // 顯示收集到的字
    showCollectedWord(word, index) {
        const element = this.collectedWordsElements[index];
        element.textContent = word;
        element.classList.remove('bounce');
        // 觸發重排以重新開始動畫
        void element.offsetWidth;
        element.classList.add('bounce');
    }

    // 清空收集的字
    clearCollectedWords() {
        this.collectedWordsElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('bounce');
        });
    }

    // 顯示完成動畫
    showCompletionAnimation(words) {
        const popup = document.getElementById('completionPopup');
        const phrase = popup.querySelector('.completed-phrase');
        
        // 設置完成的詞組
        phrase.textContent = words.join('');
        
        // 顯示彈出視窗�暫停遊戲
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('show');
        this.pauseGame();

        // 添加點擊事件來關閉彈出視窗
        const closePopup = () => {
            popup.classList.remove('show');
            popup.classList.add('hidden');
            this.resumeGame();
            
            // 移除事件監聽器
            document.removeEventListener('click', closePopup);
        };

        // 添加點擊事件來關閉彈出視窗
        document.addEventListener('click', closePopup);
    }

    // 添加暫停遊�方法
    pauseGame() {
        if (!this.isGameOver && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.gameLoop);
            clearInterval(this.timer);
            this.pausedTimeRemaining = this.remainingTime;
        }
    }

    // 添加恢復遊戲方法
    resumeGame() {
        if (!this.isGameOver && this.isPaused) {
            this.isPaused = false;
            this.gameLoop = setInterval(() => {
                this.move();
                this.draw();
            }, 200);
            this.timer = setInterval(() => this.updateTimer(), 1000);
            this.remainingTime = this.pausedTimeRemaining;
        }
    }
}

window.onload = () => {
    new SnakeGame();
};