import { gameConfig } from '../config/gameConfig.js';

export class Snake {
    constructor(game) {
        this.game = game;
        this.pixelSize = this.detectDeviceSize();
        this.direction = 'right';
        this.isPenalized = false;
        this.isInvincible = false;
        this.animationProgress = 0;
        this.moveSpeed = 0.15;
        
        // 加載蛇的圖片
        this.loadImages();
        
        // 初始化蛇的位置
        this.reset();
    }

    loadImages() {
        this.headImage = new Image();
        this.headImage.src = 'img/head.png';
        this.bodyImage = new Image();
        this.bodyImage.src = 'img/body.png';
        this.tailImage = new Image();
        this.tailImage.src = 'img/tail.png';
    }

    reset() {
        // 初始化蛇的起始位置
        this.segments = [
            {x: this.pixelSize * 2, y: this.pixelSize},
            {x: this.pixelSize, y: this.pixelSize},
            {x: 0, y: this.pixelSize}
        ];
        this.lastPosition = [...this.segments];
        this.direction = 'right';
        this.animationProgress = 0;
    }

    detectDeviceSize() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        return isMobile ? 30 : 50; // 移動設備使用較小的尺寸
    }

    move() {
        if (this.isPenalized) return;

        this.animationProgress += this.moveSpeed;
        
        if (this.animationProgress >= 1) {
            this.completeMove();
            this.animationProgress = 0;
            this.lastPosition = JSON.parse(JSON.stringify(this.segments));
        }
    }

    completeMove() {
        const head = {...this.segments[0]};
        
        switch(this.direction) {
            case 'up': head.y -= this.pixelSize; break;
            case 'down': head.y += this.pixelSize; break;
            case 'left': head.x -= this.pixelSize; break;
            case 'right': head.x += this.pixelSize; break;
        }

        // 處理邊界
        this.handleBoundaries(head);

        // 檢查自身碰撞
        if (this.checkSelfCollision(head) && !this.isInvincible) {
            this.game.gameOver();
            return;
        }

        this.segments.unshift(head);
        this.segments.pop();
    }

    handleBoundaries(head) {
        const canvas = document.getElementById('gameCanvas');
        if (head.x < 0) head.x = canvas.width - this.pixelSize;
        else if (head.x >= canvas.width) head.x = 0;
        if (head.y < 0) head.y = canvas.height - this.pixelSize;
        else if (head.y >= canvas.height) head.y = 0;
    }

    checkSelfCollision(head) {
        return this.segments.some((segment, index) => {
            if (index === 0) return false;
            return head.x === segment.x && head.y === segment.y;
        });
    }

    changeDirection(newDirection) {
        // 防止反向移動
        const invalidMoves = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (invalidMoves[this.direction] !== newDirection) {
            if (this.direction !== newDirection) {
                this.game.audio.play('turn');
            }
            this.direction = newDirection;
        }
    }

    grow() {
        const lastSegment = this.segments[this.segments.length - 1];
        const secondLastSegment = this.segments[this.segments.length - 2];

        const newSegment = {
            x: lastSegment.x + (lastSegment.x - secondLastSegment.x),
            y: lastSegment.y + (lastSegment.y - secondLastSegment.y)
        };

        this.handleBoundaries(newSegment);
        this.segments.push(newSegment);
        
        if (this.lastPosition) {
            this.lastPosition.push({...newSegment});
        }
    }

    getInterpolatedHeadPosition() {
        const currentHead = this.segments[0];
        const nextHead = {...currentHead};

        switch(this.direction) {
            case 'up': nextHead.y -= this.pixelSize; break;
            case 'down': nextHead.y += this.pixelSize; break;
            case 'left': nextHead.x -= this.pixelSize; break;
            case 'right': nextHead.x += this.pixelSize; break;
        }

        this.handleBoundaries(nextHead);

        return {
            x: currentHead.x + (nextHead.x - currentHead.x) * this.animationProgress,
            y: currentHead.y + (nextHead.y - currentHead.y) * this.animationProgress
        };
    }

    draw(ctx) {
        if (!this.lastPosition) return;

        // 繪製蛇身每個部分
        this.drawTail(ctx);
        this.drawBody(ctx);
        this.drawHead(ctx);
    }

    drawTail(ctx) {
        const tail = this.segments[this.segments.length - 1];
        const prevTail = this.segments[this.segments.length - 2];
        const lastTail = this.lastPosition[this.lastPosition.length - 1];
        
        if (lastTail && prevTail && this.tailImage.complete) {
            const x = lastTail.x + (tail.x - lastTail.x) * this.animationProgress;
            const y = lastTail.y + (tail.y - lastTail.y) * this.animationProgress;

            ctx.save();
            ctx.translate(x + this.pixelSize/2, y + this.pixelSize/2);
            
            // 計算尾巴的旋轉角度（朝向前一個身體段落）
            const dx = prevTail.x - tail.x;
            const dy = prevTail.y - tail.y;
            const rotation = Math.atan2(dy, dx) + Math.PI/2;
            ctx.rotate(rotation);
            
            ctx.drawImage(
                this.tailImage,
                -this.pixelSize/2,
                -this.pixelSize/2,
                this.pixelSize,
                this.pixelSize
            );
            
            ctx.restore();
        }
    }

    drawBody(ctx) {
        // 繪製蛇身（除了頭部和尾部）
        for (let i = this.segments.length - 2; i > 0; i--) {
            const segment = this.segments[i];
            const lastPos = this.lastPosition[i];
            if (!lastPos || !this.bodyImage.complete) continue;

            const x = lastPos.x + (segment.x - lastPos.x) * this.animationProgress;
            const y = lastPos.y + (segment.y - lastPos.y) * this.animationProgress;

            ctx.save();
            ctx.translate(x + this.pixelSize/2, y + this.pixelSize/2);
            
            // 計算蛇身段落的旋轉角度
            const nextSegment = this.segments[i - 1];
            const dx = nextSegment.x - segment.x;
            const dy = nextSegment.y - segment.y;
            const rotation = Math.atan2(dy, dx);
            
            ctx.rotate(rotation);
            
            ctx.drawImage(
                this.bodyImage,
                -this.pixelSize/2,
                -this.pixelSize/2,
                this.pixelSize,
                this.pixelSize
            );
            
            ctx.restore();
        }
    }

    drawHead(ctx) {
        const head = this.segments[0];
        const lastHead = this.lastPosition[0];
        if (lastHead && this.headImage.complete) {
            const x = lastHead.x + (head.x - lastHead.x) * this.animationProgress;
            const y = lastHead.y + (head.y - lastHead.y) * this.animationProgress;

            ctx.save();
            // 移動到蛇頭中心點，稍微向下偏移以遮蓋接駁部分
            ctx.translate(
                x + this.pixelSize/2, 
                y + this.pixelSize/2 + this.pixelSize * 0.1
            );
            
            // 根據方向旋轉，加上 90 度的基礎旋轉
            let rotation = Math.PI/2;
            switch(this.direction) {
                case 'up': rotation += -Math.PI/2; break;
                case 'down': rotation += Math.PI/2; break;
                case 'left': rotation += Math.PI; break;
                case 'right': rotation += 0; break;
            }
            ctx.rotate(rotation);
            
            // 繪製蛇頭圖片，放大 20% 並調整偏移以保持中心點
            const headSize = this.pixelSize * 1.4;
            ctx.drawImage(
                this.headImage,
                -headSize/2,
                -headSize/2,
                headSize,
                headSize
            );
            
            ctx.restore();
        }
    }

    // 添加無敵狀態相關方法
    setPenalized(value) {
        this.isPenalized = value;
    }

    setInvincible(value) {
        this.isInvincible = value;
    }

    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }
} 