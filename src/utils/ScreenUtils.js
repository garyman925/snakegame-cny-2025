export class ScreenUtils {
    static getScreenConfig() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isSmallScreen = windowWidth <= 390; // 使用最小的閾值
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 計算基礎像素大小
        const pixelSize = isMobile ? 
            (isSmallScreen ? 
                Math.min(windowWidth, windowHeight) * 0.08 : 
                Math.min(windowWidth, windowHeight) * 0.1
            ) : 
            Math.min(windowWidth, windowHeight) * 0.05;

        // 計算邊距
        const margin = isSmallScreen ? 
            pixelSize * 1.5 : 
            pixelSize * 2;

        // 計算頂部和底部邊距
        const bottomMargin = isSmallScreen ? 120 : 150;
        const topMargin = isSmallScreen ? 80 : 100;

        return {
            windowWidth,
            windowHeight,
            isSmallScreen,
            isMobile,
            pixelSize,
            margin,
            bottomMargin,
            topMargin,
            minFoodDistance: isSmallScreen ? pixelSize * 2.5 : pixelSize * 3
        };
    }

    static getHeaderHeight() {
        const header = document.querySelector('.game-header');
        return header ? header.getBoundingClientRect().height : 0;
    }
} 