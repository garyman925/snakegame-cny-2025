import { Collider2D } from './Collider2D.js';

// 移除原有的 Collider2D 類定義
// 其他代碼保持不變... 

update() {
    if (this.isGameOver || this.isPaused) return;

    // 先進行碰撞檢測
    this.checkCollisions();
    if (this.isGameOver) return; // 如果碰撞檢測導致遊戲結束，立即返回

    // 更新蛇的位置
    this.snake.update();

    // 更新道具系統
    if (this.powerUps) {
        this.powerUps.update();
    }

    // 檢查連擊時間
    if (this.combo && !this.combo.isInComboWindow()) {
        this.combo.resetCombo();
    }
}

checkCollisions() {
    console.log('檢查碰撞中...');
    
    const head = this.snake.getHead();
    
    // 檢查是否撞到自己（優先檢查）
    if (this.checkSelfCollision()) {
        console.log('✗ 撞到自己！位置:', head);
        this.gameOver('撞到自己了！');
        return true;
    }

    // 檢查是否撞到牆壁
    if (this.checkWallCollision()) {
        console.log('✗ 撞到牆壁！');
        this.gameOver('撞到牆壁了！');
        return true;
    }

    // 檢查是否收集到文字
    this.checkWordCollision();
    
    // 檢查是否收集到道具
    if (this.powerUps) {
        this.powerUps.checkCollision(this.snake.getHead());
    }

    return false;
}

checkSelfCollision() {
    const head = this.snake.getHead();
    const body = this.snake.getBody();
    
    console.log('檢查自身碰撞：', {
        head: head,
        bodyLength: body.length
    });
    
    // 確保蛇身足夠長才進行檢查
    if (body.length < 5) return false;
    
    // 從第 4 個身體段開始檢查
    for (let i = 4; i < body.length; i++) {
        const segment = body[i];
        // 使用更精確的碰撞檢測
        const collision = Math.abs(head.x - segment.x) < this.pixelSize &&
                        Math.abs(head.y - segment.y) < this.pixelSize;
        
        if (collision) {
            console.log('檢測到自身碰撞！位置：', {
                headPos: { x: head.x, y: head.y },
                segmentPos: { x: segment.x, y: segment.y },
                segmentIndex: i
            });
            return true;
        }
    }
    return false;
}

gameOver(reason) {
    console.log('遊戲結束！原因：', reason);
    
    // 立即停止遊戲
    this.isGameOver = true;
    this.isPaused = true;
    
    // 停止所有系統
    if (this.powerUps) {
        console.log('停用所有道具效果');
        this.powerUps.deactivateAllPowerUps();
    }
    if (this.audio) {
        console.log('停止所有音效');
        this.audio.stopAll();
    }
    
    // 停止遊戲循環
    if (this.gameLoop) {
        console.log('停止遊戲循環');
        cancelAnimationFrame(this.gameLoop);
        this.gameLoop = null;
    }
    
    // 顯示結果彈窗
    this.showGameResult(reason);
}

showGameResult(reason) {
    console.log('顯示遊戲結果：', reason);
    const gameResult = document.getElementById('gameResult');
    const gameOverReason = document.querySelector('.game-over-reason');
    
    if (gameOverReason) {
        gameOverReason.textContent = reason;
    }
    
    if (gameResult) {
        gameResult.classList.remove('hidden');
        // 更新分數和其他統計資料
        this.updateGameStats();
        console.log('遊戲結果視窗已顯示');
    } else {
        console.error('找不到遊戲結果元素！');
    }
} 