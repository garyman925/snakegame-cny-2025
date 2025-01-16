export class DrawFoodSystem {
    constructor(game) {
        this.game = game;
        this.foodAnimationDistance = this.game.pixelSize * 3; // 感應距離
        this.foodAnimations = {
            correct: [],
            decoys: []
        };
    }

    // 添加食物動畫
    addFoodAnimation(food) {
        this.foodAnimations.correct.push({
            x: food.x,
            y: food.y,
            offsetY: 0
        });
    }

    // 添加誘餌動畫
    addDecoyAnimation(food) {
        this.foodAnimations.decoys.push({
            x: food.x,
            y: food.y,
            offsetY: 0
        });
    }

    // 繪製食物
    drawFood() {
        // 繪製正確的食物
        this.game.correctFoods.forEach((food, index) => {
            if (!food.collected) {
                this.drawSingleFood(food, true);
                // 更新動畫
                if (this.foodAnimations.correct[index]) {
                    this.foodAnimations.correct[index].offsetY = 
                        Math.sin(Date.now() / 500) * 5; // 上下浮動動畫
                }
            }
        });

        // 繪製誘餌食物
        this.game.decoyFoods.forEach((food, index) => {
            this.drawSingleFood(food, false);
            // 更新動畫
            if (this.foodAnimations.decoys[index]) {
                this.foodAnimations.decoys[index].offsetY = 
                    Math.sin(Date.now() / 500) * 5; // 上下浮動動畫
            }
        });
    }

    // 添加 drawDecoy 方法
    drawDecoy(food, snakeHead) {
        this.drawSingleFood(food, false);
    }

    // 添加專門用於繪製正確食物的方法
    drawCorrectFood(food, snakeHead) {
        this.drawSingleFood(food, true);
    }

    // 繪製單個食物
    drawSingleFood(food, isCorrect) {
        const ctx = this.game.ctx;
        const head = this.game.snake[0];
        
        // 獲取動畫偏移
        const animations = isCorrect ? this.foodAnimations.correct : this.foodAnimations.decoys;
        const animation = animations.find(a => a.x === food.x && a.y === food.y);
        const offsetY = animation ? animation.offsetY : 0;
        
        // 計算食物到蛇頭的距離
        const distance = Math.sqrt(
            Math.pow(head.x - food.x, 2) + 
            Math.pow(head.y - food.y, 2)
        );

        // 當蛇頭靠近時，食物會有動畫效果
        if (distance < this.foodAnimationDistance) {
            const animationScale = 1 + (0.2 * (1 - distance / this.foodAnimationDistance));
            this.drawAnimatedFood(food, animationScale, isCorrect, offsetY);
        } else {
            this.drawNormalFood(food, isCorrect, offsetY);
        }
    }

    // 修改繪製方法以支持偏移
    drawNormalFood(food, isCorrect, offsetY = 0) {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.fillStyle = isCorrect ? '#4CAF50' : '#FF5252';
        ctx.fillRect(food.x, food.y + offsetY, food.size, food.size);
        
        // 繪製文字
        ctx.fillStyle = 'white';
        ctx.font = `${food.size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            food.word,
            food.x + food.size / 2,
            food.y + food.size / 2 + offsetY
        );
        ctx.restore();
    }

    // 修改動畫食物繪製方法以支持偏移
    drawAnimatedFood(food, scale, isCorrect, offsetY = 0) {
        const ctx = this.game.ctx;
        const centerX = food.x + food.size / 2;
        const centerY = food.y + food.size / 2 + offsetY;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        
        ctx.fillStyle = isCorrect ? '#4CAF50' : '#FF5252';
        ctx.fillRect(food.x, food.y + offsetY, food.size, food.size);
        
        // 繪製文字
        ctx.fillStyle = 'white';
        ctx.font = `${food.size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            food.word,
            food.x + food.size / 2,
            food.y + food.size / 2 + offsetY
        );
        ctx.restore();
    }

    // 添加舊的 drawFoodWithAnimation 方法
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

        const ctx = this.game.ctx;
        // 繪製圓形背景
        ctx.save();
        ctx.translate(
            food.x + this.game.pixelSize/2,
            food.y + this.game.pixelSize/2
        );
        ctx.rotate(animation.rotation);
        
        // 繪製圓形
        ctx.beginPath();
        ctx.arc(0, 0, this.game.pixelSize * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
        
        ctx.restore();

        // 繪製文字
        ctx.save();
        ctx.translate(
            food.x + this.game.pixelSize/2,
            food.y + this.game.pixelSize/2
        );
        ctx.rotate(animation.rotation);
        ctx.fillStyle = '#fff';
        
        // 根據設備類型設置不同的字體大小
        const fontSize = this.game.isMobile ? '25px' : '45px';
        ctx.font = `900 ${fontSize} "Noto Sans TC"`;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.word, 0, 0);
        ctx.restore();
    }
} 