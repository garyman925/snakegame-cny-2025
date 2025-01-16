// 動態引入 Collider2D 模組
let Collider2D;
import('./src/game/Collider2D.js')
    .then(module => {
        Collider2D = module.Collider2D;
        console.log('Collider2D 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 Collider2D 模組:', err);
    });

// 引入 UI 模組
let UISystem;
import('./src/game/UI.js')
    .then(module => {
        UISystem = module.UISystem;
        console.log('UI 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 UI 模組:', err);
    });

// 引入各個系統
let AudioSystem, PowerUpSystem, ScoreSystem, EffectSystem;

console.log('🔄 開始載入遊戲系統模組...');

Promise.all([
    import('./src/game/AudioSystem.js').then(module => {
        AudioSystem = module.AudioSystem;
        console.log('Audio 模組已成功載入');
        return module;
    }),
    import('./src/game/PowerUpSystem.js').then(module => {
        PowerUpSystem = module.PowerUpSystem;
        console.log('PowerUp 模組已成功載入');
        return module;
    }),
    import('./src/game/ScoreSystem.js').then(module => {
        ScoreSystem = module.ScoreSystem;
        console.log('Score 模組已成功載入');
        return module;
    }),
    import('./src/game/EffectSystem.js').then(module => {
        EffectSystem = module.EffectSystem;
        console.log('Effect 模組已成功載入');
        return module;
    })
]).then(() => {
    console.log('所有遊戲系統模組載入完成！');
}).catch(err => {
    console.error('載入遊戲系統模組時發生錯誤:', err);
    console.error('錯誤詳情:', {
        name: err.name,
        message: err.message,
        stack: err.stack
    });
});

