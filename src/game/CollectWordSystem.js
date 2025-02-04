export class CollectWordSystem {
    constructor(game) {
        this.game = game;
        this.collectedWordsElements = [];
        this.completedWords = [];
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.completedGreetings = [];
        
        // 初始化收集文字的UI元素
        this.initializeUI();
    }

    initializeUI() {
        // 獲取所有收集文字的元素
        const collectedWordsContainer = document.querySelector('.collected-words');
        if (collectedWordsContainer) {
            this.collectedWordsElements = Array.from(collectedWordsContainer.children);
        }
    }

    // 清空已收集的文字
    clearCollectedWords() {
        this.collectedWordsElements.forEach(element => {
            const span = element.querySelector('span');
            if (span) {
                span.textContent = '';
            }
            element.classList.remove('active', 'bounce');
        });
        this.currentWordIndex = 0;
    }

    // 顯示收集到的文字
    showCollectedWord(word, index) {
        const element = this.collectedWordsElements[index];
        if (element) {
            const span = element.querySelector('span');
            if (span) {
                span.textContent = word;
            }
            element.classList.add('active');
            
            // 添加彈跳動畫
            element.classList.remove('bounce');
            void element.offsetWidth; // 觸發重排
            element.classList.add('bounce');
        }
    }

    // 更新提示文字
    updateHints() {
        this.collectedWordsElements.forEach((element, index) => {
            const oldHint = element.querySelector('.hint');
            if (oldHint) {
                oldHint.remove();
            }
            
            const hint = document.createElement('div');
            hint.className = 'hint';
            hint.textContent = this.currentWords[index];
            element.appendChild(hint);
        });
    }

    // 檢查是否完成當前詞組
    isCurrentWordComplete() {
        const isComplete = this.collectedWordsElements.every(element => {
            const span = element.querySelector('span');
            return span && span.textContent;
        });

        // 添加日誌追蹤
        console.log('檢查當前題目完成狀態:', {
            是否完成: isComplete,
            當前收集文字: this.collectedWordsElements.map(el => 
                el.querySelector('span')?.textContent || '').join('')
        });

        if (isComplete) {
            const completedWords = this.collectedWordsElements.map(element => {
                const span = element.querySelector('span');
                return span ? span.textContent : '';
            });
            
            this.completedGreetings.push(completedWords.join(''));
            
            // 記錄完成題目的情況
            console.log('完成題目:', {
                完成的題目: completedWords.join(''),
                已完成題目數: this.completedGreetings.length,
                總題目數: this.game.greetingsData.length
            });
            
            // 更新 game 的統計數據
            if (this.game.stats) {
                this.game.stats.totalCollected = this.completedGreetings.length;
            }
        }

        return isComplete;
    }

    // 處理完成詞組的動畫
    showCompletionAnimation(words) {
        const container = document.querySelector('.collected-words');
        if (container) {
            container.classList.add('completed');
            setTimeout(() => {
                container.classList.remove('completed');
            }, 1000);
        }
    }

    // 設置新的詞組
    setNewWords(words) {
        this.currentWords = [...words];
        this.currentWordIndex = 0;
        this.clearCollectedWords();
        this.updateHints();

        // 添加滑入動畫
        const container = document.querySelector('.collected-words');
        if (container) {
            // 移除現有的動畫
            container.classList.remove('slide-down');
            // 強制重繪
            void container.offsetWidth;
            // 添加新的動畫
            container.classList.add('slide-down');
        }
    }

    // 收集一個新的文字
    collectWord(word, index) {
        this.showCollectedWord(word, index);
        if (index === this.currentWordIndex) {
            this.currentWordIndex++;
        }
    }

    // 檢查是否按正確順序收集
    isCorrectOrder(index) {
        return index === this.currentWordIndex;
    }

    // 獲取當前進度
    getProgress() {
        return {
            currentWordIndex: this.currentWordIndex,
            totalWords: this.currentWords.length,
            completedGreetings: this.completedGreetings
        };
    }
} 