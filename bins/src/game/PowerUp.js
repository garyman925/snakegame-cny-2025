import { gameConfig } from '../config/gameConfig.js';
import { Collider2D } from '../utils/Collider.js';

export class PowerUpSystem {
    constructor(game) {
        this.game = game;
        this.powerUps = [];
        this.activePowerUps = new Map();
        
        // 加載道具圖片
        this.powerUpImages = {
            SPEED: this.loadImage('img/tool-star.png')
        };

        // 定義道具類型
        this.powerUpTypes = {
            SPEED: {
                name: '加速',
                duration: 5000,
                effect: this.applySpeedEffect.bind(this),
                reset: this.resetSpeedEffect.bind(this),
                probability: 0.7
            }
        };
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    spawnPowerUp() {
        // 隨機選擇道具類型
        const type = this.getRandomPowerUpType();
        if (!type) return;

        // 設置安全邊距
        const margin = this.game.snake.pixelSize * 2;
        const canvas = document.getElementById('gameCanvas');
        
        // 計算隨機位置
        const x = Math.floor(Math.random() * (canvas.width - margin * 2) + margin);
        const y = Math.floor(Math.random() * (canvas.height - margin * 2) + margin);

        // 創建道具
        const powerUp = {
            type: type,
            x: x,
            y: y,
            size: this.game.snake.pixelSize,
            collected: false,
            animation: {
                rotation: 0,
                scale: 1
            }
        };

        this.powerUps.push(powerUp);
    }

    getRandomPowerUpType() {
        const types = Object.entries(this.powerUpTypes);
        const totalProbability = types.reduce((sum, [_, type]) => sum + type.probability, 0);
        let random = Math.random() * totalProbability;

        for (const [type, config] of types) {
            random -= config.probability;
            if (random <= 0) {
                return type;
            }
        }
        return null;
    }

    checkCollisions(headPosition) {
        const head = {
            x: headPosition.x,
            y: headPosition.y,
            width: this.game.snake.pixelSize,
            height: this.game.snake.pixelSize
        };

        this.powerUps = this.powerUps.filter(powerUp => {
            if (powerUp.collected) return false;

            const powerUpRect = {
                x: powerUp.x,
                y: powerUp.y,
                width: powerUp.size,
                height: powerUp.size
            };

            if (Collider2D.boxCollision(head, powerUpRect)) {
                this.collectPowerUp(powerUp, headPosition);
                return false;
            }
            return true;
        });
    }

    collectPowerUp(powerUp, position) {
        // 顯示收集效果
        this.game.effects.showEmoji('speed', position.x, position.y);
        
        // 應用道具效果
        const type = this.powerUpTypes[powerUp.type];
        if (type) {
            // 如果已有相同效果，先重置
            if (this.activePowerUps.has(powerUp.type)) {
                clearTimeout(this.activePowerUps.get(powerUp.type));
                type.reset();
            }

            // 應用新效果
            type.effect();
            
            // 設置效果持續時間
            const timeout = setTimeout(() => {
                type.reset();
                this.activePowerUps.delete(powerUp.type);
            }, type.duration);

            this.activePowerUps.set(powerUp.type, timeout);

            // 顯示持續時間
            this.game.effects.showSpeedupTimer(type.duration / 1000);
        }
    }

    applySpeedEffect() {
        const currentSpeed = this.game.snake.moveSpeed;
        this.game.snake.setMoveSpeed(currentSpeed * 1.5);
    }

    resetSpeedEffect() {
        this.game.snake.setMoveSpeed(0.15);
    }

    update() {
        // 更新道具動畫
        this.powerUps.forEach(powerUp => {
            powerUp.animation.rotation += 0.02;
            powerUp.animation.scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        });
    }

    draw(ctx) {
        this.powerUps.forEach(powerUp => {
            if (powerUp.collected) return;

            const image = this.powerUpImages[powerUp.type];
            if (!image || !image.complete) return;

            ctx.save();
            ctx.translate(
                powerUp.x + powerUp.size/2,
                powerUp.y + powerUp.size/2
            );
            ctx.rotate(powerUp.animation.rotation);
            ctx.scale(powerUp.animation.scale, powerUp.animation.scale);
            
            ctx.drawImage(
                image,
                -powerUp.size/2,
                -powerUp.size/2,
                powerUp.size,
                powerUp.size
            );
            
            ctx.restore();
        });
    }

    cleanup() {
        // 清除所有活動效果
        this.activePowerUps.forEach((timeout, type) => {
            clearTimeout(timeout);
            const powerUpType = this.powerUpTypes[type];
            if (powerUpType) {
                powerUpType.reset();
            }
        });
        this.activePowerUps.clear();
        this.powerUps = [];
    }
} 