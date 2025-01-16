export class DifficultySystem {
    constructor(game) {
        this.game = game;
        this.currentDifficulty = 'EASY';  // 預設難度

        this.difficulties = {
            EASY: {
                name: '簡單',
                moveSpeed: 0.1,
                powerUpFrequency: 15000,  // 15秒一個道具
                scoreMultiplier: 1
            },
            NORMAL: {
                name: '普通',
                moveSpeed: 0.15,
                powerUpFrequency: 10000,  // 10秒一個道具
                scoreMultiplier: 1.5
            },
            HARD: {
                name: '困難',
                moveSpeed: 0.2,
                powerUpFrequency: 8000,   // 8秒一個道具
                scoreMultiplier: 2
            }
        };

        this.initializeDifficulty();
    }

    initializeDifficulty() {
        const difficulty = this.difficulties[this.currentDifficulty];
        this.updateGameParameters(difficulty);
    }

    setDifficulty(difficultyLevel) {
        if (this.difficulties[difficultyLevel]) {
            this.currentDifficulty = difficultyLevel;
            const difficulty = this.difficulties[difficultyLevel];
            this.updateGameParameters(difficulty);
            console.log(`難度已設置為: ${difficulty.name}`);
        } else {
            console.error('無效的難度等級:', difficultyLevel);
        }
    }

    updateGameParameters(difficulty) {
        this.game.moveSpeed = difficulty.moveSpeed;
        this.game.powerUpSpawnInterval = difficulty.powerUpFrequency;
        this.game.scoreMultiplier = difficulty.scoreMultiplier;
    }

    getCurrentDifficulty() {
        return this.difficulties[this.currentDifficulty];
    }

    getDifficultyName() {
        return this.difficulties[this.currentDifficulty].name;
    }
} 