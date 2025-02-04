// 引入 Collider2D
let Collider2D;
import('../game/Collider2D.js')
    .then(module => {
        Collider2D = module.Collider2D;
        console.log('✓ PowerUpSystem: Collider2D 模組已載入');
    })
    .catch(err => {
        console.error('✗ PowerUpSystem: 無法載入 Collider2D 模組:', err);
    });

export class PowerUpSystem {
    constructor(game) {
        this.game = game;
        this.powerUps = [];
        this.powerUpImages = {};
        this.activePowerUps = new Map();
        
        // 修改道具生成相關設置
        this.maxPowerUpsPerRound = 3;  // 每題目最多3個道具
        this.currentRoundPowerUps = 0;  // 當前題目已生成的道具數量
        this.powerUpSpawnInterval = 5000;  // 固定間隔5秒
        this.lastPowerUpSpawn = 0;  // 初始化為0，確保第一個道具會立即生成
        
        // 初始化道具圖片和其他設置
        this.initializePowerUps();
        
        // 開始道具生成計時器
        this.startPowerUpTimer();
    }

    // 添加道具生成計時器
    startPowerUpTimer() {
        // 清除可能存在的舊計時器
        if (this.powerUpTimer) {
            clearInterval(this.powerUpTimer);
        }

        // 設置新的計時器，每5秒檢查一次是否需要生成道具
        this.powerUpTimer = setInterval(() => {
            if (this.currentRoundPowerUps < this.maxPowerUpsPerRound) {
                this.spawnPowerUp();
                this.currentRoundPowerUps++;
                console.log(`已生成第 ${this.currentRoundPowerUps} 個道具，共 ${this.maxPowerUpsPerRound} 個`);
            }
        }, this.powerUpSpawnInterval);
    }

    // 修改重置方法
    resetRoundPowerUps() {
        // 清除現有的道具
        this.powerUps = [];
        // 重置計數器
        this.currentRoundPowerUps = 0;
        // 重置最後生成時間
        this.lastPowerUpSpawn = 0;  // 設為0確保立即生成第一個道具
        
        // 重新啟動計時器
        this.startPowerUpTimer();
        
        // 立即生成第一個道具
        this.spawnPowerUp();
        this.currentRoundPowerUps++;
        
        console.log('道具系統已重置，並生成第一個道具');
    }

    // 清理方法，在遊戲結束時調用
    cleanup() {
        if (this.powerUpTimer) {
            clearInterval(this.powerUpTimer);
            this.powerUpTimer = null;
        }
    }

    initializePowerUps() {
        try {
            // 加載道具圖片
            Object.entries(this.powerUpTypes).forEach(([type, config]) => {
                const img = new Image();
                img.src = config.image;
                this.powerUpImages[type] = img;
            });
            console.log('✓ 道具圖片載入完成');
        } catch (error) {
            console.error('✗ 道具圖片載入失敗:', error);
        }
    }

    createNotificationElement() {
        this.powerUpNotification = document.createElement('div');
        this.powerUpNotification.className = 'powerup-notification';
        // 創建圖示容器
        this.powerUpIcon = document.createElement('img');
        this.powerUpIcon.className = 'powerup-icon';
        this.powerUpText = document.createElement('span');
        
        // 添加到通知元素中
        this.powerUpNotification.appendChild(this.powerUpIcon);
        this.powerUpNotification.appendChild(this.powerUpText);
        document.body.appendChild(this.powerUpNotification);
    }

    showNotification(text, duration) {
        if (!this.powerUpNotification) return;
        
        // 設置文字
        this.powerUpText.textContent = text;
        
        // 移除所有道具相關的 class
        this.powerUpNotification.classList.remove('speedup-powerup', 'invincible-powerup', 'freeze-powerup');
        
        // 根據效果類型設置對應的圖示和背景顏色
        if (text.includes('時間')) {
            this.powerUpIcon.src = 'img/tool-timer.png';
            this.powerUpNotification.classList.add('freeze-powerup');
        } else if (text.includes('加速')) {
            this.powerUpIcon.src = 'img/tool-flash.png';
            this.powerUpNotification.classList.add('speedup-powerup');
        } else if (text.includes('無敵')) {
            this.powerUpIcon.src = 'img/tool-star.png';
            this.powerUpNotification.classList.add('invincible-powerup');
        }
        
        this.powerUpNotification.classList.add('active');

        setTimeout(() => {
            this.powerUpNotification.classList.remove('active');
        }, duration);
    }

