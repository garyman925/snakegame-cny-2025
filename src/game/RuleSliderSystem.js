export class RuleSliderSystem {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.rule-slide');
        this.totalSlides = this.slides.length;
        
        this.init();
    }
    
    init() {
        this.showSlide(0);
        this.bindEvents();
    }
    
    bindEvents() {
        const nextButton = document.querySelector('.slide-nav.next');
        const prevButton = document.querySelector('.slide-nav.prev');
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextSlide());
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.prevSlide());
        }
        
        // 綁定指示器點擊事件
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.showSlide(index));
        });
        
        // 添加鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('.instruction-popup.active')) {
                if (e.key === 'ArrowRight') this.nextSlide();
                if (e.key === 'ArrowLeft') this.prevSlide();
            }
        });

        // 添加觸控支持
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.querySelector('.rule-slider').addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.querySelector('.rule-slider').addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diffX = touchStartX - touchEndX;

            // 判斷滑動方向
            if (Math.abs(diffX) > 50) { // 設置最小滑動距離
                if (diffX > 0) {
                    this.nextSlide(); // 向左滑動
                } else {
                    this.prevSlide(); // 向右滑動
                }
            }
        }, { passive: true });
    }
    
    showSlide(index) {
        // 隱藏所有 slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // 顯示當前 slide
        this.slides[index].classList.add('active');
        this.currentSlide = index;
        
        // 更新指示器
        this.updateIndicators(index);
        
        // 更新導航按鈕狀態
        this.updateNavButtons();
        
        // 計算並應用位移
        const slideWidth = this.slides[0].offsetWidth;
        const slidesContainer = document.querySelector('.rule-slides');
        slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
    }
    
    updateIndicators(index) {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }
    
    updateNavButtons() {
        const prevButton = document.querySelector('.slide-nav.prev');
        const nextButton = document.querySelector('.slide-nav.next');
        
        if (prevButton) {
            prevButton.style.display = this.currentSlide === 0 ? 'none' : 'block';
        }
        
        if (nextButton) {
            nextButton.style.display = this.currentSlide === this.totalSlides - 1 ? 'none' : 'block';
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        }
    }
    
    prevSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    }
} 