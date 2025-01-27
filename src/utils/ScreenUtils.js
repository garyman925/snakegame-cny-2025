export class ScreenUtils {
    static getScreenConfig() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 更細緻的屏幕尺寸判斷
        const isSmallScreen = windowWidth <= 414;    // 手機
        const isMediumScreen = windowWidth <= 1024;  // 平板
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 基礎單位計算（以最小邊長為基準）
        const baseUnit = Math.min(windowWidth, windowHeight);
        
        // 計算縮放比例
        const scale = isSmallScreen ? 
            0.08 :   // 手機：8%
            isMediumScreen ? 
                0.06 :   // 平板：6%
                0.05;    // 大屏：5%

        // 使用縮放比例計算基礎像素大小
        const pixelSize = baseUnit * scale;

        // 所有元素使用 pixelSize 作為基準進行縮放
        const elementSizes = {
            snake: pixelSize,              // 蛇身大小
            food: pixelSize * 0.9,         // 食物稍微小一點
            powerUp: pixelSize * 1.2,      // 道具稍微大一點
            effectParticle: pixelSize * 0.5,// 特效粒子
            comboText: pixelSize * 1.5,    // 連擊文字
            scoreText: pixelSize * 1.2     // 分數文字
        };

        // 間距和邊距也使用 pixelSize 作為基準
        const spacing = {
            margin: pixelSize * (isSmallScreen ? 1.5 : isMediumScreen ? 1.75 : 2),
            bottomMargin: pixelSize * (isSmallScreen ? 2 : isMediumScreen ? 2.25 : 2.5),
            topMargin: pixelSize * (isSmallScreen ? 1.5 : isMediumScreen ? 1.75 : 2),
            minFoodDistance: pixelSize * (isSmallScreen ? 2.5 : isMediumScreen ? 2.75 : 3),
            gridSize: pixelSize  // 遊戲網格大小
        };

        return {
            windowWidth,
            windowHeight,
            isSmallScreen,
            isMediumScreen,
            isMobile,
            pixelSize,
            scale,          // 導出縮放比例
            elementSizes,   // 導出所有元素尺寸
            spacing,        // 導出所有間距
            // 保持向後兼容的屬性
            margin: spacing.margin,
            bottomMargin: spacing.bottomMargin,
            topMargin: spacing.topMargin,
            minFoodDistance: spacing.minFoodDistance
        };
    }

    // 新增：獲取元素實際顯示尺寸的輔助方法
    static getElementSize(elementType, config = null) {
        if (!config) {
            config = this.getScreenConfig();
        }
        return config.elementSizes[elementType] || config.pixelSize;
    }

    // 新增：獲取間距的輔助方法
    static getSpacing(spacingType, config = null) {
        if (!config) {
            config = this.getScreenConfig();
        }
        return config.spacing[spacingType] || config.pixelSize;
    }

    static getHeaderHeight() {
        const header = document.querySelector('.game-header');
        return header ? header.getBoundingClientRect().height : 0;
    }
} 