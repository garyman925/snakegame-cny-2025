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
        // 添加日誌追蹤
        console.log('開始生成食物:', {
            當前題目: this.game.currentWords,
            錯誤詞組: this.game.wrongWords
        });

        // 清除現有的食物
        this.correctFoods = [];
        this.decoyFoods = [];

        // 重新設置畫布大小以確保尺寸正確
        this.game.setupCanvasSize();

        // 針對不同螢幕尺寸調整參數
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isSmallScreen = screenWidth <= 390;
        
        // 調整安全邊距和食物間距
        const margin = isSmallScreen ? 
            this.game.pixelSize * 1.5 : // 增加邊距
            this.game.pixelSize * 2;
        
        const bottomMargin = isSmallScreen ? 
            120 : // 增加底部邊距
            150;
        
        const topMargin = isSmallScreen ? 
            80 : // 增加頂部邊距
            100;
        
        // 增加食物之間的最小距離
        const minFoodDistance = isSmallScreen ?
            this.game.pixelSize * 2.5 : // 增加食物間距
            this.game.pixelSize * 3;

        // 獲取 game-header 的實際高度
        const header = document.querySelector('.game-header');
        const headerHeight = header.getBoundingClientRect().height + topMargin;

        // 用於存儲所有已放置的食物位置
        const placedFoods = [];

        // 首先生成所有正確的食物（必須全部生成）
        for (const word of this.game.currentWords) {
            let position = null;
            let attempts = 0;
            const maxAttempts = 100;

            // 持續嘗試直到找到有效位置
            while (!position && attempts < maxAttempts) {
                position = this.findValidPosition(
                    placedFoods, 
                    margin * 2,
                    headerHeight, 
                    minFoodDistance
                );
                attempts++;
            }

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
            } else {
                console.error('無法為正確字找到合適位置:', word);
            }
        }

        // 從錯誤詞組中選擇字時添加檢查
        const wrongWords = [...this.game.wrongWords];
        if (wrongWords.length < this.numberOfDecoys) {
            console.warn('警告：錯誤詞組數量不足', {
                需要數量: this.numberOfDecoys,
                實際數量: wrongWords.length
            });
        }

        const selectedWrongWords = [];
        const numberOfDecoys = 4; // 固定生成4個錯誤字

        for (let i = 0; i < numberOfDecoys && wrongWords.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * wrongWords.length);
            selectedWrongWords.push(wrongWords.splice(randomIndex, 1)[0]);
        }

        // 生成選中的錯誤字
        for (const wrongWord of selectedWrongWords) {
            let position = null;
            let attempts = 0;
            const maxAttempts = 100;

            // 持續嘗試直到找到有效位置
            while (!position && attempts < maxAttempts) {
                position = this.findValidPosition(
                    placedFoods, 
                    margin * 2,
                    headerHeight, 
                    minFoodDistance
                );
                attempts++;
            }

            if (position) {
                const decoyFood = {
                    x: position.x,
                    y: position.y,
                    word: wrongWord,
                    size: this.game.pixelSize,
                    isDecoy: true
                };
                this.decoyFoods.push(decoyFood);
                placedFoods.push(position);
            } else {
                console.error('無法為錯誤字找到合適位置:', wrongWord);
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
        const isSmallScreen = window.innerWidth <= 390;
        
        // 調整邊距乘數
        const marginMultiplier = isSmallScreen ? 0.6 : 0.8;
        
        const maxX = this.game.canvas.width - margin * marginMultiplier;
        const minX = margin * marginMultiplier;
        const maxY = this.game.canvas.height - margin * marginMultiplier;
        const minY = headerHeight + margin * 0.4; // 增加頂部間距
        
        let x, y;
        let attempts = 0;
        const maxAttempts = 300;

        do {
            x = Math.floor(Math.random() * ((maxX - minX) / this.game.pixelSize)) * this.game.pixelSize + minX;
            y = Math.floor(Math.random() * ((maxY - minY) / this.game.pixelSize)) * this.game.pixelSize + minY;
            attempts++;
            
            if (attempts > maxAttempts) {
                console.warn('無法找到合適的食物位置，嘗試次數:', attempts);
                return null;
            }
        } while (
            this.isPositionOccupied(x, y, placedFoods, minFoodDistance * 0.8) || // 增加檢查距離
            this.isNearSnake(x, y, minFoodDistance * 0.8)
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
        // const animation = this.getFoodAnimation(food);  // 移除動畫
        
        ctx.save();
        
        // 繪製食物外框和背景
        ctx.fillStyle = '#4CAF50';  // 綠色背景
        ctx.strokeStyle = '#388E3C';  // 深綠色邊框
        
        // 直接使用食物的原始位置，不加入動畫偏移
        const x = food.x;
        const y = food.y;
        
        // 調整圓角大小，使其更接近蛇的視覺效果
        const borderRadius = 5;
        
        ctx.beginPath();
        ctx.roundRect(x, y, food.size, food.size, borderRadius);
        ctx.fill();
        ctx.stroke();
        
        // 繪製文字
        ctx.fillStyle = '#FFFFFF';  // 白色文字
        ctx.font = `${food.size * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.word, x + food.size/2, y + food.size/2);
        
        ctx.restore();
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

    // 添加移除食物的方法
    removeFood(food) {
        // 從正確食物陣列中移除
        this.correctFoods = this.correctFoods.filter(f => f !== food);
        
        // 從錯誤食物陣列中移除
        this.decoyFoods = this.decoyFoods.filter(f => f !== food);
    }
} 