class Collider2D {
    static boxCollision(rect1, rect2) {
        return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y);
    }

    static circleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (circle1.radius + circle2.radius);
    }
}

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
                    // 使用 transform 來縮短 timer bar
                    timerBar.style.transform = `scaleX(${percentage / 100})`;
                    timerBar.style.transformOrigin = 'left';
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

        // 添加動畫相關屬性
        this.animationProgress = 0;
        this.lastPosition = null;
        this.moveSpeed = 0.15; // 控制移動速度，數值越小移動越慢
        
        // 修改遊戲循環的間隔時間，使動畫更流暢
        this.frameInterval = 1000/60; // 60fps 改為 30fps

        // 添加食物動畫相關屬性
        this.foodAnimationDistance = this.pixelSize * 3; // 感應距離
        this.foodAnimations = {
            correct: [],
            decoys: []
        };

        // 初始化食物相關屬性
        this.food = null;
        this.correctFoods = [];  // 初始化為空數組
        this.decoyFoods = [];    // 初始化為空數組

        // 初始化音樂
        this.initAudio();

        // 添加懲罰相關屬性
        this.isPenalized = false;
        this.isInvincible = false;
        this.penaltyDuration = 1000; // 1秒懲罰時間
        this.invincibleDuration = 2000; // 2秒無敵時間
        
        // 創建閃光效果元素
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.className = 'flash-overlay';
        document.body.appendChild(this.flashOverlay);
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

        // 初始化動畫狀態
        this.animationProgress = 0;
        this.lastPosition = [...this.snake];

        // 開始播放背景音樂
        if (!this.bgm.playing()) {
            this.bgm.play();
        }
    }

    spawnFood() {
        // 設定安全邊距，確保食物完全在視窗內
        const margin = this.pixelSize * 2;
        const headerHeight = 100; // 上方標題欄和計時器的高度
        
        // 計算可用區域
        const maxX = Math.min(this.canvas.width - margin - this.pixelSize, window.innerWidth - margin - this.pixelSize);
        const minX = margin;
        const maxY = Math.min(this.canvas.height - margin - this.pixelSize, window.innerHeight - margin - this.pixelSize);
        const minY = headerHeight + margin; // 確保不會生成在標題欄下方

        // 增加食物之間的最小間距
        const minFoodDistance = this.pixelSize * 4;

        // 計算可用的網格數量（考慮實際可視區域）
        const gridCols = Math.floor((maxX - minX) / this.pixelSize);
        const gridRows = Math.floor((maxY - minY) / this.pixelSize);
        const totalGrids = gridCols * gridRows;

        // 檢查是否有足夠的空間
        if (totalGrids < 10) { // 假設至少需要 10 個格子的空間
            console.warn('視窗空間不足');
            return;
        }

        // 創建一個用於追蹤已使用位置的數組
        const usedPositions = [];

        // 生成所有正確答案的食物
        this.correctFoods = [];
        const currentGreeting = this.greetingsData[this.currentGreetingIndex];
        
        // 初始化動畫狀態
        this.foodAnimations = {
            correct: [],
            decoys: []
        };

        // 為每個正確字生成食物
        for (const word of currentGreeting.words) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                // 使用網格系統來生成位置
                x = Math.floor(Math.random() * gridCols) * this.pixelSize + minX;
                y = Math.floor(Math.random() * gridRows) * this.pixelSize + minY;
                attempts++;
                
                if (attempts > maxAttempts) {
                    console.warn('無法找到合適的食物位置');
                    break;
                }
            } while (
                this.snake.some(segment => 
                    Math.hypot(segment.x - x, segment.y - y) < minFoodDistance
                ) ||
                usedPositions.some(pos => 
                    Math.hypot(pos.x - x, pos.y - y) < minFoodDistance
                )
            );

            const correctFood = {
                x: x,
                y: y,
                word: word,
                collected: false
            };
            
            this.correctFoods.push(correctFood);
            usedPositions.push({x: x, y: y});
            
            this.foodAnimations.correct.push({
                rotation: 0,
                isAnimating: false
            });
        }

        // 生成干擾食物
        this.decoyFoods = [];
        const wrongWords = [...currentGreeting.wrong_words];
        
        // 計算可以放置的最大干擾食物數量
        const maxFoods = Math.min(
            wrongWords.length,
            Math.floor((totalGrids - currentGreeting.words.length) / 4) // 每個食物需要 4 個格子的空間
        );
        
        // 生成干擾食物
        for (let i = 0; i < maxFoods; i++) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 100;

            do {
                x = Math.floor(Math.random() * gridCols) * this.pixelSize + minX;
                y = Math.floor(Math.random() * gridRows) * this.pixelSize + minY;
                attempts++;
                
                if (attempts > maxAttempts) {
                    console.warn('無法找到更多不重疊的位置');
                    return;
                }
            } while (
                this.snake.some(segment => 
                    Math.hypot(segment.x - x, segment.y - y) < minFoodDistance
                ) ||
                usedPositions.some(pos => 
                    Math.hypot(pos.x - x, pos.y - y) < minFoodDistance
                )
            );

            usedPositions.push({x: x, y: y});
            this.decoyFoods.push({
                x: x,
                y: y,
                word: wrongWords[i]
            });
        }

        // 為每個干擾食物添加動畫狀態
        this.foodAnimations.decoys = this.decoyFoods.map(() => ({
            rotation: 0,
            isAnimating: false
        }));
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
        // 清除畫布
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製蛇身
        if (this.lastPosition) {
            this.snake.forEach((segment, index) => {
                const lastPos = this.lastPosition[index];
                if (!lastPos) return;

                // 計算插值位置
                const x = lastPos.x + (segment.x - lastPos.x) * this.animationProgress;
                const y = lastPos.y + (segment.y - lastPos.y) * this.animationProgress;

                this.ctx.fillStyle = index === 0 ? '#ff0000' : '#ffdd00';
                this.ctx.fillRect(x, y, this.pixelSize, this.pixelSize);
            });
        }

        // 確保 correctFoods 存在才進行繪製
        if (this.correctFoods && this.correctFoods.length > 0) {
            this.correctFoods.forEach((food, index) => {
                if (!food.collected) {
                    this.drawFoodWithAnimation(
                        food,
                        this.foodAnimations.correct[index],
                        this.snake[0]
                    );
                }
            });
        }

        // 確保 decoyFoods 存在才進行繪製
        if (this.decoyFoods && this.decoyFoods.length > 0) {
            this.decoyFoods.forEach((decoy, index) => {
                this.drawFoodWithAnimation(
                    decoy,
                    this.foodAnimations.decoys[index],
                    this.snake[0]
                );
            });
        }
    }

    // 修改：帶動畫效果的食物繪製方法
    drawFoodWithAnimation(food, animation, snakeHead) {
        // 確保 animation 存在
        if (!animation) {
            animation = {
                rotation: 0,
                isAnimating: false
            };
        }

        // 檢查與蛇頭的距離
        const dx = snakeHead.x - food.x;
        const dy = snakeHead.y - food.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 更新動畫狀態
        if (distance < this.foodAnimationDistance) {
            animation.isAnimating = true;
            animation.rotation = Math.sin(Date.now() * 0.01) * 0.2;
        } else {
            animation.isAnimating = false;
            animation.rotation = 0;
        }

        // 繪製圓形背景
        this.ctx.save();
        this.ctx.translate(
            food.x + this.pixelSize/2,
            food.y + this.pixelSize/2
        );
        this.ctx.rotate(animation.rotation);
        
        // 繪製圓形
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.pixelSize * 0.75, 0, Math.PI * 2);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
        this.ctx.closePath();
        
        this.ctx.restore();

        // 繪製文字
        this.ctx.save();
        this.ctx.translate(
            food.x + this.pixelSize/2,
            food.y + this.pixelSize/2
        );
        this.ctx.rotate(animation.rotation);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '900 45px "Noto Sans TC"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(food.word, 0, 0);
        this.ctx.restore();
    }

    move() {
        // 在懲罰狀態下不移動
        if (this.isPenalized) return;

        this.animationProgress += this.moveSpeed;
        
        // 當動畫進度達到或超過1時，完成一次完整移動
        if (this.animationProgress >= 1) {
            this.completeMove();
            this.animationProgress = 0;
            this.lastPosition = JSON.parse(JSON.stringify(this.snake));
        }

        // 在每一幀都檢查碰撞
        const head = this.getInterpolatedHeadPosition();
        this.checkFoodCollision(head);
    }

    // 添加新方法：獲取插值後的蛇頭位置
    getInterpolatedHeadPosition() {
        const currentHead = this.snake[0];
        const nextHead = {...currentHead};

        switch(this.direction) {
            case 'up': nextHead.y -= this.pixelSize; break;
            case 'down': nextHead.y += this.pixelSize; break;
            case 'left': nextHead.x -= this.pixelSize; break;
            case 'right': nextHead.x += this.pixelSize; break;
        }

        // 處理邊界
        if (nextHead.x < 0) nextHead.x = this.canvas.width - this.pixelSize;
        else if (nextHead.x >= this.canvas.width) nextHead.x = 0;
        if (nextHead.y < 0) nextHead.y = this.canvas.height - this.pixelSize;
        else if (nextHead.y >= this.canvas.height) nextHead.y = 0;

        // 計算插值位置
        return {
            x: currentHead.x + (nextHead.x - currentHead.x) * this.animationProgress,
            y: currentHead.y + (nextHead.y - currentHead.y) * this.animationProgress
        };
    }

    // 修改檢查食物碰撞的方法
    checkFoodCollision(headPosition) {
        if (this.isPenalized) return;

        const head = {
            x: headPosition.x,
            y: headPosition.y,
            width: this.pixelSize,
            height: this.pixelSize
        };

        // 檢查正確食物碰撞
        this.correctFoods.forEach((food, index) => {
            if (food.collected) return;

            const foodRect = {
                x: food.x,
                y: food.y,
                width: this.pixelSize,
                height: this.pixelSize
            };

            if (Collider2D.boxCollision(head, foodRect)) {
                food.collected = true;
                this.showCollectedWord(food.word, this.currentWords.indexOf(food.word));
                this.score += 10;
                
                // 播放收集音效
                this.sounds.collect.play();

                // 檢查是否收集完所有正確字
                if (this.correctFoods.every(f => f.collected)) {
                    this.completedGreetings.push(this.currentWords.join(''));
                    this.showCompletionAnimation(this.currentWords);
                    
                    // 播放完成音效
                    this.sounds.complete.play();
                    
                    this.currentGreetingIndex++;
                    
                    // 增加蛇的長度
                    this.growSnake();
                    
                    if (this.currentGreetingIndex >= this.greetingsData.length) {
                        this.gameOver();
                        return;
                    }
                    
                    this.selectNextGreeting();
                    this.spawnFood();
                }
            }
        });

        // 檢查干擾食物碰撞
        if (this.decoyFoods && !this.isInvincible) { // 只在非無敵狀態下檢查干擾食物碰撞
            this.decoyFoods.forEach((decoy, index) => {
                const decoyRect = {
                    x: decoy.x,
                    y: decoy.y,
                    width: this.pixelSize,
                    height: this.pixelSize
                };

                if (Collider2D.boxCollision(head, decoyRect)) {
                    this.handleWrongCollection();
                }
            });
        }
    }

    // 新增：只生成正確答案的食物位置
    spawnCorrectFood() {
        const margin = this.pixelSize * 2;
        const maxX = this.canvas.width - margin;
        const minX = margin;
        const maxY = this.canvas.height - margin;
        const minY = margin + 80;
        
        const minFoodDistance = this.pixelSize * 4;
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;

        // 收集所有需要避開的位置（包括干擾食物）
        const usedPositions = this.decoyFoods.map(food => ({x: food.x, y: food.y}));

        do {
            x = Math.floor(Math.random() * ((maxX - minX) / this.pixelSize)) * this.pixelSize + minX;
            y = Math.floor(Math.random() * ((maxY - minY) / this.pixelSize)) * this.pixelSize + minY;
            attempts++;
            
            if (attempts > maxAttempts) {
                console.warn('無法找到合適的食物位置');
                break;
            }
        } while (
            this.snake.some(segment => 
                Math.hypot(segment.x - x, segment.y - y) < minFoodDistance
            ) ||
            usedPositions.some(pos => 
                Math.hypot(pos.x - x, pos.y - y) < minFoodDistance
            )
        );

        // 只更新正確答案的位置
        this.food = {
            x: x,
            y: y,
            word: this.currentWords[this.currentWordIndex]
        };

        // 更新主要食物的動畫狀態
        this.foodAnimations.main = { rotation: 0, isAnimating: false };
    }

    // 修改蛇身碰撞檢測
    checkCollision(head) {
        const headArea = {
            x: head.x,
            y: head.y,
            width: this.pixelSize,
            height: this.pixelSize
        };

        return this.snake.some(segment => {
            const segmentArea = {
                x: segment.x,
                y: segment.y,
                width: this.pixelSize,
                height: this.pixelSize
            };
            return Collider2D.boxCollision(headArea, segmentArea);
        });
    }

    // 添加新方法：處理食物碰撞
    handleFoodCollision() {
        if (this.foodEaten) return;
        
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
        } else {
            this.clearCollectedWords();
            this.currentWordIndex = 0;
            this.updateWordDisplay();
        }
        
        setTimeout(() => {
            this.foodEaten = false;
            this.spawnFood();
        }, 200);
    }

    // 添加新方法：處理干擾食物碰撞
    handleDecoyCollision() {
        this.score = 0;
        this.currentWordIndex = 0;
        this.clearCollectedWords();
        this.updateWordDisplay();
        this.spawnFood();
    }

    // 修改 completeMove 方法
    completeMove() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y -= this.pixelSize; break;
            case 'down': head.y += this.pixelSize; break;
            case 'left': head.x -= this.pixelSize; break;
            case 'right': head.x += this.pixelSize; break;
        }

        // 處理邊界
        if (head.x < 0) head.x = this.canvas.width - this.pixelSize;
        else if (head.x >= this.canvas.width) head.x = 0;
        if (head.y < 0) head.y = this.canvas.height - this.pixelSize;
        else if (head.y >= this.canvas.height) head.y = 0;

        // 當撞到自己時調用 gameOver
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);
        this.snake.pop();
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.timer);
        
        // 總是顯示遊戲結果
        this.showGameResult();

        // 遊戲結束時顯示開始按鈕
        const startButton = document.getElementById('startButton');
        startButton.style.display = 'block';
        startButton.textContent = '開始遊戲';
        this.drawInitialScreen();

        // 停止背景音樂
        this.bgm.stop();
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
            }, this.frameInterval); // 使用新的幀間隔
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
                // 使用 transform 來縮短 timer bar
                timerBar.style.transform = `scaleX(${percentage / 100})`;
                timerBar.style.transformOrigin = 'left';
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
        this.gameOver();
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
            }, this.frameInterval);  // 這裡也使用 frameInterval
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
        const collectedWords = document.querySelector('.collected-words');
        collectedWords.classList.add('changing');
        
        // 先更新當前詞組
        const greeting = this.greetingsData[this.currentGreetingIndex];
        this.words = greeting.words;
        this.currentWords = [...greeting.words];
        this.currentWordIndex = 0;
        
        // 等待動畫完成後更新顯示
        setTimeout(() => {
            // 清空所有已收集的字
            this.collectedWordsElements.forEach(element => {
                const span = element.querySelector('span');
                if (span) {
                    span.textContent = '';
                }
                element.classList.remove('active', 'bounce');
            });

            // 更新提示文字
            this.collectedWordsElements.forEach((element, index) => {
                const oldHint = element.querySelector('.hint');
                if (oldHint) {
                    oldHint.remove();
                }
                
                const hint = document.createElement('div');
                hint.className = 'hint';
                hint.textContent = this.currentWords[index];
                element.appendChild(hint);
                element.classList.remove('active');
            });

            // 重新生成食物
            this.spawnFood();

            // 恢復位置並顯示新內容
            collectedWords.classList.remove('changing');
        }, 500);
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
        
        // 顯示彈出視窗但不暫停遊戲
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('show');

        // 1秒後自動關閉彈出視窗
        setTimeout(() => {
            popup.classList.remove('show');
            popup.classList.add('hidden');
        }, 1000);
    }

    // 添加暫停遊戲方法
    pauseGame() {
        if (!this.isGameOver && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.gameLoop);
            clearInterval(this.timer);
            this.pausedTimeRemaining = this.remainingTime;

            // 暫停背景音樂
            this.bgm.pause();
        }
    }

    // 修改恢復遊戲方法
    resumeGame() {
        if (!this.isGameOver && this.isPaused) {
            this.isPaused = false;
            this.gameLoop = setInterval(() => {
                this.move();
                this.draw();
            }, this.frameInterval);  // 使用 frameInterval 而不是固定值
            this.timer = setInterval(() => this.updateTimer(), 1000);
            this.remainingTime = this.pausedTimeRemaining;

            // 恢復背景音樂
            this.bgm.play();
        }
    }

    initAudio() {
        // 音效管理器
        this.sounds = {
            bgm: new Howl({
                src: ['snd/theme-song.mp3'],
                loop: true,
                volume: 0.5,
                autoplay: false
            }),
            collect: new Howl({
                src: ['snd/drip.mp3'],
                volume: 0.8,
                autoplay: false
            }),
            complete: new Howl({  // 添加完成音效
                src: ['snd/beep.mp3'],
                volume: 0.8,
                autoplay: false
            })
        };

        // 為了保持兼容性，保留 bgm 引用
        this.bgm = this.sounds.bgm;

        // 添加音樂控制按鈕
        this.createMusicControls();
    }

    // 修改音樂控制方法
    createMusicControls() {
        const musicBtn = document.createElement('button');
        musicBtn.className = 'music-control';
        musicBtn.innerHTML = '🔊';
        musicBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            z-index: 1000;
            font-size: 20px;
        `;

        let isMuted = false;
        musicBtn.onclick = () => {
            if (isMuted) {
                // 恢復所有音效
                Object.values(this.sounds).forEach(sound => {
                    sound.volume(sound === this.sounds.bgm ? 0.5 : 0.8);
                });
                musicBtn.innerHTML = '🔊';
            } else {
                // 靜音所有音效
                Object.values(this.sounds).forEach(sound => {
                    sound.volume(0);
                });
                musicBtn.innerHTML = '🔈';
            }
            isMuted = !isMuted;
        };

        document.body.appendChild(musicBtn);
    }

    // 新增：處理錯誤收集
    handleWrongCollection() {
        if (this.isInvincible) return;

        // 設置懲罰和無敵狀態
        this.isPenalized = true;
        this.isInvincible = true;
        
        // 觸發閃光效果
        this.flashOverlay.classList.add('active');
        
        // 1秒後恢復移動
        setTimeout(() => {
            this.isPenalized = false;
            this.flashOverlay.classList.remove('active');
        }, this.penaltyDuration);

        // 2秒後恢復可被傷害狀態
        setTimeout(() => {
            this.isInvincible = false;
        }, this.invincibleDuration);
    }

    // 新增：增加蛇的長度的方法
    growSnake() {
        // 獲取蛇尾的最後兩個段落
        const lastSegment = this.snake[this.snake.length - 1];
        const secondLastSegment = this.snake[this.snake.length - 2];

        // 計算新段落的位置（在最後兩個段落的延長線上）
        const newSegment = {
            x: lastSegment.x + (lastSegment.x - secondLastSegment.x),
            y: lastSegment.y + (lastSegment.y - secondLastSegment.y)
        };

        // 如果新段落超出邊界，進行調整
        if (newSegment.x < 0) newSegment.x = this.canvas.width - this.pixelSize;
        if (newSegment.x >= this.canvas.width) newSegment.x = 0;
        if (newSegment.y < 0) newSegment.y = this.canvas.height - this.pixelSize;
        if (newSegment.y >= this.canvas.height) newSegment.y = 0;

        // 添加新段落到蛇身
        this.snake.push(newSegment);
        
        // 更新 lastPosition 數組以包含新段落
        if (this.lastPosition) {
            this.lastPosition.push({...newSegment});
        }
    }
}

window.onload = () => {
    new SnakeGame();
};