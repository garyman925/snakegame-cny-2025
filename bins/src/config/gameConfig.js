export const gameConfig = {
    // 遊戲基本設置
    gameDuration: 120,  // 遊戲時長（秒）
    frameInterval: 1000/60,  // 60fps
    
    // 蛇的設置
    initialSnakeLength: 3,
    penaltyDuration: 1000,   // 懲罰時間（毫秒）
    invincibleDuration: 2000, // 無敵時間（毫秒）
    
    // 食物設置
    numberOfDecoys: 3,
    foodAnimationDistance: 150,
    
    // 分數設置
    scoreConfig: {
        base: 1,
        completion: 10,
        comboMultiplier: 0.5,
        orderMultiplier: 0.3,
        speedIncrease: 0.01,
        timeBonus: {
            threshold: 30,
            points: 1000
        }
    }
}; 