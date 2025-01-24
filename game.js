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

// 引入 ComboSystem
let ComboSystem;
import('./src/game/ComboSystem.js')
    .then(module => {
        ComboSystem = module.ComboSystem;
        console.log('ComboSystem 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 ComboSystem 模組:', err);
    });

// 引入 TimerSystem
let TimerSystem;
import('./src/game/TimerSystem.js')
    .then(module => {
        TimerSystem = module.TimerSystem;
        console.log('TimerSystem 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 TimerSystem 模組:', err);
    });

// 在文件頂部添加引入
let GameResultSystem;
import('./src/game/GameResultSystem.js')
    .then(module => {
        GameResultSystem = module.GameResultSystem;
        console.log('GameResult 模組已成功載入');
    })
    .catch(err => {
        console.error('無法載入 GameResult 模組:', err);
    });

import { CollectWordSystem } from './src/game/CollectWordSystem.js';
import { SpawnFoodSystem } from './src/game/SpawnFoodSystem.js';
import { VirtualJoystickSystem } from './src/game/VirtualJoystickSystem.js';
import { RuleSliderSystem } from './src/game/RuleSliderSystem.js';

class SnakeGame {
    constructor() {
        // 首先初始化基本屬性
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 檢測是否為移動設備
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // 設置畫布大小和 pixelSize
        this.setupCanvasSize();
        
        // 初始化蛇的位置
        this.snake = [
            {x: this.pixelSize * 2, y: this.pixelSize},
            {x: this.pixelSize, y: this.pixelSize},
            {x: 0, y: this.pixelSize}
        ];

        // 初始化 SpawnFoodSystem（移到這裡）
        this.spawnFoodSystem = new SpawnFoodSystem(this);
        
        // 然後再設置事件監聽和其他初始化
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupEventListeners();
        this.updateWordDisplay();
        this.drawInitialScreen();

        this.direction = 'right';
        this.words = ['龍', '馬', '精', '神'];
        this.currentWordIndex = 0;
        this.score = 0;
        this.gameLoop = null;
        this.isGameOver = true;

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
        this.moveSpeed = 0.1;  // 基礎移動速度
        
        // 修改遊戲循環的間隔時間，使動畫更流暢
        this.frameInterval = 1000/60; // 60fps 改為 30fps

        // 添加懲罰相關屬性
        this.isPenalized = false;
        this.penaltyDuration = 500;  // 從 1000 改為 500 毫秒（0.5秒）停止移動
        this.transparentDuration = 1500;  // 從 3000 改為 1500 毫秒（1.5秒）透明處罰時間
        this.isTransparent = false;


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
            }),
            new Promise(resolve => {
                if (ComboSystem) {
                    this.comboSystem = new ComboSystem(this);
                    resolve();
                } else {
                    const checkInterval = setInterval(() => {
                        if (ComboSystem) {
                            this.comboSystem = new ComboSystem(this);
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                }
            }),
            new Promise(resolve => {
                if (TimerSystem) {
                    this.timerSystem = new TimerSystem(this);
                    resolve();
                } else {
                    const checkInterval = setInterval(() => {
                        if (TimerSystem) {
                            this.timerSystem = new TimerSystem(this);
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                }
            }),
            new Promise(resolve => {
                if (GameResultSystem) {
                    this.gameResultSystem = new GameResultSystem(this);
                    resolve();
                } else {
                    const checkInterval = setInterval(() => {
                        if (GameResultSystem) {
                            this.gameResultSystem = new GameResultSystem(this);
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                }
            })
        ]).then(() => {
            console.log('✅ 所有遊戲系統初始化完成');
            // 初始化完成後再生成食物
            //this.spawnFood();
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
            // 移除這行
            // this.audio.playBGM();
        }

        // 初始化 ComboSystem
        if (ComboSystem) {
            this.comboSystem = new ComboSystem(this);
        }

        // 確保GameResultSystem最後初始化
        Promise.all([
            // ... 其他系統的初始化 ...
        ]).then(() => {
            if (GameResultSystem) {
                this.gameResultSystem = new GameResultSystem(this);
            }
        });

        // 設置初始速度倍率
        this.speedMultiplier = 1.0;

        // 初始化 CollectWordSystem
        if (CollectWordSystem) {
            this.collectWordSystem = new CollectWordSystem(this);
        }

        // 確保GameResultSystem初始化
        Promise.all([
            // ... 其他系統的初始化 ...
            new Promise(resolve => {
                if (GameResultSystem) {
                    this.gameResultSystem = new GameResultSystem(this);
                    resolve();
                } else {
                    const checkInterval = setInterval(() => {
                        if (GameResultSystem) {
                            this.gameResultSystem = new GameResultSystem(this);
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                }
            })
        ]).then(() => {
            console.log('所有系統初始化完成');
        });

        this.initializeUI();

        // 初始化虛擬搖桿系統
        this.virtualJoystick = new VirtualJoystickSystem(this);

        // 添加一個屬性來記錄已使用的題目索引
        this.usedGreetingIndices = new Set();  // 用來記錄已使用的題目索引

        // 初始化規則輪播系統
        this.ruleSlider = new RuleSliderSystem();
    }

    initializeUI() {
        // 添加遊戲說明按鈕事件
        const settingButton = document.getElementById('settingButton');
        const instructionPopup = document.querySelector('.instruction-popup');
        const instructionOverlay = document.querySelector('.instruction-overlay');
        const closeButton = document.querySelector('.instruction-close');
        const closeContainer = document.querySelector('.instruction-close-container');

        if (settingButton && instructionPopup && instructionOverlay) {
            settingButton.addEventListener('click', () => {
                instructionPopup.classList.add('active');
                instructionOverlay.classList.add('active');
                closeContainer.classList.add('active');  // 添加 active 類
            });

            // 關閉按鈕事件
            closeButton.addEventListener('click', () => {
                instructionPopup.classList.remove('active');
                instructionOverlay.classList.remove('active');
                closeContainer.classList.remove('active');  // 移除 active 類
            });

            // 點擊遮罩層關閉
            instructionOverlay.addEventListener('click', () => {
                instructionPopup.classList.remove('active');
                instructionOverlay.classList.remove('active');
                closeContainer.classList.remove('active');  // 移除 active 類
            });

            // 添加觸控滾動功能到遊戲說明
            this.enableTouchScroll(instructionPopup);
        }

        // 添加排行榜按鈕事件
        const rankingButton = document.getElementById('rankingButton');
        const rankingPopup = document.querySelector('.ranking-popup');
        const rankingOverlay = document.querySelector('.ranking-overlay');
        const rankingCloseButton = document.querySelector('.ranking-close');
        const rankingCloseContainer = document.querySelector('.ranking-close-container');

        if (rankingButton && rankingPopup && rankingOverlay) {
            rankingButton.addEventListener('click', () => {
                rankingPopup.classList.add('active', 'index-active');  // 添加 index-active
                rankingOverlay.classList.add('active');
                rankingCloseContainer.classList.add('active');
                // 更新排行榜數據
                this.updateRankingData('score');
            });

            // 關閉按鈕事件
            rankingCloseButton.addEventListener('click', () => {
                rankingPopup.classList.remove('active', 'index-active');  // 移除 index-active
                rankingOverlay.classList.remove('active');
                rankingCloseContainer.classList.remove('active');
            });

            // 點擊遮罩層關閉
            rankingOverlay.addEventListener('click', () => {
                rankingPopup.classList.remove('active', 'index-active');  // 移除 index-active
                rankingOverlay.classList.remove('active');
                rankingCloseContainer.classList.remove('active');
            });

            // 排行榜標籤切換
            const tabButtons = rankingPopup.querySelectorAll('.tab-btn');
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabType = button.dataset.tab;
                    this.updateRankingData(tabType);
                    
                    // 更新標籤狀態
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });
        }

        // 為遊戲結果的排行榜添加觸控滾動
        const gameResultRanking = document.querySelector('#gameResult .ranking-content');
        if (gameResultRanking) {
            this.enableTouchScroll(gameResultRanking);
        }

        // 為頁首排行榜添加觸控滾動
        const headerRanking = document.querySelector('.ranking-popup .ranking-content');
        if (headerRanking) {
            this.enableTouchScroll(headerRanking);
        }
    }

    // 優化觸控滾動方法
    enableTouchScroll(element) {
        let startY;
        let startScrollTop;
        let isTouching = false;

        element.addEventListener('touchstart', (e) => {
            // 只有當元素可以滾動時才阻止默認行為
            if (element.scrollHeight > element.clientHeight) {
                isTouching = true;
                startY = e.touches[0].pageY;
                startScrollTop = element.scrollTop;
                
                // 防止觸控時的回彈效果
                e.preventDefault();
            }
        }, { passive: false });

        element.addEventListener('touchmove', (e) => {
            if (!isTouching) return;
            
            const touch = e.touches[0];
            const deltaY = startY - touch.pageY;
            
            // 檢查是否到達滾動邊界
            if ((element.scrollTop === 0 && deltaY < 0) || 
                (element.scrollTop + element.clientHeight === element.scrollHeight && deltaY > 0)) {
                return;
            }
            
            element.scrollTop = startScrollTop + deltaY;
            e.preventDefault();
        }, { passive: false });

        element.addEventListener('touchend', () => {
            isTouching = false;
        });

        element.addEventListener('touchcancel', () => {
            isTouching = false;
        });
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
                if (this.timerSystem) {
                    this.timerSystem.startTimer();
                }

                // 隱藏結果顯示
                //this.hideGameResult();
                
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

                        // 重置道具系統
                        if (this.powerUpSystem) {
                            this.powerUpSystem.powerUps = [];
                            this.powerUpSystem.lastPowerUpSpawn = Date.now();
                            // 立即生成第一個道具
                            this.powerUpSystem.spawnPowerUp();
                            console.log('PowerUpSystem 已重置並生成初始道具');
                        }

                        // 顯示虛擬搖桿（在遊戲容器顯示後）
                        if (this.virtualJoystick) {
                            this.virtualJoystick.show();
                        }

                        // 開始播放背景音樂
                        if (this.audio) {
                            this.audio.playBGM();  // 在遊戲開始時播放背景音樂
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
            this.audio.playSound('crash');
            setTimeout(() => {
                this.audio.playSound('crash');
            }, 200);
        }

        const collectedWords = document.querySelector('.collected-words');
        collectedWords.classList.add('changing');
        
        // 直接隨機選擇一個題目索引，不考慮是否重複
        const randomIndex = Math.floor(Math.random() * this.greetingsData.length);
        
        // 更新當前索引
        this.currentGreetingIndex = randomIndex;
        
        // 更新當前詞組和錯誤詞組
        const greeting = this.greetingsData[this.currentGreetingIndex];
        this.wrongWords = greeting.wrong_words || [];
        
        // 使用 CollectWordSystem 設置新的詞組
        this.collectWordSystem.setNewWords(greeting.words);
        this.currentWords = greeting.words;
        
        // 重新設置畫布大小
        this.setupCanvasSize();
        
        // 生成新的食物
        if (!isInitial) {
            this.spawnFoodSystem.spawnFood();
        }
        
        setTimeout(() => {
            collectedWords.classList.remove('changing');
        }, 500);

        if (isInitial) {
            this.setupCanvasSize();
            this.spawnFoodSystem.spawnFood();
        }

        // 重置道具系統的計數
        if (this.powerUpSystem) {
            this.powerUpSystem.resetRoundPowerUps();
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

    // 修改使用計分系統的方法
    handleCorrectCollection(index, isCorrectOrder) {
        // 使用 ScoreSystem 計算分數
        const { score, bonusText } = this.scoreSystem.calculateScore(index, isCorrectOrder);
        
        // 更新分數並顯示效果
        this.scoreSystem.updateScore(score, this.snake[0].x, this.snake[0].y, bonusText);
        
        // 增加連擊
        this.scoreSystem.increaseCombo();
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
                    y + this.pixelSize/2 // 向下偏移 10%
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
                const headSize = this.pixelSize * 1.2; // 放大 20%
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

        // 獲取並繪製食物
        const { correctFoods, decoyFoods } = this.spawnFoodSystem.getAllFoods();


        // 繪製道具
        if (this.powerUpSystem) {
            this.powerUpSystem.drawPowerUps(this.ctx);
        }

        if (this.isDebugging) {
            this.updateDebugInfo();
        }

        // 只保留 SpawnFoodSystem 的繪製
        if (this.spawnFoodSystem) {
            this.spawnFoodSystem.draw();
        }
    }

    move() {
        if (this.isPenalized) return;

        // 使用速度倍率計算實際移動速度
        this.animationProgress += (this.moveSpeed * this.speedMultiplier);
        
        // 當動畫進度達到或超過1時，完成一次完整移動
        if (this.animationProgress >= 1) {
            const head = {...this.snake[0]};
            
            // 根據方向更新頭部位置
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

            // 檢查是否會撞到自己
            for (let i = 4; i < this.snake.length; i++) {
                const segment = this.snake[i];
                if (head.x === segment.x && head.y === segment.y) {
                    this.handleGameOver('你咬到自己了！');
                    return;
                }
            }

            // 更新蛇的位置
            this.snake.unshift(head);
            this.snake.pop();
            
            this.animationProgress = 0;
            this.lastPosition = JSON.parse(JSON.stringify(this.snake));

            // 檢查食物和道具碰撞
            this.checkFoodCollision(head);  // 移到這裡
            if (this.powerUpSystem) {
                this.powerUpSystem.checkCollision(head);
            }
        }
    }

    handleGameOver(reason) {
        console.log('遊戲結束！原因：', reason);
        
        // 立即結束遊戲
        this.isGameOver = true;
        this.isPaused = true;
        
        // 隱藏遊戲容器
        document.querySelector('.game-container').classList.remove('game-started');
        
        // 停止所有系統
        if (this.powerUps) {
            this.powerUps.deactivateAllPowerUps();
        }
        if (this.audio) {
            this.audio.stopBGM();
            this.audio.stopComboSound();
        }
        if (this.timerSystem) {
            this.timerSystem.pauseTimer();
        }
        
        // 清除遊戲循環
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 更新最終分數和統計資料
        //this.updateGameStats();
        
        // 確保 gameResultSystem 存在
        if (!this.gameResultSystem) {
            console.warn('GameResultSystem 未初始化，正在創建新實例');
            this.gameResultSystem = new GameResultSystem(this);
        }
        
        // 延遲一幀顯示結果，確保 DOM 更新完成
        requestAnimationFrame(() => {
            this.gameResultSystem.showGameResult(reason);
        });
        
        // 清理道具系統
        if (this.powerUpSystem) {
            this.powerUpSystem.cleanup();
        }
        
        // 顯示 game-intro
        document.querySelector('.game-intro').classList.remove('hide');

        // 隱藏虛擬搖桿
        if (this.virtualJoystick) {
            this.virtualJoystick.hide();
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
    checkFoodCollision(head) {
        if (this.isTransparent) return;

        // 縮小碰撞區域為原來的 60%
        const collisionSize = this.pixelSize * 0.6;
        const offset = (this.pixelSize - collisionSize) / 2;

        const headRect = {  // 改名為 headRect
            x: head.x + offset,
            y: head.y + offset,
            width: collisionSize,
            height: collisionSize
        };

        const { correctFoods, decoyFoods } = this.spawnFoodSystem.getAllFoods();

        // 檢查正確食物碰撞
        correctFoods.forEach((food, index) => {
            if (food.collected) return;

            const foodRect = {
                x: food.x + offset,
                y: food.y + offset,
                width: collisionSize,
                height: collisionSize
            };

            if (Collider2D.boxCollision(headRect, foodRect)) {  // 使用 headRect
                food.collected = true;

                // 播放收集音效
                if (this.audio) {
                    this.audio.playSound('collect');  // 添加這行
                }

                // 顯示正確表情
                if (this.effects) {
                    this.effects.showEmoji('correct', head.x, head.y);
                }

                // 更新連擊系統
                if (this.comboSystem) {
                    this.comboSystem.increaseCombo();
                }

                // 計算分數 - 修改這部分
                this.handleCorrectCollection(index, this.collectWordSystem.isCorrectOrder(index));

                // 使用 CollectWordSystem 收集文字
                this.collectWordSystem.collectWord(food.word, index);
                this.triggerGlowEffect();

                // 讓蛇變長
                this.growSnake();

                // 檢查是否完成詞組
                if (this.collectWordSystem.isCurrentWordComplete()) {
                    // 添加完成獎勵
                    const completionScore = this.scoreConfig.completion;
                    this.handleCorrectCollection(index, this.collectWordSystem.isCorrectOrder(index));
                    
                    // 播放完成時的紙碎動畫
                    if (this.confettiSystem) {
                        this.confettiSystem.celebrate();
                    }
                    
                    this.collectWordSystem.showCompletionAnimation(this.currentWords);
                    
                    // 移除 currentGreetingIndex 的累加和檢查
                    // this.currentGreetingIndex++;
                    // if (this.currentGreetingIndex >= this.greetingsData.length) {
                    //     this.gameOver();
                    //     return;
                    // }
                    
                    // 直接選擇新題目
                    this.selectNextGreeting();
                }
            }
        });

        // 檢查誘餌食物碰撞
        decoyFoods.forEach((decoy, index) => {
            const decoyRect = {
                x: decoy.x + offset,
                y: decoy.y + offset,
                width: collisionSize,
                height: collisionSize
            };

            if (Collider2D.boxCollision(headRect, decoyRect)) {
                if (!this.isInvincible) {
                    // 扣分並顯示扣分效果
                    const canvasRect = this.canvas.getBoundingClientRect();
                    const screenX = canvasRect.left + decoy.x + this.pixelSize/2;
                    const screenY = canvasRect.top + decoy.y - 20;
                    this.scoreSystem.deductScore(screenX, screenY);

                    // 顯示錯誤表情
                    if (this.effects) {
                        this.effects.showEmoji('wrong', head.x, head.y);
                    }
                    
                    // 移除錯誤的食物
                    this.spawnFoodSystem.removeFood(decoy);
                    
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
            }
        });
    }

    // 修改蛇身碰撞檢測
    checkCollision(head) {
        // 縮小碰撞區域為原來的 60%
        const collisionSize = this.pixelSize * 0.6;
        const offset = (this.pixelSize - collisionSize) / 2;

        const headArea = {
            x: head.x + offset,
            y: head.y + offset,
            width: collisionSize,
            height: collisionSize
        };

        return this.snake.some(segment => {
            const segmentArea = {
                x: segment.x + offset,
                y: segment.y + offset,
                width: collisionSize,
                height: collisionSize
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
        clearInterval(this.timerSystem.timer);
        if (this.audio) {
            this.audio.stopBGM();
        }
        
        // 設置遊戲結束原因
        this.gameOverReason = reason || '時間到！';
        
        // 隱藏遊戲界面元素
        document.querySelector('.game-container').classList.remove('game-started');
        
        // 使用 GameResultSystem 顯示結果
        if (this.gameResultSystem) {
            this.gameResultSystem.showGameResult(this.gameOverReason);
        }
        
        // 更新排行榜顯示
        this.updateRankingData('score');

        // 隱藏虛擬搖桿
        if (this.virtualJoystick) {
            this.virtualJoystick.hide();
        }
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            // 添加隱藏類
            document.querySelector('.game-intro').classList.add('hide');
            
            // 初始化遊戲
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            
            this.initializeGame();
            this.gameLoop = setInterval(() => {
                this.move();
                this.draw();
            }, this.frameInterval);
        });

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
            clearInterval(this.timerSystem.timer);
            this.pausedTimeRemaining = this.remainingTime;

            // 暫停背景音樂
            if (this.audio) {
                this.audio.pauseBGM();
            }
            if (this.timerSystem) {
                this.timerSystem.pauseTimer();
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
            if (this.timerSystem) {
                this.timerSystem.resumeTimer();
            }
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
        this.scoreSystem.breakCombo();  // 使用 scoreSystem 而不是 comboSystem
            
            // 顯示錯誤表情
        if (this.effects) {
            this.effects.showEmoji('wrong', this.snake[0].x, this.snake[0].y);
        }
            
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
        // 設定每次增長的段落數量
        const growthAmount = 2;  // 改為 2 個段落（原本是 1 個）
        
        for (let i = 0; i < growthAmount; i++) {
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
        // 獲取視窗大小
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isSmallScreen = windowWidth <= 430;

        // 保存舊的 pixelSize
        const oldPixelSize = this.pixelSize;

        // 根據設備類型設置不同的像素大小
        const newPixelSize = this.isMobile ? 
            (isSmallScreen ? 
                Math.min(windowWidth, windowHeight) * 0.08 : // 更小的手機螢幕
                Math.min(windowWidth, windowHeight) * 0.1    // 一般手機螢幕
            ) : 
            Math.min(windowWidth, windowHeight) * 0.05;  // 電腦版的大小調小

        // 只在首次初始化或視窗大小真正改變時才更新 pixelSize
        if (!this.pixelSize || Math.abs(this.pixelSize - newPixelSize) > 0.1) {
            this.pixelSize = newPixelSize;
        }

        // 設置畫布大小（只在真正需要時更新）
        if (this.canvas.width !== windowWidth || this.canvas.height !== windowHeight) {
            this.canvas.width = windowWidth;
            this.canvas.height = windowHeight;
        }

        // 只在 pixelSize 真正改變時才調整蛇的位置
        if (this.snake && oldPixelSize !== this.pixelSize) {
            this.snake = this.snake.map(segment => ({
                x: Math.round(segment.x / this.pixelSize) * this.pixelSize,
                y: Math.round(segment.y / this.pixelSize) * this.pixelSize
            }));
        }
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
        if (this.comboSystem.getMaxCombo() >= 5) {
            const comboBonus = this.comboSystem.getMaxCombo() * 100;
            finalScore += comboBonus;
            bonuses.push({
                text: `最高連擊 x${this.comboSystem.getMaxCombo()}`,
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
            combo: this.comboSystem.getCombo(),
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

    update() {
        if (this.isGameOver || this.isPaused) return;

        // 更新蛇的位置
        this.move();
        
        // 檢查碰撞
        const head = this.snake[0];
        if (this.checkCollision(head)) {
            console.log('檢測到自身碰撞！');
            this.gameOver('你咬到自己了！');
            return;
        }

        // 更新道具系統
        if (this.powerUpSystem) {
            this.powerUpSystem.update();  // 只更新道具系統，不檢查碰撞
        }

        // 檢查連擊時間
        if (this.combo && !this.combo.isInComboWindow()) {
            this.combo.resetCombo();
        }

        // 繪製遊戲畫面
        this.draw();
    }

    // 添加更新遊戲統計資料的方法
    // updateGameStats() {
    //     // 現有的統計資料更新...
    //     this.stats = {
    //         ...this.stats,
    //         finalScore: this.score,
    //         maxCombo: this.comboSystem ? this.comboSystem.getMaxCombo() : 0,
    //         completedWords: this.completedGreetings.length,
    //         gameTime: Math.floor((Date.now() - this.startTime) / 1000)
    //     };
        
        
    //     // 更新 UI 顯示
    //     const finalScoreElement = document.getElementById('finalScore');
    //     const totalCollectedElement = document.getElementById('totalCollected');
    //     const perfectCollectsElement = document.getElementById('perfectCollects');
    //     const maxComboElement = document.getElementById('maxCombo');

        
    //     if (finalScoreElement) finalScoreElement.textContent = this.score;
    //     if (totalCollectedElement) totalCollectedElement.textContent = this.stats.totalCollected || 0;
    //     if (perfectCollectsElement) perfectCollectsElement.textContent = this.stats.perfectCollects || 0;
    //     if (maxComboElement) maxComboElement.textContent = this.stats.maxCombo || 0;
        
        
    //     console.log('遊戲統計資料已更新:', this.stats);
    //     console.log('遊戲結束，最終分數:', this.score);
    // }

    startGame() {
        // ... 其他開始遊戲代碼 ...
        
        // 顯示虛擬搖桿
        if (this.virtualJoystick) {
            this.virtualJoystick.show();
        }
    }

 
}

window.onload = () => {
    new SnakeGame();
};