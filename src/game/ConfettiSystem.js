export class ConfettiSystem {
    constructor() {
        if (typeof confetti === 'undefined') {
            console.error('Canvas confetti not found! Please check if the script is properly loaded.');
            return;
        }
        this.interval = null;
    }

    start() {
        // 從上方落下的紙碎效果
        const defaults = {
            particleCount: 1,        // 每次只發射一個紙碎
            spread: 10,              // 很小的散布範圍
            startVelocity: 0,        // 初始速度為 0
            gravity: 0.4,            // 較輕的重力
            drift: 0,                // 不要有橫向漂移
            ticks: 1000,             // 較長的存在時間
            colors: ['#ff0000', '#ffd700', '#ffff00'],  // 紅色、金色和黃色
            shapes: ['square'],      // 方形紙碎
            origin: { 
                x: Math.random(),    // 隨機的水平位置
                y: -0.1              // 從畫面上方開始
            },
            angle: 270,              // 向下發射
            decay: 0.98,             // 非常緩慢的速度衰減
        };

        // 持續發射單個紙碎，不設定結束時間
        this.interval = setInterval(() => {
            confetti({
                ...defaults,
                scalar: Math.random() * 1.5 + 0.5, // 隨機生成大小 (0.5 到 2.0)
                origin: { 
                    x: Math.random(),  // 每次都使用新的隨機水平位置
                    y: -0.1
                }
            });
        }, 50);  // 每 50ms 發射一次

        // 移除停止的計時器，讓動畫持續進行
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        confetti.reset();
    }

    // 新增：完成組合時的慶祝動畫
    celebrate() {
        // 使用與首頁相同的設置
        const defaults = {
            particleCount: 1,
            spread: 10,
            startVelocity: 0,
            gravity: 0.4,
            scalar: 1.2,
            drift: 0,
            ticks: 1000,
            colors: ['#ff0000', '#ffd700'],
            shapes: ['square'],
            origin: { 
                x: Math.random(),
                y: -0.1
            },
            angle: 270,
            decay: 0.98,
        };

        // 創建一個新的間隔器（與首頁動畫分開）
        const celebrationInterval = setInterval(() => {
            confetti({
                ...defaults,
                origin: { 
                    x: Math.random(),
                    y: -0.1
                }
            });
        }, 50);

        // 2 秒後停止（比首頁動畫時間短）
        setTimeout(() => {
            clearInterval(celebrationInterval);
        }, 2000);
    }
} 