// 在其他系統引入後添加
let ControlSystem;
import('./src/game/ControlSystem.js')
    .then(module => {
        ControlSystem = module.ControlSystem;
        console.log('Control 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 Control 模組:', err);
        console.error('錯誤詳情:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
    });

// 在其他系統引入後添加
let DebugSystem;
import('./src/game/DebugSystem.js')
    .then(module => {
        DebugSystem = module.DebugSystem;
        console.log('Debug 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 Debug 模組:', err);
    });

// 在文件頂部添加引入
let DifficultySystem;
import('./src/game/DifficultySystem.js')
    .then(module => {
        DifficultySystem = module.DifficultySystem;
        console.log('Difficulty 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 Difficulty 模組:', err);
    });

// 在文件頂部添加引入
let ConfettiSystem;
import('./src/game/ConfettiSystem.js')
    .then(module => {
        ConfettiSystem = module.ConfettiSystem;
        console.log('Confetti 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 Confetti 模組:', err);
    });

class SnakeGame {
    constructor() {
        // 首先初始化基本屬性
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
       
        
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
        this.correctFoods = [];  // 保留這行
        this.decoyFoods = [];    // 保留這行



        // 添加懲罰相關屬性
        this.isPenalized = false;
        this.penaltyDuration = 1000;  // 1秒停止移動
        this.transparentDuration = 3000;  // 3秒透明處罰時間
        this.isTransparent = false;  // 新增：是否處於透明狀態
        
        // 創建閃光效果元素
        // this.flashOverlay = document.createElement('div');
        // this.flashOverlay.className = 'flash-overlay';
        // document.body.appendChild(this.flashOverlay);

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
        // this.glowEffect = false;
        // this.glowDuration = 500; // 發光持續時間（毫秒）
        // this.glowStartTime = 0;

        // 初始化難度系統
        if (DifficultySystem) {
            this.difficultySystem = new DifficultySystem(this);
        }

  
        // 初始化分數顯示
        this.scoreDisplay = document.querySelector('.current-score');



        // 添加 debug 相關屬性
        this.isDebugging = false;
        this.debugInfo = {
            fps: 0,
            snakePosition: '',
            direction: '',
            combo: 0,
            score: 0
        };

        // 初始化系統的Promise
        this.systemsReady = Promise.all([
            new Promise(resolve => {
                if (EffectSystem) {
                    this.effects = new EffectSystem(this);
                    resolve();
                } else {
                    setTimeout(() => {
                        if (EffectSystem) {
                            this.effects = new EffectSystem(this);
                            resolve();
                        }
                    }, 100);
                }
            }),
            new Promise(resolve => {
                if (ScoreSystem) {
                    this.scoreSystem = new ScoreSystem(this);
                    resolve();
                } else {
                    setTimeout(() => {
                        if (ScoreSystem) {
                            this.scoreSystem = new ScoreSystem(this);
                            resolve();
                        }
                    }, 100);
                }
            }),
            new Promise(resolve => {
                if (UISystem) {
                    this.ui = new UISystem(this);
                    resolve();
                } else {
                    setTimeout(() => {
                        if (UISystem) {
                            this.ui = new UISystem(this);
                            resolve();
                        }
                    }, 100);
                }
            }),
            new Promise(resolve => {
                if (ControlSystem) {
                    this.controls = new ControlSystem(this);
                    resolve();
                } else {
                    setTimeout(() => {
                        if (ControlSystem) {
                            this.controls = new ControlSystem(this);
                            resolve();
                        }
                    }, 100);
                }
            }),
            new Promise(resolve => {
                if (DebugSystem) {
                    this.debug = new DebugSystem(this);
                    resolve();
                } else {
                    setTimeout(() => {
                        if (DebugSystem) {
                            this.debug = new DebugSystem(this);
                            resolve();
                        }
                    }, 100);
                }
            })
        ]).then(() => {
            console.log('✅ 所有遊戲系統初始化完成');
        }).catch(err => {
            console.error('❌ 系統初始化失敗:', err);
        });

        // 等待 PowerUpSystem 模組載入後初始化
        if (PowerUpSystem) {
            this.powerUpSystem = new PowerUpSystem(this);
        } else {
            setTimeout(() => {
                if (PowerUpSystem) {
                    this.powerUpSystem = new PowerUpSystem(this);
                }
            }, 100);
        }

        // 添加無敵相關屬性
        this.isInvincible = false;

        // 初始化排行榜
        this.initializeRanking();

        // 添加遊戲結束原因
        this.gameOverReason = '';  // 添加遊戲結束原因

        // 初始化 Logo 動畫
        import('./src/game/LogoAnimator.js').then(module => {
            this.logoAnimator = new module.LogoAnimator();
            this.logoAnimator.playEnterAnimation();
        });

        // 等待所有系統載入完成後再初始化紙碎系統
        Promise.all([
            new Promise(resolve => {
                if (typeof confetti !== 'undefined' && ConfettiSystem) {
                    resolve();
                } else {
                    const checkLoaded = setInterval(() => {
                        if (typeof confetti !== 'undefined' && ConfettiSystem) {
                            clearInterval(checkLoaded);
                            resolve();
                        }
                    }, 100);
                }
            })
        ]).then(() => {
            console.log('Confetti system ready to initialize');
            this.initConfettiSystem();
        });

        // 初始化音效系統
        if (AudioSystem) {
            this.audio = new AudioSystem();
            // 在初始化時就開始播放背景音樂
            this.audio.playBGM();
        }
    }

    initConfettiSystem() {
        try {
            this.confettiSystem = new ConfettiSystem();
            this.confettiSystem.start();
            console.log('Confetti system started successfully');
        } catch (error) {
            console.error('Failed to initialize confetti system:', error);
        }
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
        try {
            // 等待所有系統準備好
            this.systemsReady.then(() => {
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

                // 使用難度系統初始化參數
                if (this.difficultySystem) {
                    this.difficultySystem.initializeDifficulty();
                }

                // 停止紙碎動畫
                if (this.confettiSystem) {
                    this.confettiSystem.stop();
                }

                // 只播放開始遊戲的音效
                if (this.audio) {
                    this.audio.playSound('crash');
                    setTimeout(() => {
                        this.audio.playSound('crash');
                    }, 200);
                }
            });
        } catch (error) {
            console.error('遊戲初始化失敗:', error);
        }
    }

    // 修改 selectNextGreeting 方法
    selectNextGreeting(isInitial = false) {
        // 只有在不是初始化時才播放音效
        if (!isInitial && this.audio) {
            // 連續播放兩次 crash 音效
            this.audio.playSound('crash');
            setTimeout(() => {
                this.audio.playSound('crash');
            }, 200);  // 200毫秒後播放第二次
        }

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
        this.correctFoods = [];  // 修改這行
        this.decoyFoods = [];    // 修改這行
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
                this.correctFoods.push(food);  // 保留這行
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
                this.decoyFoods.push(food);  // 保留這行
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

    // 修改使用計分系統的方法
    handleCorrectCollection(index, isCorrectOrder) {
        const { score, bonusText } = this.scoreSystem.calculateScore(index, isCorrectOrder);
        // 傳遞蛇頭位置給計分系統
        const head = this.snake[0];
        this.scoreSystem.updateScore(score, head.x, head.y, bonusText);
    }

    breakCombo() {
        this.scoreSystem.breakCombo();
        // ... 其他代碼 ...
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
        // if (this.glowEffect) {
        //     const elapsed = Date.now() - this.glowStartTime;
        //     if (elapsed < this.glowDuration) {
        //         const alpha = 1 - (elapsed / this.glowDuration);
        //         this.ctx.save();
        //         this.ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
        //         this.ctx.lineWidth = 10;
        //         this.ctx.shadowColor = 'yellow';
        //         this.ctx.shadowBlur = 20;
        //         // 為蛇身每個部分添加發光描邊
        //         this.snake.forEach(segment => {
        //             this.ctx.strokeRect(
        //                 segment.x,
        //                 segment.y,
        //                 this.pixelSize,
        //                 this.pixelSize
        //             );
        //         });
        //         this.ctx.restore();
        //     } else {
        //         this.glowEffect = false;
        //     }
        // }

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
        
        // 移除舊的道具生成調用
        // this.spawnPowerUp();
        // this.checkPowerUpCollision(head);

        // 使用新的PowerUpSystem
        if (this.powerUpSystem) {
            this.powerUpSystem.update();
            this.powerUpSystem.checkCollision(head);
        }
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
        if (this.isTransparent) return; 
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

                // 增加連擊數並播放 combo 音效
                this.combo++;
                this.handleCombo();

                // 計算分數
                this.handleCorrectCollection(index, index === this.currentWordIndex);

                // 視覺效果
                this.showCollectedWord(food.word, index);
                this.triggerGlowEffect();

                // 讓蛇變長
                this.growSnake();

                // 檢查是否完成詞組
                if (this.correctFoods.every(f => f.collected)) {
                    // 添加完成獎勵
                    const completionScore = this.scoreConfig.completion;
                    this.handleCorrectCollection(index, index === this.currentWordIndex);
                    
                    // 播放完成時的紙碎動畫
                    if (this.confettiSystem) {
                        this.confettiSystem.celebrate();
                    }
                    
                    this.completedGreetings.push(this.currentWords.join(''));
                    this.showCompletionAnimation(this.currentWords);
                    

                    this.currentGreetingIndex++;
                    
                    if (this.currentGreetingIndex >= this.greetingsData.length) {
                        this.gameOver();
                        return;
                    }
                    
                    this.selectNextGreeting();
                }
            }
        });

        // 檢查誘餌食物碰撞
        this.decoyFoods.forEach((decoy, index) => {
            const decoyRect = {
                x: decoy.x,
                y: decoy.y,
                width: decoy.size,
                height: decoy.size
            };

            if (Collider2D.boxCollision(head, decoyRect)) {
                // 當碰到錯誤食物時重置 combo
                this.combo = 0;
                this.handleCombo();
                
                // 處理錯誤收集
                this.handleWrongCollection();
            }
        });
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
                this.handleCorrectCollection(this.currentWordIndex - 1, true);
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
            this.gameOver('你咬到自己了！');
            return;
        }

        this.snake.unshift(head);
        this.snake.pop();
    }

    gameOver(reason = '') {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        clearInterval(this.timer);
        if (this.audio) {
            this.audio.stopBGM();
        }
        
        // 設置遊戲結束原因
        this.gameOverReason = reason || '時間到！';
        
        // 隱藏遊戲界面元素
        document.querySelector('.game-container').classList.remove('game-started');
        
        this.showGameResult();
        
        // 更新排行榜顯示
        this.updateRankingData('score');
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

        // document.addEventListener('keydown', (e) => {
        //     if (this.isGameOver) return;
            
        //     switch(e.key) {
        //         case 'ArrowUp':
        //             this.changeDirection('up');  // 使用 changeDirection 方法
        //             break;
        //         case 'ArrowDown':
        //             this.changeDirection('down');
        //             break;
        //         case 'ArrowLeft':
        //             this.changeDirection('left');
        //             break;
        //         case 'ArrowRight':
        //             this.changeDirection('right');
        //             break;
        //     }
        // });

        // 添加難度選擇按鈕的事件監聽
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => 
                    b.classList.remove('selected'));
                btn.classList.add('selected');
                
                if (this.difficultySystem) {
                    this.difficultySystem.setDifficulty(btn.dataset.difficulty);
                }
            });
        });

        // 默認選中普通難度
        document.querySelector('[data-difficulty="NORMAL"]').classList.add('selected');

        // 添加 debug 相關按鍵
        // document.addEventListener('keydown', (e) => {
        //     if (e.key === 'F3') {  // 使用 F3 鍵切換 debug 模式
        //         this.toggleDebug();
        //     } else if (e.key === ' ' && this.isDebugging) {  // 空格鍵繼續遊戲
        //         this.isDebugging = false;
        //         this.hideDebugInfo();
        //         this.resumeGame();
        //     }
        // });
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
            this.gameOver('時間到！');
        }
    }

    // 添加顯示結果的方法
    showGameResult() {
        const resultElement = document.getElementById('gameResult');
        if (!resultElement) {
            console.error('找不到 gameResult 元素');
            return;
        }

        // 設置結束原因
        const reasonElement = resultElement.querySelector('.game-over-reason');
        if (reasonElement) {
            reasonElement.textContent = this.gameOverReason;
        }

        // 更新分數
        const scoreDisplay = resultElement.querySelector('.score-value');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }

        // 更新完成的祝賀詞列表
        const completedWordsList = resultElement.querySelector('#completedWordsList');
        if (completedWordsList) {
            completedWordsList.innerHTML = this.completedGreetings.map(greeting => `
                <tr>
                    <td>${greeting}</td>
                </tr>
            `).join('');
        }

        // 更新統計數據
        const stats = {
            totalCollected: resultElement.querySelector('#totalCollected'),
            perfectCollects: resultElement.querySelector('#perfectCollects'),
            maxCombo: resultElement.querySelector('#maxCombo'),
            bonusesList: resultElement.querySelector('#bonusesList')
        };

        if (stats.totalCollected) stats.totalCollected.textContent = this.stats.totalCollected;
        if (stats.perfectCollects) stats.perfectCollects.textContent = this.stats.perfectCollects;
        if (stats.maxCombo) stats.maxCombo.textContent = this.maxCombo;

        // 計算最終分數和獎勵
        const { finalScore, bonuses } = this.calculateFinalScore();

        // 更新獎勵列表
        if (stats.bonusesList) {
            stats.bonusesList.innerHTML = bonuses.map(bonus => `
                <div class="bonus-item">
                    <span>${bonus.text}</span>
                    <span>+${bonus.points}</span>
                </div>
            `).join('');
        }

        // 顯示結果界面
        resultElement.classList.remove('hidden');

        // 更新排行榜
        this.updateRankingData('score');
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
            if (this.audio) {
                this.audio.pauseBGM();
            }
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
            if (this.audio) {
                this.audio.playBGM();
            }
        }
    }

   


    // 新增：處理錯誤收集
    handleWrongCollection() {
        // 中斷連擊
        this.scoreSystem.breakCombo();
        
        // 顯示錯誤表情
        this.showEmoji('wrong', this.snake[0].x, this.snake[0].y);
        
        // 添加懲罰效果
        this.isPenalized = true;
        this.isTransparent = true;
        
        // 添加閃爍效果
        document.querySelector('.game-container').classList.add('transparent-state');
        
        // 1秒後解除移動懲罰
        setTimeout(() => {
            this.isPenalized = false;
        }, this.penaltyDuration);
        
        // 3秒後解除透明狀態
        setTimeout(() => {
            this.isTransparent = false;
            document.querySelector('.game-container').classList.remove('transparent-state');
        }, this.transparentDuration);
    }

    // 修改 breakCombo 方法
    breakCombo() {
        this.scoreSystem.breakCombo();
        // ... 其他代碼 ...
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
        if (this.controls) return;
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
        // this.glowEffect = true;
        // this.glowStartTime = Date.now();
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

    
    // 修改 drawPowerUps 方法
    drawPowerUps() {
        if (this.powerUpSystem) {
            this.powerUpSystem.drawPowerUps(this.ctx);
        }
    }


    // 修改使用道具的方法
    activatePowerUp(type) {
        if (this.powerUpSystem) {
            this.powerUpSystem.activatePowerUp(type);
        } else {
            // 舊的實現作為備用
            // ... 原有的道具啟動邏輯 ...
        }
    }

    // 添加設置難度的方法
    setDifficulty(difficultyLevel) {
        if (this.difficulties[difficultyLevel]) {
            this.currentDifficulty = difficultyLevel;
        }
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
        if (this.direction !== newDirection && this.audio) {
            this.audio.playSound('turn');
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

    // 修改使用特效系統的方法
    showEmoji(type, x, y) {
        if (!this.effects) {
            // 如果 EffectSystem 還沒準備好，使用舊的實現
            // ... 原有的實現保持不變
            return;
        }
        this.effects.showEmoji(type, x, y);
    }

    showCollectionEffect(x, y) {
        if (!this.effects) {
            // 如果 EffectSystem 還沒準備好，使用舊的實現
            // ... 原有的實現保持不變
            return;
        }
        this.effects.showCollectionEffect(x, y);
    }

    showCompletionEffect() {
        if (!this.effects) {
            // 如果 EffectSystem 還沒準備好，使用舊的實現
            // ... 原有的實現保持不變
            return;
        }
        this.effects.showCompletionEffect();
    }

    // 在 SnakeGame 類中添加
    initializeRanking() {
        // 綁定標籤切換事件
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有active類
                document.querySelectorAll('.tab-btn').forEach(btn => 
                    btn.classList.remove('active'));
                document.querySelectorAll('.ranking-tab').forEach(tab => 
                    tab.classList.remove('active'));
                
                // 添加active類到當前標籤
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab') + 'Ranking';
                document.getElementById(tabId).classList.add('active');
                
                // 更新排行榜數據
                this.updateRankingData(button.getAttribute('data-tab'));
            });
        });
    }

    updateRankingData(type) {
        const container = document.getElementById(type + 'Ranking');
        let data = [];
        
        switch(type) {
            case 'score':
                data = this.getScoreRanking();
                break;
            case 'combo':
                data = this.getComboRanking();
                break;
            case 'time':
                data = this.getTimeRanking();
                break;
        }
        
        container.innerHTML = data.map((item, index) => `
            <div class="ranking-item">
                <div class="rank-number">${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-name">${item.name}</div>
                    <div class="rank-score">${this.formatRankingValue(type, item.value)}</div>
                    <div class="rank-date">${item.date}</div>
                </div>
            </div>
        `).join('');
    }

    formatRankingValue(type, value) {
        switch(type) {
            case 'score':
                return `${value} 分`;
            case 'combo':
                return `${value} 連擊`;
            case 'time':
                return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
            default:
                return value;
        }
    }

    // 在 SnakeGame 類中添加假資料方法
    getScoreRanking() {
        return [
            { name: "玩家小明", value: 2500, date: "2024/03/20" },
            { name: "遊戲高手", value: 2100, date: "2024/03/19" },
            { name: "蛇蛇達人", value: 1800, date: "2024/03/18" },
            { name: "快樂玩家", value: 1500, date: "2024/03/17" },
            { name: "新手上路", value: 1200, date: "2024/03/16" }
        ];
    }

    getComboRanking() {
        return [
            { name: "連擊王", value: 15, date: "2024/03/20" },
            { name: "技術流", value: 12, date: "2024/03/19" },
            { name: "穩定派", value: 10, date: "2024/03/18" },
            { name: "練習生", value: 8, date: "2024/03/17" },
            { name: "初學者", value: 5, date: "2024/03/16" }
        ];
    }

    getTimeRanking() {
        return [
            { name: "神速玩家", value: 45, date: "2024/03/20" },
            { name: "閃電俠", value: 52, date: "2024/03/19" },
            { name: "急速手", value: 58, date: "2024/03/18" },
            { name: "穩健派", value: 65, date: "2024/03/17" },
            { name: "慢慢來", value: 75, date: "2024/03/16" }
        ];
    }

    // 在處理 combo 的地方
    handleCombo() {
        if (this.combo > 1) {  // 改為大於 1，表示至少連續答對 2 個字
            // 確保 combo 音效正在播放
            if (this.audio) {
                this.audio.startComboSound();
            }
            // 更新 combo 顯示
            let comboDisplay = document.querySelector('.combo-display');
            if (comboDisplay) {
                comboDisplay.textContent = `COMBO TIME x${this.combo}`;
                comboDisplay.style.display = 'block';
            } else {
                // 如果不存在則創建新的 combo 顯示
                comboDisplay = document.createElement('div');
                comboDisplay.className = 'combo-display';
                comboDisplay.textContent = `COMBO TIME x${this.combo}`;
                document.querySelector('.game-container').appendChild(comboDisplay);
            }
        } else {
            // 當 combo 結束時停止音效
            if (this.audio) {
                this.audio.stopComboSound();
            }
            // 隱藏 combo 顯示
            let comboDisplay = document.querySelector('.combo-display');
            if (comboDisplay) {
                comboDisplay.style.display = 'none';
            }
        }
    }

    // 在遊戲結束時也要確保停止音效
    gameOver() {
        if (this.audio) {
            this.audio.stopComboSound();
        }
        // ... 其他遊戲結束代碼 ...
    }

    // 在收集到字時
    collectFood() {
        // 播放收集音效
        if (this.audio) {
            this.audio.playSound('collect');
        }

        // ... 其他收集相關代碼 ...
    }

    // 在新題目出現時
    generateNewWords() {
        // 播放新題目音效
        if (this.audio) {
            this.audio.playSound('crash');
        }

        // 獲取新的題目
        if (this.currentGreetingIndex < this.greetings.length) {
            this.currentWords = this.greetings[this.currentGreetingIndex];
            // ... 其他生成題目的代碼 ...
        }
    }
}

window.onload = () => {
    new SnakeGame();
};