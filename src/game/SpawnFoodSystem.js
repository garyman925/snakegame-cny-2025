export class SpawnFoodSystem {
    constructor(game) {
        this.game = game;
        this.correctFoods = [];
        this.decoyFoods = [];
        this.numberOfDecoys = 3;  // 每組詞的誘餌數量
        this.food = null;
        
        // 添加繪製相關的屬性
        this.foodAnimations = new Map();
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }

    // 生成所有食物（包括正確和誘餌食物）
    spawnFood() {
        // 清除現有的食物
        this.correctFoods = [];
        this.decoyFoods = [];

        // 重新設置畫布大小以確保尺寸正確
        this.game.setupCanvasSize();

        // 設置安全邊距，根據螢幕大小調整
        const margin = this.game.isMobile ? this.game.pixelSize : this.game.pixelSize * 2;
        const bottomMargin = this.game.isMobile ? 
            (window.innerHeight <= 667 ? 180 : 150) : margin;
        const minFoodDistance = this.game.isMobile ? 
            this.game.pixelSize * 2.5 : 
            this.game.pixelSize * 4;
        
        // 獲取 game-header 的實際高度
        const header = document.querySelector('.game-header');
        const headerHeight = header.getBoundingClientRect().height + 20;

        // 計算可用區域
        const availableWidth = this.game.canvas.width - margin * 2;
        const availableHeight = this.game.canvas.height - headerHeight - bottomMargin - margin;
        const startY = headerHeight + margin;

        // 用於存儲所有已放置的食物位置
        const placedFoods = [];

        // 生成正確的食物
        for (const word of this.game.currentWords) {
            const position = this.findValidPosition(placedFoods, margin, headerHeight, minFoodDistance);
            if (position) {
                const food = {
                    x: position.x,
                    y: position.y,
                    word: word,
                    size: this.game.pixelSize,
                    collected: false
                };
                this.correctFoods.push(food);
                placedFoods.push(position);
            }
        }

        // 生成誘餌食物
        for (let i = 0; i < this.numberOfDecoys; i++) {
            const position = this.findValidPosition(placedFoods, margin, headerHeight, minFoodDistance);
            if (position) {
                const wrongWord = this.game.wrongWords[
                    Math.floor(Math.random() * this.game.wrongWords.length)
                ];
                
                const decoyFood = {
                    x: position.x,
                    y: position.y,
                    word: wrongWord,
                    size: this.game.pixelSize,
                    isDecoy: true
                };
                this.decoyFoods.push(decoyFood);
                placedFoods.push(position);
            }
        }

        console.log('已生成新的食物:', {
            correct: this.correctFoods.length,
            decoys: this.decoyFoods.length
        });
    }

    // 生成單個正確答案的食物
    spawnCorrectFood() {
        const margin = this.game.pixelSize * 2;
        const maxX = this.game.canvas.width - margin;
        const minX = margin;
        const maxY = this.game.canvas.height - margin;
        const minY = margin + 80;
        
        const minFoodDistance = this.game.pixelSize * 4;
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;

        // 收集所有需要避開的位置（包括干擾食物）
        const usedPositions = this.decoyFoods.map(food => ({x: food.x, y: food.y}));

        do {
            x = Math.floor(Math.random() * ((maxX - minX) / this.game.pixelSize)) * this.game.pixelSize + minX;
            y = Math.floor(Math.random() * ((maxY - minY) / this.game.pixelSize)) * this.game.pixelSize + minY;
            attempts++;
            
            if (attempts > maxAttempts) {
                console.warn('無法找到合適的食物位置');
                break;
            }
        } while (
            this.game.snake.some(segment => 
                Math.hypot(segment.x - x, segment.y - y) < minFoodDistance
            ) ||
            usedPositions.some(pos => 
                Math.hypot(pos.x - x, pos.y - y) < minFoodDistance
            )
        );

        // 更新食物位置
        this.food = {
            x: x,
            y: y,
            word: this.game.currentWords[this.game.collectWordSystem.currentWordIndex]
        };

        // 更新主要食物的動畫狀態
        if (this.game.drawFoodSystem) {
            this.game.drawFoodSystem.addFoodAnimation(this.food);
        }
    }

    // 尋找有效的食物位置
    findValidPosition(placedFoods, margin, headerHeight, minFoodDistance) {
        const maxX = this.game.canvas.width - margin;
        const minX = margin;
        const maxY = this.game.canvas.height - margin;
        const minY = margin + headerHeight;
        
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            x = Math.floor(Math.random() * ((maxX - minX) / this.game.pixelSize)) * this.game.pixelSize + minX;
            y = Math.floor(Math.random() * ((maxY - minY) / this.game.pixelSize)) * this.game.pixelSize + minY;
            attempts++;
            
            if (attempts > maxAttempts) {
                console.warn('無法找到合適的食物位置');
                return null;
            }
        } while (
            this.isPositionOccupied(x, y, placedFoods, minFoodDistance) ||
            this.isNearSnake(x, y, minFoodDistance)
        );

        return {x, y};
    }

    // 檢查位置是否被佔用
    isPositionOccupied(x, y, placedFoods, minDistance) {
        return placedFoods.some(food => 
            Math.hypot(food.x - x, food.y - y) < minDistance
        );
    }

    // 檢查是否太靠近蛇
    isNearSnake(x, y, minDistance) {
        return this.game.snake.some(segment => 
            Math.hypot(segment.x - x, segment.y - y) < minDistance
        );
    }

    // 獲取所有食物
    getAllFoods() {
        return {
            correctFoods: this.correctFoods,
            decoyFoods: this.decoyFoods,
            food: this.food
        };
    }

    // 清除所有食物
    clearAllFoods() {
        this.correctFoods = [];
        this.decoyFoods = [];
        this.food = null;
    }

    // 從 DrawFoodSystem 移植的繪製方法
    drawFood(food, snakeHead) {
        if (!food) return;

        const ctx = this.game.ctx;
        const animation = this.getFoodAnimation(food);
        
        ctx.save();
        
        // 繪製食物外框和背景
        ctx.fillStyle = '#4CAF50';  // 綠色背景
        ctx.strokeStyle = '#388E3C';  // 深綠色邊框
        this.drawFoodShape(ctx, food, animation);
        
        // 繪製文字
        this.drawFoodText(ctx, food, animation);
        
        ctx.restore();
    }

    drawFoodShape(ctx, food, animation) {
        const size = this.game.pixelSize;
        const x = food.x + (animation ? animation.offsetX : 0);
        const y = food.y + (animation ? animation.offsetY : 0);
        
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 5);
        ctx.fill();
        ctx.stroke();
    }

    drawFoodText(ctx, food, animation) {
        const size = this.game.pixelSize;
        const x = food.x + (animation ? animation.offsetX : 0);
        const y = food.y + (animation ? animation.offsetY : 0);
        
        ctx.fillStyle = '#FFFFFF';  // 白色文字
        ctx.font = `${size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.word, x + size/2, y + size/2);
    }

    // 食物動畫相關方法
    getFoodAnimation(food) {
        if (!this.foodAnimations.has(food)) {
            this.foodAnimations.set(food, {
                offsetX: 0,
                offsetY: 0,
                time: 0
            });
        }
        return this.foodAnimations.get(food);
    }

    updateFoodAnimations() {
        this.foodAnimations.forEach((animation, food) => {
            animation.time += 0.1;
            animation.offsetY = Math.sin(animation.time) * 5;
        });
    }

    // 主要繪製方法
    draw() {
        this.updateFoodAnimations();

        // 繪製正確食物
        this.correctFoods.forEach(food => {
            if (!food.collected) {
                this.drawFood(food, this.game.snake[0]);
            }
        });

        // 繪製誘餌食物
        this.decoyFoods.forEach(decoy => {
            this.drawFood(decoy, this.game.snake[0]);
        });
    }

    // 清理方法
    cleanup() {
        this.foodAnimations.clear();
        this.clearAllFoods();
    }
} 