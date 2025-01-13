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
        // 首先初始化基本屬性
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化道具系統相關屬性（移到最前面）
        this.powerUps = [];  // 初始化道具陣列
        this.powerUpImages = {};  // 初始化道具圖片容器
        this.activePowerUps = new Map();  // 初始化活動道具
        this.powerUpSpawnInterval = 10000; // 每10秒生成一個道具
        this.lastPowerUpSpawn = 0;
        this.isTimeFrozen = false;
        this.frozenTimeRemaining = 0;
        this.speedMultiplier = 1;
        this.isInvincible = false;

        // 定義道具類型
        this.powerUpTypes = {
            SPEED: {
                name: '加速',
                color: '#ffff00',
                duration: 5000,
                image: 'img/tool-flash.png',
                effect: () => {
                    this.speedMultiplier = 1.5;
                    this.sounds.powerup.play();
                },
                reset: () => {
                    this.speedMultiplier = 1;
                }
            },
            INVINCIBLE: {
                name: '無敵',
                color: '#ff00ff',
                duration: 3000,
                image: 'img/tool-star.png',
                effect: () => {
                    this.isInvincible = true;
                    this.sounds.powerup.play();
                },
                reset: () => {
                    this.isInvincible = false;
                }
            },
            TIME_FREEZE: {
                name: '時間暫停',
                color: '#00ffff',
                duration: 3000,
                image: 'img/tool-timer.png',
                effect: () => {
                    this.isTimeFrozen = true;
                    this.sounds.powerup.play();
                    this.frozenTimeRemaining = this.endTime - Date.now();
                },
                reset: () => {
                    this.isTimeFrozen = false;
                    this.endTime = Date.now() + this.frozenTimeRemaining;
                }
            }
        };

        // 加載道具圖片
        Object.entries(this.powerUpTypes).forEach(([type, config]) => {
            const img = new Image();
            img.src = config.image;
            this.powerUpImages[type] = img;
        });
        
        // 檢測是否為移動設備
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // 設置畫布大小
        this.setupCanvasSize();
        
        // 根據設備類型設置大小
        this.pixelSize = this.isMobile ? 30 : 50; // 移動設備縮小到 30px
        
        // 初始化蛇的起始位置（根據新的 pixelSize）
        this.snake = [
            {x: this.pixelSize * 2, y: this.pixelSize},
            {x: this.pixelSize, y: this.pixelSize},
            {x: 0, y: this.pixelSize}
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

        // 修改計時相關的屬性
        this.gameDuration = 120; // 遊戲時長（秒）
        this.endTime = 0; // 遊戲結束時間點
        this.remainingTime = this.gameDuration;
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
        // 當前可用的錯誤詞組
        this.wrongWords = [];

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
            const timeLeft = Math.max(0, this.endTime - Date.now());
            const totalTime = this.gameDuration * 1000;
            const percentage = timeLeft / totalTime;

            // 更新時間文字
            const seconds = Math.ceil(timeLeft / 1000);
            const timerText = document.querySelector('.timer-text');
            timerText.textContent = seconds;

            // 更新計時條
            const timerBar = document.querySelector('.timer-bar');
            timerBar.style.transform = `scaleY(${percentage})`; // 使用 scaleY 來從下往上減少

            // 當時間少於 30 秒時添加警告效果
            if (seconds <= 30) {
                timerBar.classList.add('warning');
                timerText.classList.add('warning');
            } else {
                timerBar.classList.remove('warning');
                timerText.classList.remove('warning');
            }

            return timeLeft;
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
        this.penaltyDuration = 1000; // 1秒懲罰時間
        this.invincibleDuration = 2000; // 2秒無敵時間
        
        // 創建閃光效果元素
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.className = 'flash-overlay';
        document.body.appendChild(this.flashOverlay);

        // 加載背景圖案
        this.backgroundPattern = new Image();
        this.backgroundPattern.src = 'img/flower.png';
        this.backgroundPattern.onload = () => {
            // 創建半透明的圖案
            const patternCanvas = document.createElement('canvas');
            const patternContext = patternCanvas.getContext('2d');
            patternCanvas.width = this.backgroundPattern.width;
            patternCanvas.height = this.backgroundPattern.height;
            
            // 繪製原圖並設置透明度
            patternContext.globalAlpha = 0.02 // 設置透明度
            patternContext.drawImage(this.backgroundPattern, 0, 0);
            
            // 創建圖案
            this.pattern = this.ctx.createPattern(patternCanvas, 'repeat');
            
            // 重新繪製畫面
            if (!this.isGameOver) {
                this.draw();
            } else {
                this.drawInitialScreen();
            }
        };

        // 初始化時隱藏遊戲界面元素
        document.querySelector('.game-container').classList.remove('game-started');

        // 加載蛇頭、蛇身和蛇尾圖片
        this.snakeHead = new Image();
        this.snakeHead.src = 'img/head.png';
        this.snakeBody = new Image();
        this.snakeBody.src = 'img/body.png';
        this.snakeTail = new Image();
        this.snakeTail.src = 'img/tail.png';

        // 等待所有圖片都加載完成
        Promise.all([
            new Promise(resolve => this.snakeHead.onload = resolve),
            new Promise(resolve => this.snakeBody.onload = resolve),
            new Promise(resolve => this.snakeTail.onload = resolve)
        ]).then(() => {
            if (!this.isGameOver) {
                this.draw();
            } else {
                this.drawInitialScreen();
            }
        });

        // 添加觸控事件監聽
        this.setupTouchControls();

        // 計分系統相關
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastCollectTime = 0;
        this.comboTimeWindow = 2000; // 2秒內收集可以保持連擊
        this.scoreConfig = {
            base: 1,               // 每個字的基礎分數
            completion: 10,        // 完成整組的獎勵
            comboMultiplier: 0.5,  // 連擊加成倍率
            orderMultiplier: 0.3,  // 順序加成倍率
            speedIncrease: 0.01,   // 每次收集增加的速度
            timeBonus: {           // 時間獎勵設置
                threshold: 30,     // 剩餘30秒以上
                points: 1000      // 獎勵1000分
            }
        };

        // 統計數據
        this.stats = {
            totalCollected: 0,    // 總收集數
            perfectCollects: 0,   // 完美收集次數
            maxCombo: 0,         // 最高連擊數
            timeBonus: false     // 是否獲得時間獎勵
        };

        // 視覺效果相關
        this.glowEffect = false;
        this.glowDuration = 500; // 發光持續時間（毫秒）
        this.glowStartTime = 0;

        // 添加難度相關設置
        this.difficulties = {
            EASY: {
                name: '簡單',
                moveSpeed: 0.1,
                powerUpFrequency: 15000,  // 15秒一個道具
                scoreMultiplier: 1
            },
            NORMAL: {
                name: '普通',
                moveSpeed: 0.15,
                powerUpFrequency: 10000,  // 10秒一個道具
                scoreMultiplier: 1.5
            },
            HARD: {
                name: '困難',
                moveSpeed: 0.2,
                powerUpFrequency: 8000,   // 8秒一個道具
                scoreMultiplier: 2
            }
        };

        this.currentDifficulty = 'NORMAL'; // 默認難度

        // 初始化分數顯示
        this.scoreDisplay = document.querySelector('.current-score');

        // 添加表情符號圖片
        this.emojis = {
            correct: new Image(),
            wrong: new Image(),
            speed: new Image(),
            star: new Image()
        };

        this.emojis.correct.src = 'img/emo-heart.png';
        this.emojis.wrong.src = 'img/emo-sad.png';
        this.emojis.speed.src = 'img/emo-smart.png';
        this.emojis.star.src = 'img/emo-star.png';

        // 添加 combo 音效
        this.sounds.combo = new Howl({
            src: ['snd/combo.mp3'],
            rate: 1.0  // 初始音調
        });

        // 在音效初始化部分添加轉向音效
        this.sounds = {
            bgm: new Howl({
                src: ['snd/theme-song.mp3'],
                loop: true,
                volume: 0.5,
                rate: 1.0,  // 添加初始速率
                autoplay: false
            }),
            collect: new Howl({
                src: ['snd/drip.mp3'],
                volume: 0.8
            }),
            complete: new Howl({
                src: ['snd/beep.mp3'],
                volume: 0.8
            }),
            powerup: new Howl({
                src: ['snd/speed-up.mp3'],
                volume: 0.8
            }),
            combo: new Howl({
                src: ['snd/combo.mp3'],
                volume: 0.8,
                rate: 1.0
            }),
            turn: new Howl({
                src: ['snd/turn.mp3'],
                volume: 0.5
            }),
            crash: new Howl({ 
                src: ['snd/crash.mp3'] 
            })
        };

        // 為了保持兼容性，保留 bgm 引用
        this.bgm = this.sounds.bgm;

        // 添加音樂控制按鈕
        this.createMusicControls();

        // 添加 debug 相關屬性
        this.isDebugging = false;
        this.debugInfo = {
            fps: 0,
            snakePosition: '',
            direction: '',
            combo: 0,
            score: 0
        };

        // 添加下一頁按鈕事件監聽
        document.querySelector('.next-page-button').addEventListener('click', () => {
            this.toggleResultPage();
        });
    }

    drawInitialScreen() {
        // 繪製背景
        this.drawBackground();
        
        // 繪製文字
        this.ctx.fillStyle = '#ffe9dc';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
    }

    initializeGame() {
        // 顯示遊戲界面元素
        document.querySelector('.game-container').classList.add('game-started');

        // 重置蛇的位置
        this.snake = [
            {x: 100, y: 50},
            {x: 50, y: 50},
            {x: 0, y: 50}
        ];
        this.direction = 'right';
        this.score = 0;
        this.currentWordIndex = 0;
        this.isGameOver = false;

        // 重新創建背景圖案
        if (this.backgroundPattern.complete) {
            const patternCanvas = document.createElement('canvas');
            const patternContext = patternCanvas.getContext('2d');
            patternCanvas.width = this.backgroundPattern.width;
            patternCanvas.height = this.backgroundPattern.height;
            
            patternContext.globalAlpha = 0.02;
            patternContext.drawImage(this.backgroundPattern, 0, 0);
            
            this.pattern = this.ctx.createPattern(patternCanvas, 'repeat');
        }

        // 重置遊戲狀態
        this.remainingTime = this.gameDuration;
        this.completedWords = [];
        this.currentGreetingIndex = 0;
        this.completedGreetings = [];
        
        // 設置遊戲結束時間
        this.endTime = Date.now() + (this.gameDuration * 1000);
        
        // 開始計時
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            const timeLeft = this.updateTimer();
            if (timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);

        // 隱藏結果顯示
        this.hideGameResult();
        
        // 清空並準備新的詞組
        this.clearCollectedWords();
        this.selectNextGreeting(true); // 添加參數表示是初始化調用

        // 隱藏開始按鈕
        document.getElementById('startButton').style.display = 'none';

        // 初始化動畫狀態
        this.animationProgress = 0;
        this.lastPosition = [...this.snake];

        // 開始播放背景音樂
        if (!this.bgm.playing()) {
            this.bgm.play();
        }

        // 根據難度設置遊戲參數
        const difficulty = this.difficulties[this.currentDifficulty];
        this.moveSpeed = difficulty.moveSpeed;
        this.powerUpSpawnInterval = difficulty.powerUpFrequency;
        this.scoreMultiplier = difficulty.scoreMultiplier;
    }

    // 修改 selectNextGreeting 方法
    selectNextGreeting(isInitial = false) {
        const collectedWords = document.querySelector('.collected-words');
        collectedWords.classList.add('changing');
        
        // 更新當前詞組和錯誤詞組
        const greeting = this.greetingsData[this.currentGreetingIndex];
        this.words = greeting.words;
        this.currentWords = [...greeting.words];
        this.wrongWords = greeting.wrong_words || [];
        this.currentWordIndex = 0;
        
        // 重新設置畫布大小
        this.setupCanvasSize();
        
        // 等待一小段時間確保畫布尺寸已更新
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

            // 生成新食物
            if (!isInitial) {
                // 確保在生成食物前重新計算尺寸
                this.setupCanvasSize();
                this.spawnFood();
            }

            collectedWords.classList.remove('changing');
        }, 500);

        if (isInitial) {
            this.setupCanvasSize();
            this.spawnFood();
        }
    }

    spawnFood() {
        // 清除現有的食物
        this.correctFoods = [];
        this.decoyFoods = [];
        this.foodAnimations = {
            correct: [],
            decoys: []
        };

        // 重新設置畫布大小以確保尺寸正確
        this.setupCanvasSize();

        // 設置安全邊距，根據螢幕大小調整
        const margin = this.isMobile ? this.pixelSize : this.pixelSize * 2; // 減少移動設備的邊距
        const bottomMargin = this.isMobile ? 
            (window.innerHeight <= 667 ? 180 : 150) : margin; // 稍微減少底部邊距
        const minFoodDistance = this.isMobile ? 
            this.pixelSize * 2.5 : // 減少移動設備上食物之間的最小距離
            this.pixelSize * 4;    // 桌面版保持原來的距離
        
        // 獲取 game-header 的實際高度
        const header = document.querySelector('.game-header');
        const headerHeight = header.getBoundingClientRect().height + 20;

        // 計算可用區域（確保使用最新的畫布尺寸）
        const availableWidth = this.canvas.width - margin * 2;
        const availableHeight = this.canvas.height - headerHeight - bottomMargin - margin;
        const startY = headerHeight + margin;

        // 針對小螢幕設備的額外安全檢查
        const isSmallScreen = window.innerHeight <= 667;
        const safeHeight = isSmallScreen ? 
            this.canvas.height - 180 : // 減少安全高度限制
            this.canvas.height - bottomMargin;

        // 檢查並輸出計算的區域
        console.log('Available area:', {
            width: availableWidth,
            height: availableHeight,
            startY: startY,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height
        });

        // 用於存儲所有已放置的食物位置
        const placedFoods = [];

        // 為每個正確字生成食物
        for (const word of this.currentWords) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            const maxAttempts = 100;

            while (!validPosition && attempts < maxAttempts) {
                x = Math.floor(Math.random() * availableWidth + margin);
                y = Math.floor(Math.random() * availableHeight + startY);
                
                // 確保 y 不會太接近底部，針對小螢幕特別處理
                if (y > safeHeight) {
                    continue;
                }

                validPosition = true;
                attempts++;

                // 檢查與已放置食物的距離
                for (const food of placedFoods) {
                    const distance = Math.sqrt(
                        Math.pow(x - food.x, 2) + 
                        Math.pow(y - food.y, 2)
                    );
                    if (distance < minFoodDistance) {
                        validPosition = false;
                        break;
                    }
                }

                // 檢查與蛇的距離
                for (const segment of this.snake) {
                    const distance = Math.sqrt(
                        Math.pow(x - segment.x, 2) + 
                        Math.pow(y - segment.y, 2)
                    );
                    if (distance < minFoodDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }

            if (validPosition) {
                const food = {
                    x: x,
                    y: y,
                    word: word,
                    collected: false,
                    size: this.isMobile ? this.pixelSize * 0.8 : this.pixelSize
                };
                this.correctFoods.push(food);
                placedFoods.push(food);
            }
        }

        // 生成誘餌食物
        for (let i = 0; i < this.numberOfDecoys; i++) {
            let x, y;
            let validPosition = false;
            let attempts = 0;
            const maxAttempts = 100;

            while (!validPosition && attempts < maxAttempts) {
                x = Math.floor(Math.random() * availableWidth + margin);
                y = Math.floor(Math.random() * availableHeight + startY);
                
                // 確保 y 不會太接近底部，針對小螢幕特別處理
                if (y > safeHeight) {
                    continue;
                }

                validPosition = true;
                attempts++;

                // 檢查與所有已放置食物的距離
                for (const food of placedFoods) {
                    const distance = Math.sqrt(
                        Math.pow(x - food.x, 2) + 
                        Math.pow(y - food.y, 2)
                    );
                    if (distance < minFoodDistance) {
                        validPosition = false;
                        break;
                    }
                }

                // 檢查與蛇的距離
                for (const segment of this.snake) {
                    const distance = Math.sqrt(
                        Math.pow(x - segment.x, 2) + 
                        Math.pow(y - segment.y, 2)
                    );
                    if (distance < minFoodDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }

            if (validPosition) {
                const food = {
                    x: x,
                    y: y,
                    word: this.getRandomWord(),
                    size: this.isMobile ? this.pixelSize * 0.8 : this.pixelSize
                };
                this.decoyFoods.push(food);
                placedFoods.push(food);
            }
        }

        // 初始化食物動畫
        this.correctFoods.forEach(food => {
            this.foodAnimations.correct.push({
                x: food.x,
                y: food.y,
                offsetY: 0
            });
        });

        this.decoyFoods.forEach(food => {
            this.foodAnimations.decoys.push({
                x: food.x,
                y: food.y,
                offsetY: 0
            });
        });
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

    updateScore(score, x, y, bonusText) {
        const scoreDisplay = document.querySelector('.current-score');
        const oldScore = this.score;
        this.score += score;

        // 創建包裝器來包含每個數字
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        
        // 將新分數轉換為字符串並分割為單個數字
        const newScore = this.score.toString();
        
        // 為每個數字創建動畫
        newScore.split('').forEach((digit, i) => {
            const span = document.createElement('span');
            span.textContent = digit;
            span.style.display = 'inline-block';
            wrapper.appendChild(span);
            
            // 使用 anime.js 創建跳躍動畫
            anime({
                targets: span,
                translateY: [
                    { value: -20, duration: 150, easing: 'easeOutQuad' },
                    { value: 0, duration: 350, easing: 'easeInOutQuad' }
                ],
                scale: [
                    { value: 1.5, duration: 150, easing: 'easeOutQuad' },
                    { value: 1, duration: 350, easing: 'easeInOutQuad' }
                ],
                delay: i * 50 // 為每個數字添加延遲，創造波浪效果
            });
        });

        // 替換舊的內容
        scoreDisplay.innerHTML = '';
        scoreDisplay.appendChild(wrapper);

        // 顯示分數增加提示
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        document.querySelector('.score-container').appendChild(popup);
        
        // 自動移除彈出提示
        setTimeout(() => popup.remove(), 1000);

        // 處理連擊效果
        if (this.combo > 1) {
            // 使用傳入的座標而不是 food 的座標
            this.showComboEffect(x, y, this.combo);
            
            // 計算音調（每次提高 0.2，最高到 2.0）
            const pitchRate = Math.min(1.0 + (this.combo - 1) * 0.2, 2.0);
            
            // 創建新的音效實例以確保可以重疊播放
            const comboSound = new Howl({
                src: ['snd/combo.mp3'],
                volume: 0.8,
                rate: pitchRate
            });
            
            comboSound.play();

            // 加快背景音樂
            const bgmRate = Math.min(1.0 + (this.combo - 1) * 0.1, 1.5); // 最多加快 50%
            this.bgm.rate(bgmRate);  // 使用 this.bgm 而不是 this.sounds.bgm

            // 顯示 Combo Time 提示
            let comboIndicator = document.querySelector('.combo-indicator');
            if (!comboIndicator) {
                comboIndicator = document.createElement('div');
                comboIndicator.className = 'combo-indicator';
                comboIndicator.textContent = 'COMBO TIME!';
                document.querySelector('.score-container').appendChild(comboIndicator);
            }
            comboIndicator.classList.add('active');
        } else {
            // 移除連擊效果
            const comboIndicator = document.querySelector('.combo-indicator');
            if (comboIndicator) {
                comboIndicator.classList.remove('active');
            }
            // 恢復背景音樂速度
            this.bgm.rate(1.0);
        }
    }

    draw() {
        // 繪製背景
        this.drawBackground();
        
        // 繪製蛇身
        if (this.lastPosition) {
            // 先繪製蛇尾
            const tail = this.snake[this.snake.length - 1];
            const prevTail = this.snake[this.snake.length - 2];
            const lastTail = this.lastPosition[this.lastPosition.length - 1];
            
            if (lastTail && prevTail) {
                const x = lastTail.x + (tail.x - lastTail.x) * this.animationProgress;
                const y = lastTail.y + (tail.y - lastTail.y) * this.animationProgress;

                this.ctx.save();
                this.ctx.translate(x + this.pixelSize/2, y + this.pixelSize/2);
                
                // 計算尾巴的旋轉角度（朝向前一個身體段落）並加上 90 度基礎旋轉
                const dx = prevTail.x - tail.x;
                const dy = prevTail.y - tail.y;
                const rotation = Math.atan2(dy, dx) + Math.PI/2; // 加上 90 度基礎旋轉
                this.ctx.rotate(rotation);
                
                // 繪製蛇尾
                this.ctx.drawImage(
                    this.snakeTail,
                    -this.pixelSize/2,
                    -this.pixelSize/2,
                    this.pixelSize,
                    this.pixelSize
                );
                
                this.ctx.restore();
            }

            // 繪製蛇身（除了頭部和尾部）
            for (let i = this.snake.length - 2; i > 0; i--) {
                const segment = this.snake[i];
                const lastPos = this.lastPosition[i];
                if (!lastPos) continue;

                const x = lastPos.x + (segment.x - lastPos.x) * this.animationProgress;
                const y = lastPos.y + (segment.y - lastPos.y) * this.animationProgress;

                this.ctx.save();
                this.ctx.translate(x + this.pixelSize/2, y + this.pixelSize/2);
                
                // 計算蛇身段落的旋轉角度
                const nextSegment = this.snake[i - 1];
                const dx = nextSegment.x - segment.x;
                const dy = nextSegment.y - segment.y;
                const rotation = Math.atan2(dy, dx);
                
                this.ctx.rotate(rotation);
                
                // 繪製蛇身圖片
                this.ctx.drawImage(
                    this.snakeBody,
                    -this.pixelSize/2,
                    -this.pixelSize/2,
                    this.pixelSize,
                    this.pixelSize
                );
                
                this.ctx.restore();
            }

            // 繪製蛇頭
            const head = this.snake[0];
            const lastHead = this.lastPosition[0];
            if (lastHead) {
                const x = lastHead.x + (head.x - lastHead.x) * this.animationProgress;
                const y = lastHead.y + (head.y - lastHead.y) * this.animationProgress;

                this.ctx.save();
                // 移動到蛇頭中心點，稍微向下偏移以遮蓋接駁部分
                this.ctx.translate(
                    x + this.pixelSize/2, 
                    y + this.pixelSize/2 + this.pixelSize * 0.1 // 向下偏移 10%
                );
                
                // 根據方向旋轉，加上 90 度的基礎旋轉
                let rotation = Math.PI/2; // 基礎旋轉 90 度
                switch(this.direction) {
                    case 'up': rotation += -Math.PI/2; break;
                    case 'down': rotation += Math.PI/2; break;
                    case 'left': rotation += Math.PI; break;
                    case 'right': rotation += 0; break;
                }
                this.ctx.rotate(rotation);
                
                // 繪製蛇頭圖片，放大 20% 並調整偏移以保持中心點
                const headSize = this.pixelSize * 1.4; // 放大 20%
                this.ctx.drawImage(
                    this.snakeHead,
                    -headSize/2,
                    -headSize/2,
                    headSize,
                    headSize
                );
                
                this.ctx.restore();
            }
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

        // 如果處於發光狀態，添加發光效果
        if (this.glowEffect) {
            const elapsed = Date.now() - this.glowStartTime;
            if (elapsed < this.glowDuration) {
                const alpha = 1 - (elapsed / this.glowDuration);
                this.ctx.save();
                this.ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                this.ctx.lineWidth = 10;
                this.ctx.shadowColor = 'yellow';
                this.ctx.shadowBlur = 20;
                // 為蛇身每個部分添加發光描邊
                this.snake.forEach(segment => {
                    this.ctx.strokeRect(
                        segment.x,
                        segment.y,
                        this.pixelSize,
                        this.pixelSize
                    );
                });
                this.ctx.restore();
            } else {
                this.glowEffect = false;
            }
        }

        // 繪製道具
        this.drawPowerUps();

        if (this.isDebugging) {
            this.updateDebugInfo();
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
        
        // 根據設備類型設置不同的字體大小
        const fontSize = this.isMobile ? '25px' : '45px';
        this.ctx.font = `900 ${fontSize} "Noto Sans TC"`;
        
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

        // 獲取當前蛇頭位置
        const head = this.getInterpolatedHeadPosition();
        
        // 檢查各種碰撞
        this.checkFoodCollision(head);
        this.spawnPowerUp();
        this.checkPowerUpCollision(head);
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
                width: food.size,
                height: food.size
            };

            if (Collider2D.boxCollision(head, foodRect)) {
                food.collected = true;

                // 顯示正確表情
                this.showEmoji('correct', headPosition.x, headPosition.y);

                // 增加連擊數
                this.combo++;

                // 計算分數
                const { score, bonusText } = this.calculateScore(index, index === this.currentWordIndex);

                // 更新總分和顯示
                this.updateScore(score, headPosition.x, headPosition.y, bonusText);

                // 如果有連擊，顯示連擊效果並播放音效
                if (this.combo > 1) {
                    this.showComboEffect(food.x, food.y, this.combo);
                    
                    // 計算音調（每次提高 0.2，最高到 2.0）
                    const pitchRate = Math.min(1.0 + (this.combo - 1) * 0.2, 2.0);
                    
                    // 創建新的音效實例以確保可以重疊播放
                    const comboSound = new Howl({
                        src: ['snd/combo.mp3'],
                        volume: 0.8,
                        rate: pitchRate
                    });
                    
                    comboSound.play();

                    // 加快背景音樂
                    const bgmRate = Math.min(1.0 + (this.combo - 1) * 0.1, 1.5); // 最多加快 50%
                    this.bgm.rate(bgmRate);  // 使用 this.bgm 而不是 this.sounds.bgm
                }

                // 增加蛇的速度
                this.moveSpeed += this.scoreConfig.speedIncrease;

                // 視覺效果
                this.showCollectedWord(food.word, index);
                this.triggerGlowEffect();

                // 讓蛇變長
                this.growSnake();

                // 檢查是否完成詞組
                if (this.correctFoods.every(f => f.collected)) {
                    // 添加完成獎勵
                    const completionScore = this.scoreConfig.completion;
                    this.updateScore(completionScore, headPosition.x, headPosition.y, '完成獎勵!');
                    
                    this.completedGreetings.push(this.currentWords.join(''));
                    this.showCompletionAnimation(this.currentWords);
                    
                    // 播放兩次完成音效
                    this.sounds.crash.play();
                    setTimeout(() => {
                        this.sounds.crash.play();
                    }, 200);  // 200毫秒後播放第二次
                    
                    this.currentGreetingIndex++;
                    
                    if (this.currentGreetingIndex >= this.greetingsData.length) {
                        this.gameOver();
                        return;
                    }
                    
                    this.selectNextGreeting();
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
        this.bgm.stop();
        
        // 隱藏遊戲界面元素
        document.querySelector('.game-container').classList.remove('game-started');
        
        this.showGameResult();
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
            if (this.isGameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.changeDirection('up');  // 使用 changeDirection 方法
                    break;
                case 'ArrowDown':
                    this.changeDirection('down');
                    break;
                case 'ArrowLeft':
                    this.changeDirection('left');
                    break;
                case 'ArrowRight':
                    this.changeDirection('right');
                    break;
            }
        });

        // 添加難度選擇按鈕的事件監聽
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除其他按鈕的選中狀態
                document.querySelectorAll('.difficulty-btn').forEach(b => 
                    b.classList.remove('selected'));
                
                // 添加當前按鈕的選中狀態
                btn.classList.add('selected');
                
                // 設置難度
                this.setDifficulty(btn.dataset.difficulty);
            });
        });

        // 默認選中普通難度
        document.querySelector('[data-difficulty="NORMAL"]').classList.add('selected');

        // 添加 debug 相關按鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {  // 使用 F3 鍵切換 debug 模式
                this.toggleDebug();
            } else if (e.key === ' ' && this.isDebugging) {  // 空格鍵繼續遊戲
                this.isDebugging = false;
                this.hideDebugInfo();
                this.resumeGame();
            }
        });
    }

    // 添加計時器更新方法
    updateTimer() {
        // 如果時間暫停中，不更新時間
        if (this.isTimeFrozen) {
            return this.frozenTimeRemaining;
        }

        const timeLeft = Math.max(0, this.endTime - Date.now());
        const totalTime = this.gameDuration * 1000;
        const percentage = timeLeft / totalTime;

        // 更新時間文字
        const seconds = Math.ceil(timeLeft / 1000);
        const timerText = document.querySelector('.timer-text');
        timerText.textContent = seconds;

        // 更新計時條
        const timerBar = document.querySelector('.timer-bar');
        timerBar.style.transform = `scaleY(${percentage})`;

        // 當時間少於 30 秒時添加警告效果
        if (seconds <= 30 && !this.isTimeFrozen) {
            timerBar.classList.add('warning');
            timerText.classList.add('warning');
        } else {
            timerBar.classList.remove('warning');
            timerText.classList.remove('warning');
        }

        return timeLeft;
    }

    // 時間到方法
    timeUp() {
        if (!this.isGameOver) {
            this.gameOver();
        }
    }

    // 添加顯示結果的方法
    showGameResult() {
        const { finalScore, bonuses } = this.calculateFinalScore();
        
        // 更新 HTML 內容
        const resultContainer = document.getElementById('gameResult');
        const scoreDisplay = resultContainer.querySelector('.score-value');
        
        // 顯示基礎分數
        scoreDisplay.textContent = this.score;

        // 更新完成的祝賀詞列表
        const completedWordsList = document.getElementById('completedWordsList');
        completedWordsList.innerHTML = this.completedGreetings.map(greeting => `
            <tr>
                <td>${greeting}</td>
            </tr>
        `).join('');

        // 更新統計數據
        document.getElementById('totalCollected').textContent = this.stats.totalCollected;
        document.getElementById('perfectCollects').textContent = this.stats.perfectCollects;
        document.getElementById('maxCombo').textContent = this.maxCombo;

        // 更新獎勵列表
        const bonusesList = document.getElementById('bonusesList');
        bonusesList.innerHTML = bonuses.map(bonus => `
            <div class="bonus-item">
                <span>${bonus.text}</span>
                <span>+${bonus.points}</span>
            </div>
        `).join('');
        
        // 顯示結果界面
        resultContainer.classList.remove('hidden');

        // 儲存最高分
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('highScore', finalScore.toString());
        }
    }

    // 隱藏結果
    hideGameResult() {
        this.resultElement.classList.add('hidden');
    }

    // 修改 resizeCanvas 方法
    resizeCanvas() {
        this.setupCanvasSize();
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
                rate: 1.0,  // 添加初始速率
                autoplay: false
            }),
            collect: new Howl({
                src: ['snd/drip.mp3'],
                volume: 0.8
            }),
            complete: new Howl({
                src: ['snd/beep.mp3'],
                volume: 0.8
            }),
            powerup: new Howl({
                src: ['snd/speed-up.mp3'],
                volume: 0.8
            }),
            combo: new Howl({
                src: ['snd/combo.mp3'],
                volume: 0.8,
                rate: 1.0
            }),
            turn: new Howl({
                src: ['snd/turn.mp3'],
                volume: 0.5
            }),
            crash: new Howl({ 
                src: ['snd/crash.mp3'] 
            })
        };

        // 為了保持兼容性，保留 bgm 引用
        this.bgm = this.sounds.bgm;
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
        if (!this.isInvincible) {
            // 中斷連擊
            this.breakCombo();
            
            // 顯示錯誤表情
            this.showEmoji('wrong', this.snake[0].x, this.snake[0].y);
            
            // 添加懲罰效果
            this.isPenalized = true;
            setTimeout(() => {
                this.isPenalized = false;
            }, this.penaltyDuration);
        }
    }

    // 修改 breakCombo 方法
    breakCombo() {
        this.combo = 0;
        
        // 移除連擊提示
        const comboIndicator = document.querySelector('.combo-indicator');
        if (comboIndicator) {
            // 添加淡出動畫
            comboIndicator.style.animation = 'fadeOut 0.3s ease forwards';
            // 動畫結束後移除元素
            setTimeout(() => {
                comboIndicator.remove();
            }, 300);
        }

        // 恢復背景音樂到正常速度和音調
        this.bgm.rate(1.0);
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

    // 修改繪製背景的方法
    drawBackground() {
        // 先繪製純色背景
        this.ctx.fillStyle = '#ffe9dc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 如果圖案已加載完成，繪製圖案
        if (this.pattern) {
            this.ctx.fillStyle = this.pattern;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止滾動
            if (this.isGameOver) return;

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            // 獲取觸控點相對於畫布的位置
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // 獲取蛇頭位置
            const head = this.snake[0];
            const headCenterX = head.x + this.pixelSize/2;
            const headCenterY = head.y + this.pixelSize/2;
            
            // 計算觸控點與蛇頭的相對位置
            const deltaX = touchX - headCenterX;
            const deltaY = touchY - headCenterY;
            
            // 根據觸控點與蛇頭的相對位置決定方向
            // 使用絕對值比較來決定主要方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平移動優先
                if (deltaX > 0 && this.direction !== 'left') {
                    this.direction = 'right';
                } else if (deltaX < 0 && this.direction !== 'right') {
                    this.direction = 'left';
                }
            } else {
                // 垂直移動優先
                if (deltaY > 0 && this.direction !== 'up') {
                    this.direction = 'down';
                } else if (deltaY < 0 && this.direction !== 'down') {
                    this.direction = 'up';
                }
            }
        });

        // 添加觸控移動事件（可選，用於持續追蹤手指移動）
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // 防止滾動
        });

        // 防止 iOS Safari 的橡皮筋效果
        document.body.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    // 添加獲取隨機錯誤字的方法
    getRandomWord() {
        // 確保有可用的錯誤詞組
        if (!this.greetingsData || !this.greetingsData[this.currentGreetingIndex]) {
            return '錯';
        }

        const currentGreeting = this.greetingsData[this.currentGreetingIndex];
        if (!currentGreeting.wrong_words || currentGreeting.wrong_words.length === 0) {
            return '錯';
        }

        // 從當前祝賀詞的錯誤詞組中隨機選擇一個
        const randomIndex = Math.floor(Math.random() * currentGreeting.wrong_words.length);
        return currentGreeting.wrong_words[randomIndex];
    }

    // 新增方法：設置畫布大小
    setupCanvasSize() {
        const gameContainer = document.querySelector('.game-container');
        const containerRect = gameContainer.getBoundingClientRect();

        if (this.isMobile) {
            // 在移動設備上使用容器的大小
            this.canvas.width = containerRect.width;
            this.canvas.height = containerRect.height;
        } else {
            // 在桌面設備上使用容器的大小
            this.canvas.width = containerRect.width;
            this.canvas.height = containerRect.height;
        }

        // 更新畫布的樣式以確保它正確顯示
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
    }

    // 添加發光效果
    triggerGlowEffect() {
        this.glowEffect = true;
        this.glowStartTime = Date.now();
    }

    // 添加分數彈出動畫
    showScorePopup(score, x, y) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        popup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: gold;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(popup);

        // 使用 anime.js 製作動畫
        anime({
            targets: popup,
            translateY: -50,
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeOutExpo',
            complete: () => popup.remove()
        });
    }

    // 生成道具
    spawnPowerUp() {
        const now = Date.now();
        if (now - this.lastPowerUpSpawn < this.powerUpSpawnInterval) return;

        // 隨機選擇道具類型
        const types = Object.keys(this.powerUpTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];

        // 計算安全的生成位置
        const margin = this.pixelSize * 2;
        const headerHeight = document.querySelector('.game-header').getBoundingClientRect().height;
        
        const x = Math.floor(Math.random() * (this.canvas.width - margin * 2)) + margin;
        const y = Math.floor(Math.random() * (this.canvas.height - headerHeight - margin * 2)) + headerHeight + margin;

        this.powerUps.push({
            type: randomType,
            x: x,
            y: y,
            size: this.pixelSize,
            collected: false
        });

        this.lastPowerUpSpawn = now;
    }

    // 繪製道具
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            if (!powerUp.collected) {
                const img = this.powerUpImages[powerUp.type];
                if (img.complete) {  // 確保圖片已加載
                    this.ctx.drawImage(
                        img,
                        powerUp.x,
                        powerUp.y,
                        this.pixelSize,
                        this.pixelSize
                    );
                }
            }
        });
    }

    // 檢查道具碰撞
    checkPowerUpCollision(headPosition) {
        const head = {
            x: headPosition.x,
            y: headPosition.y,
            width: this.pixelSize,
            height: this.pixelSize
        };

        this.powerUps.forEach(powerUp => {
            if (powerUp.collected) return;

            const powerUpRect = {
                x: powerUp.x,
                y: powerUp.y,
                width: powerUp.size,
                height: powerUp.size
            };

            if (Collider2D.boxCollision(head, powerUpRect)) {
                powerUp.collected = true;
                
                // 根據道具類型顯示不同表情
                if (powerUp.type === 'SPEED') {
                    this.showEmoji('speed', headPosition.x, headPosition.y);
                } else if (powerUp.type === 'INVINCIBLE') {
                    this.showEmoji('star', headPosition.x, headPosition.y);
                }

                // 播放道具收集音效
                this.sounds.powerup.play();
            }
        });
    }

    // 激活道具效果
    activatePowerUp(type) {
        const powerUp = this.powerUpTypes[type];
        
        // 如果已有相同類型的道具在生效，先清除它
        if (this.activePowerUps.has(type)) {
            clearTimeout(this.activePowerUps.get(type));
        }

        // 應用道具效果
        powerUp.effect();

        // 設置定時器在持續時間結束後重置效果
        const timer = setTimeout(() => {
            powerUp.reset();
            this.activePowerUps.delete(type);
        }, powerUp.duration);

        this.activePowerUps.set(type, timer);
    }

    // 添加設置難度的方法
    setDifficulty(difficultyLevel) {
        if (this.difficulties[difficultyLevel]) {
            this.currentDifficulty = difficultyLevel;
        }
    }

    // 修改計分邏輯
    calculateScore(index, isCorrectOrder) {
        let score = this.scoreConfig.base;
        let bonusText = '';

        // 計算連擊加成
        if (this.combo > 0) {
            const comboBonus = score * (this.combo * this.scoreConfig.comboMultiplier);
            score += comboBonus;
            bonusText += `連擊 x${this.combo}`;
        }

        // 順序加成
        if (isCorrectOrder) {
            const orderBonus = score * this.scoreConfig.orderMultiplier;
            score += orderBonus;
            bonusText += bonusText ? '\n順序加成!' : '順序加成!';
        }

        return { score: Math.round(score), bonusText };
    }

    // 修改遊戲結束時的分數計算
    calculateFinalScore() {
        let finalScore = this.score;
        let bonuses = [];

        // 時間獎勵（只在正常結束遊戲時給予）
        if (!this.isGameOver && this.remainingTime >= this.scoreConfig.timeBonus.threshold) {
            finalScore += this.scoreConfig.timeBonus.points;
            this.stats.timeBonus = true;
            bonuses.push({
                text: '時間獎勵',
                points: this.scoreConfig.timeBonus.points
            });
        }

        // 連擊獎勵
        if (this.maxCombo >= 5) {
            const comboBonus = this.maxCombo * 100;
            finalScore += comboBonus;
            bonuses.push({
                text: `最高連擊 x${this.maxCombo}`,
                points: comboBonus
            });
        }

        return { finalScore, bonuses };
    }

    // 添加特效系統
    initEffects() {
        // 初始化粒子系統
        particlesJS('particles-js', {
            particles: {
                number: { value: 50 },
                color: { value: '#ffff00' },
                shape: { type: 'circle' },
                opacity: { value: 0.5 },
                size: { value: 3 },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true
                }
            }
        });
    }

    // 在收集到字時顯示特效
    showCollectionEffect(x, y) {
        // 使用 GSAP 創建爆炸效果
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'collection-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            document.body.appendChild(particle);

            gsap.to(particle, {
                x: Math.cos(i * Math.PI/4) * 50,
                y: Math.sin(i * Math.PI/4) * 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    }

    // 在完成一組詞時顯示慶祝效果
    showCompletionEffect() {
        // 使用 PIXI.js 創建煙火效果
        const app = new PIXI.Application({
            transparent: true,
            resizeTo: window
        });
        document.body.appendChild(app.view);

        // 創建煙火效果
        const firework = new PIXI.ParticleContainer();
        app.stage.addChild(firework);

        // 在3秒後移除效果
        setTimeout(() => {
            app.destroy(true);
        }, 3000);
    }

    // 添加顯示連擊效果的方法
    showComboEffect(x, y, comboCount) {
        const comboDisplay = document.createElement('div');
        comboDisplay.className = 'combo-display';
        comboDisplay.innerHTML = `
            <span class="combo-text">連擊</span>
            <span class="combo-number">x${comboCount}</span>
        `;

        // 設置位置（在收集到的字的位置）
        comboDisplay.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y - 40}px;
            animation: comboAppear 0.5s ease forwards;
        `;

        document.body.appendChild(comboDisplay);

        // 0.8秒後開始消失動畫
        setTimeout(() => {
            comboDisplay.style.animation = 'comboDisappear 0.2s ease forwards';
        }, 800);

        // 1秒後移除元素
        setTimeout(() => {
            comboDisplay.remove();
        }, 1000);
    }

    // 添加顯示表情符號的方法
    showEmoji(type, x, y) {
        const emojiContainer = document.createElement('div');
        emojiContainer.className = 'emoji-container';
        
        const emoji = document.createElement('img');
        emoji.src = this.emojis[type].src;
        emoji.className = 'emoji';
        
        emojiContainer.appendChild(emoji);
        
        // 設置位置（在蛇頭右上方）
        emojiContainer.style.cssText = `
            position: absolute;
            left: ${x + this.pixelSize}px;
            top: ${y - this.pixelSize}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(emojiContainer);

        // 使用 GSAP 製作動畫，縮短顯示時間
        gsap.fromTo(emojiContainer,
            {
                opacity: 0,
                scale: 0.5,
                y: '+=10'
            },
            {
                opacity: 1,
                scale: 1,
                y: '-=10',
                duration: 0.15,  // 縮短出現時間
                ease: 'back.out(1.7)',
                onComplete: () => {
                    // 0.15秒後開始淡出
                    gsap.to(emojiContainer, {
                        opacity: 0,
                        y: '-=20',
                        duration: 0.15,  // 縮短消失時間
                        delay: 0.3,      // 縮短停留時間
                        ease: 'power1.in',
                        onComplete: () => emojiContainer.remove()
                    });
                }
            }
        );
    }

    // 修改方向改變的方法
    changeDirection(newDirection) {
        // 檢查是否是有效的方向改變
        if (
            (this.direction === 'up' && newDirection === 'down') ||
            (this.direction === 'down' && newDirection === 'up') ||
            (this.direction === 'left' && newDirection === 'right') ||
            (this.direction === 'right' && newDirection === 'left')
        ) {
            return;
        }

        // 如果方向確實改變了，播放轉向音效
        if (this.direction !== newDirection) {
            this.sounds.turn.play();
        }

        this.direction = newDirection;
    }

    // 添加 debug 切換方法
    toggleDebug() {
        this.isDebugging = !this.isDebugging;
        
        if (this.isDebugging) {
            this.pauseGame();
            console.log('Debug mode enabled');
            this.showDebugInfo();
        } else {
            this.hideDebugInfo();
            console.log('Debug mode disabled');
        }
    }

    // 顯示 debug 資訊
    showDebugInfo() {
        if (!this.debugPanel) {
            this.debugPanel = document.createElement('div');
            this.debugPanel.className = 'debug-panel';
            this.debugPanel.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                z-index: 9999;
            `;
            document.body.appendChild(this.debugPanel);
        }

        // 更新 debug 資訊
        this.updateDebugInfo();
    }

    // 更新 debug 資訊
    updateDebugInfo() {
        if (!this.isDebugging) return;

        this.debugInfo = {
            fps: Math.round(1000 / this.frameInterval),
            snakePosition: `(${this.snake[0].x}, ${this.snake[0].y})`,
            direction: this.direction,
            combo: this.combo,
            score: this.score
        };

        this.debugPanel.innerHTML = `
            <div>FPS: ${this.debugInfo.fps}</div>
            <div>Snake Head: ${this.debugInfo.snakePosition}</div>
            <div>Direction: ${this.debugInfo.direction}</div>
            <div>Combo: ${this.debugInfo.combo}</div>
            <div>Score: ${this.debugInfo.score}</div>
            <div>Press Space to resume</div>
        `;
    }

    // 隱藏 debug 資訊
    hideDebugInfo() {
        if (this.debugPanel) {
            this.debugPanel.remove();
            this.debugPanel = null;
        }
    }

    // 修改切換頁面方法
    toggleResultPage() {
        const scorePage = document.querySelector('.score-result-container');
        const statsContainer = document.querySelector('.stats-container');
        const leaderboardPage = document.querySelector('.leaderboard-container');
        const nextPageButton = document.querySelector('.next-page-button');
        
        if (scorePage.style.display !== 'none') {
            // 切換到排行榜
            scorePage.style.display = 'none';
            statsContainer.style.display = 'none';
            leaderboardPage.style.display = 'block';
            nextPageButton.textContent = '返回';
        } else {
            // 切換回成績頁
            scorePage.style.display = 'block';
            statsContainer.style.display = 'block';
            leaderboardPage.style.display = 'none';
            nextPageButton.textContent = '排行榜';
        }
    }
}

window.onload = () => {
    new SnakeGame();
};