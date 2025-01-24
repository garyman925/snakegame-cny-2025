export class EffectSystem {
    constructor(game) {
        this.game = game;
        this.glowEffect = false;
        this.glowDuration = 500;
        this.glowStartTime = 0;
        
        // 加載表情符號圖片
        this.emojis = {
            correct: new Image(),
            wrong: new Image(),
            speed: new Image(),
            star: new Image()
        };

        this.emojis.correct.src = 'img/emo-heart.png';
        this.emojis.wrong.src = 'img/emo-sad.png';
        this.emojis.speed.src = 'img/emo-smart.png';
        this.emojis.star.src = 'img/emo-star.png';

    }


    showCollectionEffect(x, y) {
        // 使用 GSAP 創建爆炸效果
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'collection-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            document.body.appendChild(particle);

            gsap.to(particle, {
                x: Math.cos(i * Math.PI/4) * 50,
                y: Math.sin(i * Math.PI/4) * 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    }

    showCompletionEffect() {
        // 使用 PIXI.js 創建煙火效果
        const app = new PIXI.Application({
            transparent: true,
            resizeTo: window
        });
        document.body.appendChild(app.view);

        // 創建煙火效果
        const firework = new PIXI.ParticleContainer();
        app.stage.addChild(firework);

        // 在3秒後移除效果
        setTimeout(() => {
            app.destroy(true);
        }, 3000);
    }

    showEmoji(type, x, y) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        const img = document.createElement('img');
        // 根據不同類型選擇不同的表情符號
        switch(type) {
            case 'correct':
                img.src = 'img/emo-heart.png';
                break;
            case 'wrong':
                img.src = 'img/emo-sad.png';
                break;
            case 'powerup':
                img.src = 'img/tool-star.png';
                break;
            default:
                img.src = 'img/emo-heart.png';
        }
        img.style.width = '35px';
        img.style.height = '35px';
        emoji.appendChild(img);

        emoji.style.cssText = `
            position: absolute;
            left: ${x + this.game.pixelSize/2}px;
            top: ${y - this.game.pixelSize/2}px;
            animation: fadeUpAndOut 0.5s ease-out forwards;
            z-index: 1000;
            transform: translate(-50%, -50%);
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.querySelector('.game-container').appendChild(emoji);
        
        // 動畫結束後移除元素
        setTimeout(() => {
            emoji.remove();
        }, 500);
    }

    startGlowEffect() {
        this.glowEffect = true;
        this.glowStartTime = Date.now();
    }

    stopGlowEffect() {
        this.glowEffect = false;
    }

    isGlowing() {
        if (!this.glowEffect) return false;
        const elapsed = Date.now() - this.glowStartTime;
        return elapsed < this.glowDuration;
    }

    //當碰到正確食物時, 產生動畫
    playCollectParticles(x, y) {
        const particleCount = 10;
        const colors = ['#00c748'];  // 綠色
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const particle = document.createElement('div');
            particle.className = 'collect-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.backgroundColor = colors[0];
            
            // 正方形粒子
            const size = Math.random() * 6 + 6;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '0';  // 確保是正方形
            
            document.body.appendChild(particle);

            gsap.to(particle, {
                x: Math.cos(angle) * (120 + Math.random() * 60),
                y: Math.sin(angle) * (120 + Math.random() * 60),
                scale: Math.random() * 0.8 + 0.5,
                opacity: 0,
                rotation: Math.random() * 720 - 360,  // 旋轉效果
                duration: 1.2 + Math.random() * 0.6,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }

        // 中心爆炸效果
        const burst = document.createElement('div');
        burst.className = 'collect-burst';
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;
        document.body.appendChild(burst);

        gsap.to(burst, {
            scale: 10,
            opacity: 0,
            rotation: 45,  // 添加45度旋轉
            duration: 1,
            ease: 'power2.out',
            onComplete: () => burst.remove()
        });
    }
} 