    activatePowerUp(type) {
        try {
            const powerUpConfig = this.powerUpTypes[type];
            if (!powerUpConfig) {
                throw new Error(`未知的道具類型: ${type}`);
            }

            // 顯示效果提示
            this.showNotification(`${powerUpConfig.name}效果啟動！`, powerUpConfig.duration);
            // 顯示效果時間
            this.showEffectDuration(powerUpConfig);

            // 啟動效果
            powerUpConfig.effect();

            // 設置定時器來重置效果
            const timer = setTimeout(() => {
                powerUpConfig.reset();
                this.activePowerUps.delete(type);
                // 顯示效果結束提示
                this.showNotification(`${powerUpConfig.name}效果結束`, 1000);
            }, powerUpConfig.duration);

            // 儲存定時器引用
            this.activePowerUps.set(type, timer);
            console.log(`✓ 道具 ${powerUpConfig.name} 已啟動`);
        } catch (error) {
            console.error('✗ 道具啟動失敗:', error);
        }
    }

    showEffectDuration(powerUpConfig) {
        // 創建效果持續時間顯示
        const durationDisplay = document.createElement('div');
        durationDisplay.className = 'effect-duration-display';
        
        // 根據不同道具類型設置不同的文字和樣式
        let text = '';
        switch(powerUpConfig.name) {
            case '時間暫停':
                text = `時間暫停 ${powerUpConfig.duration/1000}秒`;
                durationDisplay.classList.add('freeze-effect');
                break;
            case '加速':
                text = `加速 ${powerUpConfig.duration/1000}秒`;
                durationDisplay.classList.add('speed-effect');
                break;
            case '無敵':
                text = `無敵 ${powerUpConfig.duration/1000}秒`;
                durationDisplay.classList.add('invincible-effect');
                break;
        }
        
        durationDisplay.textContent = text;
        document.querySelector('.game-container').appendChild(durationDisplay);
        
        // 添加動畫
        requestAnimationFrame(() => {
            durationDisplay.classList.add('active');
        });
        
        // 動畫結束後移除元素
        durationDisplay.addEventListener('animationend', () => {
            durationDisplay.remove();
        });
    }

    deactivateAllPowerUps() {
        try {
            this.activePowerUps.forEach((timer, type) => {
                clearTimeout(timer);
                this.powerUpTypes[type].reset();
            });
            this.activePowerUps.clear();
            console.log('✓ 所有道具效果已清除');
        } catch (error) {
            console.error('✗ 清除道具效果失敗:', error);
        }
    }

    update() {
        const currentTime = Date.now();
        const timeSinceLastSpawn = currentTime - this.lastPowerUpSpawn;
        
        // 添加調試信息
        console.log('PowerUpSystem 狀態:', {
            currentRoundPowerUps: this.currentRoundPowerUps,
            maxPowerUpsPerRound: this.maxPowerUpsPerRound,
            timeSinceLastSpawn: timeSinceLastSpawn,
            spawnInterval: this.powerUpSpawnInterval,
            shouldSpawn: timeSinceLastSpawn >= this.powerUpSpawnInterval
        });
        
        // 檢查是否需要生成新道具
        if (this.currentRoundPowerUps < this.maxPowerUpsPerRound && 
            timeSinceLastSpawn >= this.powerUpSpawnInterval) {
            
            this.spawnPowerUp();
            this.lastPowerUpSpawn = currentTime;
            this.currentRoundPowerUps++;
            
            console.log(`已生成第 ${this.currentRoundPowerUps} 個道具，共 ${this.maxPowerUpsPerRound} 個`);
        }
    }

