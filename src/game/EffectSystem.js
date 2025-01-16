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

        // 暫時註釋掉粒子系統的初始化，直到我們確保它可以正常工作
        // this.initParticleSystem();
    }

    // 暫時註釋掉這個方法
    /*
    initParticleSystem() {
        if (document.getElementById('particles-js')) {
            try {
                particlesJS('particles-js', {
                    particles: {
                        number: { value: 50 },
                        color: { value: '#ffff00' },
                        shape: { type: 'circle' },
                        opacity: { value: 0.5 },
                        size: { value: 3 },
                        move: {
                            enable: true,
                            speed: 2,
                            direction: 'none',
                            random: true
                        }
                    }
                });
            } catch (error) {
                console.warn('⚠️ 無法初始化粒子系統:', error);
            }
        } else {
            console.warn('⚠️ 找不到 particles-js 元素');
        }
    }
    */

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
        img.src = type === 'correct' ? 'img/emo-heart.png' : 'img/emo-sad.png';
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
} 