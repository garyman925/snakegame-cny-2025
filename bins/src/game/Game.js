import { Snake } from './Snake.js';
import { FoodSystem } from './Food.js';
import { PowerUpSystem } from './PowerUp.js';
import { ScoreSystem } from './Score.js';
import { Timer } from './Timer.js';
import { Effects } from './Effects.js';
import { InputSystem } from './Input.js';
import { UISystem } from './UI.js';
import { GameState } from './State.js';
import { AudioManager } from '../utils/AudioManager.js';
import { gameConfig } from '../config/gameConfig.js';
import { difficulties } from '../config/difficulties.js';

export class Game {
    constructor() {
        // 初始化遊戲系統
        this.audio = new AudioManager();
        this.state = new GameState(this);
        this.snake = new Snake(this);
        this.food = new FoodSystem(this);
        this.powerUps = new PowerUpSystem(this);
        this.score = new ScoreSystem(this);
        this.timer = new Timer(this);
        this.effects = new Effects(this);
        this.input = new InputSystem(this);
        this.ui = new UISystem(this);

        // 遊戲基本屬性
        this.gameLoop = null;
        this.frameInterval = gameConfig.frameInterval;
        this.currentDifficulty = difficulties.NORMAL;
        this.isGameOver = false;
        this.isPaused = false;

        // 詞組相關
        this.greetingsData = [];
        this.currentGreetingIndex = 0;
        this.currentWords = [];
        this.currentWordIndex = 0;
        this.completedGreetings = [];

        // 開始初始化
        this.state.changeState('INIT');
    }

    // 遊戲循環控制
    startGameLoop() {
        if (this.gameLoop) return;
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.frameInterval);
    }

    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    // 遊戲更新
    update() {
        if (this.isPaused || this.isGameOver) return;

        this.snake.move();
        const headPosition = this.snake.getInterpolatedHeadPosition();
        this.food.checkCollisions(headPosition);
        this.powerUps.checkCollisions(headPosition);
    }

    // 遊戲繪製
    draw() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.snake.draw(ctx);
        this.food.draw(ctx);
        this.powerUps.draw(ctx);
        this.effects.updateGlowEffect(ctx);
    }

    // 遊戲控制
    startGame() {
        this.state.startGame();
    }

    pauseGame() {
        this.state.pauseGame();
    }

    resumeGame() {
        this.state.resumeGame();
    }

    gameOver() {
        this.state.gameOver();
    }

    resetGame() {
        this.state.restartGame();
    }

    // 難度設置
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulties[difficulty];
        this.snake.setMoveSpeed(this.currentDifficulty.moveSpeed);
    }

    // 詞組管理
    async loadGreetings() {
        try {
            const response = await fetch('data/words.json');
            this.greetingsData = await response.json();
            this.selectNextGreeting();
        } catch (error) {
            console.error('Failed to load greetings:', error);
        }
    }

    selectNextGreeting() {
        if (this.currentGreetingIndex < this.greetingsData.length) {
            this.currentWords = this.greetingsData[this.currentGreetingIndex].split('');
            this.currentWordIndex = 0;
            this.ui.updateCurrentPhrase(this.currentWords);
        }
    }

    getRandomWord() {
        const allWords = this.greetingsData.join('').split('');
        return allWords[Math.floor(Math.random() * allWords.length)];
    }

    // 資源管理
    cleanup() {
        this.stopGameLoop();
        this.state.cleanup();
    }
} 