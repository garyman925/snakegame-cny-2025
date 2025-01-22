export class GridSystem {
    constructor(game) {
        this.game = game;
        this.foodSize = game.pixelSize * 2; // 食物的實際大小
        this.safeDistance = this.foodSize * 1.5; // 食物之間的最小安全距離
        this.grid = [];
        this.initGrid();
    }

    initGrid() {
        const cols = Math.floor(this.game.canvas.width / this.foodSize);
        const rows = Math.floor(this.game.canvas.height / this.foodSize);
        this.grid = Array(rows).fill().map(() => Array(cols).fill(null));
    }

    // 檢查新位置是否與現有食物有足夠距離
    isPositionSafe(x, y) {
        if (!this.game.foods) return true;
        
        // 檢查與所有現有食物的距離
        return !this.game.foods.some(food => {
            const distance = Math.sqrt(
                Math.pow(food.x - x, 2) + 
                Math.pow(food.y - y, 2)
            );
            return distance < this.safeDistance;
        });
    }

    // 獲取隨機安全位置
    getRandomPosition() {
        const margin = this.foodSize; // 邊界安全距離
        let attempts = 100; // 最大嘗試次數

        while (attempts > 0) {
            const x = margin + Math.random() * (this.game.canvas.width - margin * 2);
            const y = margin + Math.random() * (this.game.canvas.height - margin * 2);

            // 將座標對齊網格
            const gridX = Math.round(x / this.foodSize) * this.foodSize;
            const gridY = Math.round(y / this.foodSize) * this.foodSize;

            if (this.isPositionSafe(gridX, gridY)) {
                return { x: gridX, y: gridY };
            }

            attempts--;
        }

        return null; // 如果找不到合適的位置
    }

    // 檢查是否還有足夠空間生成新食物
    hasAvailableSpace() {
        const totalArea = this.game.canvas.width * this.game.canvas.height;
        const occupiedArea = (this.game.foods?.length || 0) * Math.pow(this.safeDistance, 2);
        return occupiedArea < totalArea * 0.5; // 確保至少有50%的空間
    }

    // 計算兩點之間的距離
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // 獲取最近的食物距離
    getNearestFoodDistance(x, y) {
        if (!this.game.foods || this.game.foods.length === 0) return Infinity;

        return Math.min(...this.game.foods.map(food => 
            this.getDistance(x, y, food.x, food.y)
        ));
    }

    // 視覺化網格（用於調試）
    debugDraw() {
        const ctx = this.game.ctx;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        
        // 繪製網格線
        for (let x = 0; x < this.game.canvas.width; x += this.foodSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.game.canvas.height; y += this.foodSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.game.canvas.width, y);
            ctx.stroke();
        }

        // 繪製食物安全區域
        if (this.game.foods) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            this.game.foods.forEach(food => {
                ctx.beginPath();
                ctx.arc(food.x, food.y, this.safeDistance / 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
} 