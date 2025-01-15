import { gameConfig } from '../config/gameConfig.js';

export class Effects {
    constructor(game) {
        this.game = game;
        this.glowEffect = false;
        this.glowDuration = 500;
        this.glowStartTime = 0;
        
        // 加載表情符號圖片
        this.emojis = {
            correct: this.loadImage('img/emo-heart.png'),
            wrong: this.loadImage('img/emo-sad.png'),
            speed: this.loadImage('img/emo-smart.png'),
            star: this.loadImage('img/emo-star.png')
        };
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        return img;
    }

    // 顯示收集到的字
    showCollectedWord(word, index) {
        const element = document.getElementById(`word${index}`);
        if (!element) return;

        const span = element.querySelector('span');
        if (!span) return;

        span.textContent = word;
        element.classList.remove('bounce');
        element.classList.add('active');
        
        // 觸發重排以重新開始動畫
        void element.offsetWidth;
        element.classList.add('bounce');
    }

    // 清空收集的字
    clearCollectedWords() {
        for (let i = 0; i < 4; i++) {
            const element = document.getElementById(`word${i}`);
            if (!element) continue;

            const span = element.querySelector('span');
            if (span) {
                span.textContent = '';
            }
            element.classList.remove('bounce', 'active');
        }
    }

    // 顯示完成動畫
    showCompletionAnimation(words) {
        const popup = document.getElementById('completionPopup');
        if (!popup) return;

        const phrase = popup.querySelector('.completed-phrase');
        if (!phrase) return;
        
        // 設置完成的詞組
        phrase.textContent = words.join('');
        
        // 顯示彈出視窗
        popup.classList.remove('hidden');
        void popup.offsetWidth;
        popup.classList.add('show');

        // 1秒後自動關閉彈出視窗
        setTimeout(() => {
            popup.classList.remove('show');
            popup.classList.add('hidden');
        }, 1000);
    }

    // 顯示表情符號
    showEmoji(type, x, y) {
        const container = document.createElement('div');
        container.className = 'emoji-container';
        
        const emoji = document.createElement('img');
        emoji.src = this.emojis[type].src;
        emoji.className = 'emoji';
        
        container.appendChild(emoji);
        
        // 設置位置
        container.style.cssText = `
            position: absolute;
            left: ${x + this.game.snake.pixelSize}px;
            top: ${y - this.game.snake.pixelSize}px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(container);

        // 使用 GSAP 製作動畫
        gsap.fromTo(container,
            {
                opacity: 0,
                scale: 0.5,
                y: '+=10'
            },
            {
                opacity: 1,
                scale: 1,
                y: '-=10',
                duration: 0.15,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    gsap.to(container, {
                        opacity: 0,
                        y: '-=20',
                        duration: 0.15,
                        delay: 0.3,
                        ease: 'power1.in',
                        onComplete: () => container.remove()
                    });
                }
            }
        );
    }

    // 顯示連擊效果
    showComboEffect(x, y, comboCount) {
        const comboDisplay = document.createElement('div');
        comboDisplay.className = 'combo-display';
        comboDisplay.innerHTML = `
            <span class="combo-text">連擊</span>
            <span class="combo-number">x${comboCount}</span>
        `;

        comboDisplay.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y - 40}px;
            animation: comboAppear 0.5s ease forwards;
        `;

        document.body.appendChild(comboDisplay);

        // 0.8秒後開始消失動畫
        setTimeout(() => {
            comboDisplay.style.animation = 'comboDisappear 0.2s ease forwards';
        }, 800);

        // 1秒後移除元素
        setTimeout(() => {
            comboDisplay.remove();
        }, 1000);
    }

    // 觸發發光效果
    triggerGlowEffect() {
        this.glowEffect = true;
        this.glowStartTime = Date.now();
    }

    // 更新發光效果
    updateGlowEffect(ctx) {
        if (!this.glowEffect) return;

        const elapsed = Date.now() - this.glowStartTime;
        if (elapsed < this.glowDuration) {
            const alpha = 1 - (elapsed / this.glowDuration);
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.lineWidth = 10;
            ctx.shadowColor = 'yellow';
            ctx.shadowBlur = 20;
            
            // 為蛇身每個部分添加發光描邊
            this.game.snake.segments.forEach(segment => {
                ctx.strokeRect(
                    segment.x,
                    segment.y,
                    this.game.snake.pixelSize,
                    this.game.snake.pixelSize
                );
            });
            
            ctx.restore();
        } else {
            this.glowEffect = false;
        }
    }

    // 顯示加速計時器
    showSpeedupTimer(duration) {
        this.showStatusTimer('加速中', duration);
    }

    // 顯示狀態計時器
    showStatusTimer(status, duration) {
        // 移除舊的計時器
        const oldTimer = document.querySelector('.status-timer');
        if (oldTimer) {
            oldTimer.remove();
        }

        const statusTimer = document.createElement('div');
        statusTimer.className = 'status-timer';
        document.querySelector('.score-container').appendChild(statusTimer);

        // 開始倒數
        let timeLeft = duration;
        const updateTimer = () => {
            statusTimer.textContent = `${status} ${timeLeft}`;
            timeLeft--;
            
            if (timeLeft < 0) {
                statusTimer.remove();
            }
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        // duration 秒後清除計時器
        setTimeout(() => {
            clearInterval(timerInterval);
            if (statusTimer.parentNode) {
                statusTimer.remove();
            }
        }, duration * 1000);
    }
} 