    spawnPowerUp() {
        try {
            // 只使用時間暫停和無敵道具
            const availableTypes = ['TIME_FREEZE', 'INVINCIBLE'];
            const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

            // 獲取遊戲區域的邊界
            const margin = this.game.pixelSize * 2;
            const headerHeight = document.querySelector('.game-header').getBoundingClientRect().height;
            
            // 生成隨機位置
            let x, y;
            let validPosition = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!validPosition && attempts < maxAttempts) {
                x = Math.floor(Math.random() * (this.game.canvas.width - margin * 2)) + margin;
                y = Math.floor(Math.random() * (this.game.canvas.height - headerHeight - margin * 2)) + headerHeight + margin;
                
                // 檢查是否與蛇身重疊
                validPosition = !this.game.snake.some(segment => 
                    Math.abs(segment.x - x) < this.game.pixelSize * 2 && 
                    Math.abs(segment.y - y) < this.game.pixelSize * 2
                );
                
                attempts++;
            }

            // 創建新的道具
            const newPowerUp = {
                type: randomType,
                x: x,
                y: y,
                size: this.game.pixelSize,
                collected: false
            };
            
            this.powerUps.push(newPowerUp);
            console.log(`✓ 生成了新的 ${this.powerUpTypes[randomType].name} 道具，位置: (${x}, ${y})`);
        } catch (error) {
            console.error('✗ 生成道具失敗:', error);
        }
    }

    // 添加繪製道具的方法
    drawPowerUps(ctx) {
        try {
            this.powerUps.forEach(powerUp => {
                if (!powerUp.collected) {
                    const img = this.powerUpImages[powerUp.type];
                    if (img && img.complete) {
                        ctx.drawImage(
                            img,
                            powerUp.x,
                            powerUp.y,
                            powerUp.size,
                            powerUp.size
                        );
                    }
                }
            });
        } catch (error) {
            console.error('✗ 繪製道具失敗:', error);
        }
    }

    // 添加碰撞檢測方法
    checkCollision(headPosition) {
        if (!this.powerUps) return;

        // 使用 filter 而不是 forEach，這樣我們可以同時移除已收集的道具
        this.powerUps = this.powerUps.filter((powerUp, index) => {
            if (powerUp.collected) return false;  // 已收集的道具直接移除

            // 創建碰撞檢測區域
            const head = {
                x: headPosition.x,
                y: headPosition.y,
                width: this.game.pixelSize,
                height: this.game.pixelSize
            };

            const powerUpRect = {
                x: powerUp.x,
                y: powerUp.y,
                width: powerUp.size,
                height: powerUp.size
            };

            // 檢查是否碰撞
            if (Collider2D.boxCollision(head, powerUpRect)) {
                // 顯示收集效果
                if (this.game.effects) {
                    this.game.effects.showEmoji('powerup', powerUp.x, powerUp.y);
                }

                // 啟動道具效果
                this.activatePowerUp(powerUp.type);
                
                // 播放收集音效
                if (this.game.audio) {
                    this.game.audio.playSound('powerup');
                }

                return false;  // 移除已收集的道具
            }

            return true;  // 保留未收集的道具
        });
    }

    // 定義道具類型
    powerUpTypes = {
        SPEED: {
            name: '加速',
            color: '#ffff00',
            duration: 5000,
            image: 'img/tool-flash.png',
            effect: () => {
                this.game.speedMultiplier = 3.0;  // 加速時的速度
                document.querySelector('.game-container').classList.add('speed-up-state');
                if (this.game.sounds) {
                    this.game.sounds.powerup.play();
                }
                this.game.isSpeedUp = true;
                console.log('✓ 速度加成效果已啟動，當前速度倍率:', this.game.speedMultiplier);
            },
            reset: () => {
                this.game.speedMultiplier = 1.0;  // 確保重置為基礎速度
                document.querySelector('.game-container').classList.remove('speed-up-state');
                this.game.isSpeedUp = false;
                console.log('✓ 速度加成效果已重置');
            }
        },
        INVINCIBLE: {
            name: '無敵',
            color: '#ff00ff',
            duration: 3000,
            image: 'img/tool-star.png',
            effect: () => {
                this.game.isInvincible = true;
                // 添加無敵狀態的視覺效果
                document.querySelector('.game-container').classList.add('invincible-state');
                if (this.game.sounds) {
                    this.game.sounds.powerup.play();
                }
                console.log('✓ 無敵效果已啟動');
            },
            reset: () => {
                this.game.isInvincible = false;
                // 移除無敵狀態的視覺效果
                document.querySelector('.game-container').classList.remove('invincible-state');
                console.log('✓ 無敵效果已重置');
            }
        },
        TIME_FREEZE: {
            name: '時間暫停',
            color: '#00ffff',
            duration: 3000,
            image: 'img/tool-timer.png',
            effect: () => {
                if (this.game.timerSystem) {
                    this.game.timerSystem.freezeTime();
                }
                if (this.game.sounds) {
                    this.game.sounds.powerup.play();
                }
                // 添加閃光動畫
                document.querySelector('.game-container').classList.add('time-freeze-effect');
                console.log('✓ 時間暫停效果已啟動');
            },
            reset: () => {
                if (this.game.timerSystem) {
                    this.game.timerSystem.unfreezeTime();
                }
                // 移除閃光動畫
                document.querySelector('.game-container').classList.remove('time-freeze-effect');
                console.log('✓ 時間暫停效果已重置');
            }
        }
    };
} 