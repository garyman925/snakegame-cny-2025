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
        this.powerUpSpawnInterval = 10000;
        this.lastPowerUpSpawn = 0;
        
        // 定義道具類型
        this.powerUpTypes = {
            SPEED: {
                name: '加速',
                color: '#ffff00',
                duration: 5000,
                image: 'img/tool-flash.png',
                effect: () => {
                    this.game.speedMultiplier = 1.5;
                    if (this.game.sounds) {
                        this.game.sounds.powerup.play();
                    }
                    this.game.isSpeedUp = true;
                    console.log('✓ 速度加成效果已啟動');
                },
                reset: () => {
                    this.game.speedMultiplier = 1;
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
                    if (this.game.sounds) {
                        this.game.sounds.powerup.play();
                    }
                    console.log('✓ 無敵效果已啟動');
                },
                reset: () => {
                    this.game.isInvincible = false;
                    console.log('✓ 無敵效果已重置');
                }
            },
            TIME_FREEZE: {
                name: '時間暫停',
                color: '#00ffff',
                duration: 3000,
                image: 'img/tool-timer.png',
                effect: () => {
                    this.game.isTimeFrozen = true;
                    if (this.game.sounds) {
                        this.game.sounds.powerup.play();
                    }
                    this.game.frozenTimeRemaining = this.game.endTime - Date.now();
                    console.log('✓ 時間暫停效果已啟動');
                },
                reset: () => {
                    this.game.isTimeFrozen = false;
                    this.game.endTime = Date.now() + this.game.frozenTimeRemaining;
                    console.log('✓ 時間暫停效果已重置');
                }
            }
        };

        this.initializePowerUps();
        console.log('✓ PowerUpSystem 初始化完成');

        // 添加提示元素容器
        this.powerUpNotification = null;
        this.createNotificationElement();
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
        document.body.appendChild(this.powerUpNotification);
    }

    showNotification(text, duration) {
        if (!this.powerUpNotification) return;
        
        this.powerUpNotification.textContent = text;
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
        // 更新道具相關的邏輯
        const currentTime = Date.now();
        if (currentTime - this.lastPowerUpSpawn >= this.powerUpSpawnInterval) {
            this.spawnPowerUp();
            this.lastPowerUpSpawn = currentTime;
        }
    }

    spawnPowerUp() {
        try {
            const types = Object.keys(this.powerUpTypes);
            const randomType = types[Math.floor(Math.random() * types.length)];

            // 獲取遊戲區域的邊界
            const margin = this.game.pixelSize * 2;
            const headerHeight = document.querySelector('.game-header').getBoundingClientRect().height;
            
            // 生成隨機位置
            const x = Math.floor(Math.random() * (this.game.canvas.width - margin * 2)) + margin;
            const y = Math.floor(Math.random() * (this.game.canvas.height - headerHeight - margin * 2)) + headerHeight + margin;

            // 創建新的道具
            this.powerUps.push({
                type: randomType,
                x: x,
                y: y,
                size: this.game.pixelSize,
                collected: false
            });

            console.log(`✓ 生成了新的 ${this.powerUpTypes[randomType].name} 道具`);
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

    // 添加檢查碰撞的方法
    checkCollision(headPosition) {
        try {
            // 確保 Collider2D 已載入
            if (!Collider2D) {
                console.warn('✗ PowerUpSystem: Collider2D 尚未準備好');
                return;
            }

            const head = {
                x: headPosition.x,
                y: headPosition.y,
                width: this.game.pixelSize,
                height: this.game.pixelSize
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
                        this.game.showEmoji('speed', headPosition.x, headPosition.y);
                    } else if (powerUp.type === 'INVINCIBLE') {
                        this.game.showEmoji('star', headPosition.x, headPosition.y);
                    }

                    // 啟動道具效果
                    this.activatePowerUp(powerUp.type);
                    console.log(`✓ 收集到 ${this.powerUpTypes[powerUp.type].name} 道具`);
                }
            });
        } catch (error) {
            console.error('✗ PowerUpSystem: 檢查道具碰撞失敗:', error);
        }
    }
} 