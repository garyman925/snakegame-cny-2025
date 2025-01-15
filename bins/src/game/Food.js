import { gameConfig } from '../config/gameConfig.js';
import { Collider2D } from '../utils/Collider.js';

export class FoodSystem {
    constructor(game) {
        this.game = game;
        this.correctFoods = [];
        this.decoyFoods = [];
        this.foodAnimations = {
            correct: [],
            decoys: []
        };
        this.numberOfDecoys = gameConfig.numberOfDecoys;
        this.foodAnimationDistance = gameConfig.foodAnimationDistance;
    }

    spawnFood() {
        // 清除現有的食物
        this.correctFoods = [];
        this.decoyFoods = [];
        this.foodAnimations = {
            correct: [],
            decoys: []
        };

        // 設置安全邊距
        const margin = this.game.snake.pixelSize * 2;
        const headerHeight = document.querySelector('.game-header').getBoundingClientRect().height + 20;
        const bottomMargin = window.innerHeight <= 667 ? 180 : 150;
        const minFoodDistance = window.innerHeight <= 667 ? 
            this.game.snake.pixelSize * 2.5 : 
            this.game.snake.pixelSize * 4;

        // 計算可用區域
        const canvas = document.getElementById('gameCanvas');
        const availableWidth = canvas.width - margin * 2;
        const availableHeight = canvas.height - headerHeight - bottomMargin - margin;
        const startY = headerHeight + margin;
        const safeHeight = window.innerHeight <= 667 ? 
            canvas.height - 180 : 
            canvas.height - bottomMargin;

        // 用於存儲所有已放置的食物位置
        const placedFoods = [];

        // 生成正確答案食物
        this.spawnCorrectFoods(
            availableWidth, availableHeight, startY, safeHeight,
            margin, minFoodDistance, placedFoods
        );

        // 生成誘餌食物
        this.spawnDecoyFoods(
            availableWidth, availableHeight, startY, safeHeight,
            margin, minFoodDistance, placedFoods
        );
    }

    spawnCorrectFoods(availableWidth, availableHeight, startY, safeHeight, margin, minFoodDistance, placedFoods) {
        for (const word of this.game.currentWords) {
            const position = this.findValidPosition(
                availableWidth, availableHeight, startY, safeHeight,
                margin, minFoodDistance, placedFoods
            );

            if (position) {
                const food = {
                    x: position.x,
                    y: position.y,
                    word: word,
                    collected: false,
                    size: this.game.snake.pixelSize * (window.innerHeight <= 667 ? 0.8 : 1)
                };
                this.correctFoods.push(food);
                placedFoods.push(food);
                this.foodAnimations.correct.push({
                    x: position.x,
                    y: position.y,
                    offsetY: 0
                });
            }
        }
    }

    spawnDecoyFoods(availableWidth, availableHeight, startY, safeHeight, margin, minFoodDistance, placedFoods) {
        for (let i = 0; i < this.numberOfDecoys; i++) {
            const position = this.findValidPosition(
                availableWidth, availableHeight, startY, safeHeight,
                margin, minFoodDistance, placedFoods
            );

            if (position) {
                const food = {
                    x: position.x,
                    y: position.y,
                    word: this.game.getRandomWord(),
                    size: this.game.snake.pixelSize * (window.innerHeight <= 667 ? 0.8 : 1)
                };
                this.decoyFoods.push(food);
                placedFoods.push(food);
                this.foodAnimations.decoys.push({
                    x: position.x,
                    y: position.y,
                    offsetY: 0
                });
            }
        }
    }

    findValidPosition(availableWidth, availableHeight, startY, safeHeight, margin, minFoodDistance, placedFoods) {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * availableWidth + margin);
            const y = Math.floor(Math.random() * availableHeight + startY);
            
            if (y > safeHeight) {
                attempts++;
                continue;
            }

            if (this.isValidPosition(x, y, minFoodDistance, placedFoods)) {
                return { x, y };
            }

