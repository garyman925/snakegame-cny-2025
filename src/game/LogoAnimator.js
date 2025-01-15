export class LogoAnimator {
    constructor() {
        this.logo = document.querySelector('.game-logo');
        this.enterTimeline = null;
        this.idleTimeline = null;
    }

    // 入場動畫
    playEnterAnimation() {
        if (this.enterTimeline) this.enterTimeline.pause();
        
        this.enterTimeline = anime.timeline({
            easing: 'easeOutElastic(1, .8)',
            complete: () => {
                this.playIdleAnimation();
            }
        });

        // 設置初始狀態
        this.logo.style.transform = 'translateY(-100vh) rotate(0deg)';
        
        // 添加動畫序列
        this.enterTimeline
            .add({
                targets: this.logo,
                translateY: [-100 * window.innerHeight / 100, 0],
                rotate: {
                    value: [-720, 0],
                    duration: 2000
                },
                duration: 1500,
            })
            .add({
                targets: this.logo,
                scale: [1, 1.2, 1],
                duration: 800,
                easing: 'spring(1, 80, 10, 0)'
            }, '-=400');
    }

    // 閒置動畫
    playIdleAnimation() {
        if (this.idleTimeline) this.idleTimeline.pause();
        
        this.idleTimeline = anime.timeline({
            loop: true,
            direction: 'alternate'
        });

        this.idleTimeline
            .add({
                targets: this.logo,
                translateY: -10,
                rotate: 3,
                duration: 1500,
                easing: 'easeInOutQuad'
            })
            .add({
                targets: this.logo,
                translateY: 0,
                rotate: -3,
                duration: 1500,
                easing: 'easeInOutQuad'
            });
    }

    // 停止所有動畫
    stopAnimations() {
        if (this.enterTimeline) this.enterTimeline.pause();
        if (this.idleTimeline) this.idleTimeline.pause();
    }

    // 暫停閒置動畫
    pauseIdleAnimation() {
        if (this.idleTimeline) this.idleTimeline.pause();
    }

    // 恢復閒置動畫
    resumeIdleAnimation() {
        if (this.idleTimeline) this.idleTimeline.play();
    }
} 