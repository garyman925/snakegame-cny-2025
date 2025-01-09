class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.pixelSize = 50; // 蛇身和食物的大小
        
        // 初始化蛇的起始位置
        this.snake = [
            {x: 100, y: 50},
            {x: 50, y: 50},
            {x: 0, y: 50}
        ];
        
        // 移除圖片相關的初始化
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupEventListeners();
        this.updateWordDisplay();
        this.drawInitialScreen();

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

        // 在初始化時添加這些變量
        let timerBar;
        let timerText;

        // 在遊戲開始時添加
        function initGame() {
            // ... 現有的初始化代碼 ...
            timerBar = document.querySelector('.timer-bar');
            timerText = document.querySelector('.timer-text');
        }

        // 修改更新時間的函數
        function updateTimer() {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                // 更新新的計時器顯示
                const timerText = document.querySelector('.timer-text');
                const timerBar = document.querySelector('.timer-bar');
                
                if (timerText && timerBar) {
                    timerText.textContent = this.remainingTime;
                    const percentage = (this.remainingTime / this.gameTime) * 100;
                    timerBar.style.width = `${percentage}%`;
                }

                // 當時間少於 10 秒時添加警告效果
                if (this.remainingTime <= 10) {
                    timerText.classList.add('warning');
                    timerBar.classList.add('warning');
                }

                if (this.remainingTime <= 0) {
                    this.timeUp();
                }
            }
        }
    }

    drawInitialScreen() {
        // 繪製純色背景
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製文字
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
    }

    initializeGame() {
        // 初始化蛇的位置（使用像素）
        this.snake = [
            {x: 100, y: 50},
            {x: 50, y: 50},
            {x: 0, y: 50}
        ];
        this.direction = 'right';
        this.score = 0;
        this.currentWordIndex = 0;
        this.isGameOver = false;
        this.spawnFood();
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

        // 隱藏開始按鈕
        document.getElementById('startButton').style.display = 'none';
    }

    spawnFood() {
        // 設定安全邊距，避免文字被遮蔽
        const margin = this.pixelSize * 2;
        const maxX = this.canvas.width - margin;
        const minX = margin;
        const maxY = this.canvas.height - margin;
        const minY = margin + 80; // 上方多留空間給計時器和收集字詞
        
        // 創建一個用於追蹤已使用位置的數組
        const usedPositions = [];
        
        // 生成正確答案的位置
        let x, y;
        do {
            x = Math.floor(Math.random() * ((maxX - minX) / this.pixelSize)) * this.pixelSize + minX;
            y = Math.floor(Math.random() * ((maxY - minY) / this.pixelSize)) * this.pixelSize + minY;
        } while (
            this.snake.some(segment => segment.x === x && segment.y === y) ||
            this.isPositionOverlapping(x, y, usedPositions)
        );

        this.food = {
            x: x,
            y: y,
            word: this.currentWords[this.currentWordIndex]
        };
        
        // 記錄已使用的位置
        usedPositions.push({x: this.food.x, y: this.food.y});

        // 生成干擾食物
        this.decoyFoods = [];
        const currentGreeting = this.greetingsData[this.currentGreetingIndex];
        const wrongWords = [...currentGreeting.wrong_words];
        
        // 打亂 wrong_words 數組
        for (let i = wrongWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wrongWords[i], wrongWords[j]] = [wrongWords[j], wrongWords[i]];
        }

        // 計算可用的網格數量
        const gridCols = Math.floor((maxX - minX) / this.pixelSize);
        const gridRows = Math.floor((maxY - minY) / this.pixelSize);
        const totalGrids = gridCols * gridRows;
        
        // 確保有足夠的空間放置所有食物
        const maxFoods = Math.min(wrongWords.length, totalGrids - this.snake.length - 1);
        
        // 生成所有干擾食物，確保位置不重疊
        for (let i = 0; i < maxFoods; i++) {
            let dx, dy;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                dx = Math.floor(Math.random() * gridCols) * this.pixelSize + minX;
                dy = Math.floor(Math.random() * gridRows) * this.pixelSize + minY;
                attempts++;
                
                if (attempts > maxAttempts) {
                    console.warn('無法找到更多不重疊的位置');
                    return;
                }
            } while (
                this.snake.some(segment => segment.x === dx && segment.y === dy) ||
                this.isPositionOverlapping(dx, dy, usedPositions)
            );

            usedPositions.push({x: dx, y: dy});
            this.decoyFoods.push({
                x: dx,
                y: dy,
                word: wrongWords[i]
            });
        }
    }

    // 添加檢查位置是否重疊的方法
    isPositionOverlapping(x, y, positions) {
        const safeDistance = this.pixelSize * 2; // 設定安全距離
        return positions.some(pos => 
            Math.abs(pos.x - x) < safeDistance && 
            Math.abs(pos.y - y) < safeDistance
        );
    }

    updateWordDisplay() {
        // 移除目標顯示的更新
        // 如果之後需要在其他地方使用這個方法，可以保留但不更新 DOM
    }

    updateScore() {
        // 由於我們已經移除了分數顯示，這個方法可以暫時保持空白
        // 或者完全移除這個方法的調用
    }

    draw() {
        // 繪製純色背景
        this.ctx.fillStyle = '#ebfcff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製蛇
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#ff0000' : '#ffdd00';
            this.ctx.fillRect(
                segment.x,
                segment.y,
                this.pixelSize,
                this.pixelSize
            );
        });

        // 繪製食物和文字
        if (this.food && !this.foodEaten) {
            // 繪製菱形背景
            this.ctx.save();
            this.ctx.translate(
                this.food.x + this.pixelSize/2,
                this.food.y + this.pixelSize/2
            );
            this.ctx.rotate(Math.PI / 4);
            this.ctx.fillStyle = 'red';
            const size = this.pixelSize * 1.5;
            this.ctx.fillRect(-size/2, -size/2, size, size);
            this.ctx.restore();

            // 繪製文字
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '900 45px "Noto Sans TC"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.food.word,
                this.food.x + this.pixelSize/2,
                this.food.y + this.pixelSize/2 + 8
            );
        }

        // 繪製干擾食物
        if (this.decoyFoods) {  // 添加檢查
            this.decoyFoods.forEach(decoy => {
                // 繪製菱形背景
                this.ctx.save();
                this.ctx.translate(
                    decoy.x + this.pixelSize/2,
                    decoy.y + this.pixelSize/2
                );
                this.ctx.rotate(Math.PI / 4);
                this.ctx.fillStyle = 'red';
                const size = this.pixelSize * 1.5;
                this.ctx.fillRect(-size/2, -size/2, size, size);
                this.ctx.restore();

                // 繪製文字
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '900 45px "Noto Sans TC"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    decoy.word,
                    decoy.x + this.pixelSize/2,
                    decoy.y + this.pixelSize/2 + 8
                );
            });
        }
    }

    move() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y -= this.pixelSize; break;
            case 'down': head.y += this.pixelSize; break;
            case 'left': head.x -= this.pixelSize; break;
            case 'right': head.x += this.pixelSize; break;
        }

        // 處理邊界
        if (head.x < 0) {
            head.x = this.canvas.width - this.pixelSize;
        } else if (head.x >= this.canvas.width) {
            head.x = 0;
        }

        if (head.y < 0) {
            head.y = this.canvas.height - this.pixelSize;
        } else if (head.y >= this.canvas.height) {
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
                    
                    this.showCompletionAnimation(this.currentWords);
                    
                    setTimeout(() => {
                        this.clearCollectedWords();
                    }, 3000);
                    
                    this.currentGreetingIndex = (this.currentGreetingIndex + 1) % this.greetingsData.length;
                    this.currentWordIndex = 0;
                    this.selectNextGreeting();
                }
                
                this.updateWordDisplay();
            } else {
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
        // 遊戲結束時顯示開始按鈕
        const startButton = document.getElementById('startButton');
        startButton.style.display = 'block';
        startButton.textContent = '開始遊戲';
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
        if (this.remainingTime > 0) {
            this.remainingTime--;
            // 更新新的計時器顯示
            const timerText = document.querySelector('.timer-text');
            const timerBar = document.querySelector('.timer-bar');
            
            if (timerText && timerBar) {
                timerText.textContent = this.remainingTime;
                const percentage = (this.remainingTime / this.gameTime) * 100;
                timerBar.style.width = `${percentage}%`;
            }

            // 當時間少於 10 秒時添加警告效果
            if (this.remainingTime <= 10) {
                timerText.classList.add('warning');
                timerBar.classList.add('warning');
            }

            if (this.remainingTime <= 0) {
                this.timeUp();
            }
        }
    }

    // 時間到方法
    timeUp() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.timer);
        
        this.showGameResult();
        // 時間到時顯示開始按鈕
        const startButton = document.getElementById('startButton');
        startButton.style.display = 'block';
        startButton.textContent = '開始遊戲';
        this.drawInitialScreen();
    }

    // 添加顯示結果的方法
    showGameResult() {
        document.getElementById('finalScore').textContent = this.score;
        
        const tbody = document.getElementById('completedWordsList');
        tbody.innerHTML = ''; // 清空現有內容
        
        if (this.completedGreetings.length > 0) {
            this.completedGreetings.forEach(greeting => {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.textContent = greeting;
                tr.appendChild(td);
                tbody.appendChild(tr);
            });
        } else {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.textContent = '未能完成任何祝賀詞';
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        
        this.resultElement.classList.remove('hidden');

        // 添加重新開始按鈕的事件監聽
        const restartButton = this.resultElement.querySelector('.restart-button');
        restartButton.onclick = () => {
            this.resultElement.classList.add('hidden');
            this.initializeGame();
            this.gameLoop = setInterval(() => {
                this.move();
                this.draw();
            }, 200);
        };
    }

    // 隱藏結果
    hideGameResult() {
        this.resultElement.classList.add('hidden');
    }

    // 修改 resizeCanvas 方法
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (!this.isGameOver) {
            this.draw();
        } else {
            this.drawInitialScreen();
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
        
        // 更新提示文字
        this.collectedWordsElements.forEach((element, index) => {
            // 移除之前的提示元素（如果存在）
            const oldHint = element.querySelector('.hint');
            if (oldHint) {
                oldHint.remove();
            }
            
            // 創建新的提示元素
            const hint = document.createElement('div');
            hint.className = 'hint';
            hint.textContent = this.currentWords[index];  // 直接顯示目標字
            element.appendChild(hint);
            
            // 重置狀態
            element.classList.remove('active');
        });
    }

    // 顯示收集到的字
    showCollectedWord(word, index) {
        const element = this.collectedWordsElements[index];
        const span = element.querySelector('span');
        span.textContent = word;
        element.classList.remove('bounce');
        element.classList.add('active');  // 添加活躍狀態
        // 觸發重排以重新開始動畫
        void element.offsetWidth;
        element.classList.add('bounce');
    }

    // 清空收集的字
    clearCollectedWords() {
        this.collectedWordsElements.forEach(element => {
            const span = element.querySelector('span');
            span.textContent = '';
            element.classList.remove('bounce');
            element.classList.remove('active');  // 移除活躍狀態
        });
    }

    // 顯示完成動畫
    showCompletionAnimation(words) {
        const popup = document.getElementById('completionPopup');
        const phrase = popup.querySelector('.completed-phrase');
        
        // 設置完成的詞組
        phrase.textContent = words.join('');
        
        // 顯示彈出視窗暫停遊戲
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

    // 添加暫停遊戲方法
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