            attempts++;
        }

        console.warn('無法找到合適的食物位置');
        return null;
    }

    isValidPosition(x, y, minDistance, placedFoods) {
        // 檢查與已放置食物的距離
        for (const food of placedFoods) {
            const distance = Math.hypot(food.x - x, food.y - y);
            if (distance < minDistance) {
                return false;
            }
        }

        // 檢查與蛇的距離
        for (const segment of this.game.snake.segments) {
            const distance = Math.hypot(segment.x - x, segment.y - y);
            if (distance < minDistance) {
                return false;
            }
        }

        return true;
    }

    checkCollisions(headPosition) {
        if (this.game.snake.isPenalized) return;

        const head = {
            x: headPosition.x,
            y: headPosition.y,
            width: this.game.snake.pixelSize,
            height: this.game.snake.pixelSize
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
                this.handleCorrectCollection(food, index, headPosition);
            }
        });

        // 檢查誘餌食物碰撞
        if (!this.game.snake.isInvincible) {
            this.decoyFoods.forEach(decoy => {
                const decoyRect = {
                    x: decoy.x,
                    y: decoy.y,
                    width: decoy.size,
                    height: decoy.size
                };

                if (Collider2D.boxCollision(head, decoyRect)) {
                    this.handleWrongCollection(headPosition);
                }
            });
        }
    }

    handleCorrectCollection(food, index, position) {
        food.collected = true;

        // 顯示正確表情
        this.game.effects.showEmoji('correct', position.x, position.y);

        // 增加連擊數並計算分數
        this.game.score.increaseCombo();
        const isCorrectOrder = index === this.game.currentWordIndex;
        const { score, bonusText } = this.game.score.calculateScore(index, isCorrectOrder);
        this.game.score.updateScore(score, position.x, position.y, bonusText);

        // 視覺和音效反饋
        this.game.effects.showCollectedWord(food.word, index);
        this.game.effects.triggerGlowEffect();
        this.game.snake.grow();

        // 檢查是否完成詞組
        if (this.correctFoods.every(f => f.collected)) {
            this.handlePhraseCompletion(position);
        }
    }

    handleWrongCollection(position) {
        // 顯示錯誤表情
        this.game.effects.showEmoji('wrong', position.x, position.y);
        
        // 重置連擊
        this.game.score.resetCombo();
        
        // 播放錯誤音效
        this.game.audio.play('wrong');
        
        // 設置懲罰狀態
        this.game.snake.setPenalized(true);
        
        // 1秒後解除懲罰狀態並進入無敵狀態
        setTimeout(() => {
            this.game.snake.setPenalized(false);
            this.game.snake.setInvincible(true);
            
            // 添加無敵狀態的視覺效果
            const canvas = document.getElementById('gameCanvas');
            canvas.classList.add('invincible-snake');
            
            // 2秒後解除無敵狀態
            setTimeout(() => {
                this.game.snake.setInvincible(false);
                canvas.classList.remove('invincible-snake');
            }, gameConfig.invincibleDuration);
            
        }, gameConfig.penaltyDuration);
    }

    handlePhraseCompletion(position) {
        // 添加完成獎勵
        const completionScore = gameConfig.scoreConfig.completion;
        this.game.score.updateScore(completionScore, position.x, position.y, '完成獎勵!');
        
        // 更新完成狀態
        this.game.completedGreetings.push(this.game.currentWords.join(''));
        this.game.effects.showCompletionAnimation(this.game.currentWords);
        
        // 播放完成音效
        this.game.audio.play('crash');
        setTimeout(() => {
            this.game.audio.play('crash');
        }, 200);
        
        // 進入下一組詞
        this.game.currentGreetingIndex++;
        if (this.game.currentGreetingIndex >= this.game.greetingsData.length) {
            this.game.gameOver();
            return;
        }
        
        this.game.selectNextGreeting();
    }

    draw(ctx) {
        // 繪製正確食物
        this.correctFoods.forEach((food, index) => {
            if (!food.collected) {
                this.drawFood(
                    ctx,
                    food,
                    this.foodAnimations.correct[index],
                    this.game.snake.segments[0]
                );
            }
        });

        // 繪製誘餌食物
        this.decoyFoods.forEach((decoy, index) => {
            this.drawFood(
                ctx,
                decoy,
                this.foodAnimations.decoys[index],
                this.game.snake.segments[0]
            );
        });
    }

    drawFood(ctx, food, animation, snakeHead) {
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

        // 繪製食物
        ctx.save();
        ctx.translate(
            food.x + food.size/2,
            food.y + food.size/2
        );
        ctx.rotate(animation.rotation);
        
        // 繪製圓形背景
        ctx.beginPath();
        ctx.arc(0, 0, food.size * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
        
        // 繪製文字
        ctx.fillStyle = '#fff';
        const fontSize = window.innerHeight <= 667 ? '25px' : '45px';
        ctx.font = `900 ${fontSize} "Noto Sans TC"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.word, 0, 0);
        
        ctx.restore();
    }
} 