import { Generator } from './generators.js';
import { UI } from './ui.js';
import { AudioSystem } from './audio.js';

export class Game {
    constructor() {
        this.ui = new UI();
        this.audio = new AudioSystem();
        this.generator = new Generator();

        this.state = {
            activeRules: [],
            currentObjects: [],
            level: 1,
            score: 0,
            mistakes: 0,
            maxMistakes: 3,
            isPlaying: false,
            isAdmin: false
        };

        this.timerInterval = null;
        this.attachEvents();
    }

    attachEvents() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.audio.init();
            this.start();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.returnToMenu();
        });

        this.ui.elements.gameGrid.addEventListener('click', (e) => {
            if (!this.state.isPlaying) return;

            const objEl = e.target.closest('.game-object');
            if (!objEl) return;

            const id = objEl.dataset.id;
            const obj = this.state.currentObjects.find(o => o.id === id);

            if (obj) {
                this.handleObjectSelection(obj);
            }
        });

        this.ui.elements.toggleDebug.addEventListener('change', (e) => {
            this.state.isAdmin = e.target.checked;
            this.ui.renderGrid(this.state.currentObjects, this.state.activeRules, this.state.isAdmin);
        });

        this.ui.elements.gameGrid.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('game-object')) {
                this.audio.playHover();
            }
        });
    }

    start() {
        this.state = {
            activeRules: [],
            currentObjects: [],
            level: 1,
            score: 0,
            mistakes: 0,
            maxMistakes: 3,
            isPlaying: true,
            isAdmin: this.state.isAdmin
        };

        this.generator = new Generator();
        this.ui.showScreen('game');
        this.audio.startDrone();
        this.nextRound();
    }

    nextRound() {
        this.ui.updateHUD(this.state.level, this.state.mistakes, this.state.maxMistakes, this.state.score);
        this.audio.updateIntensity(this.state.level);
        this.ui.applyDistractions(this.state.level);

        // HARDER: Scale difficulty
        this.generator.difficultyLevel = this.state.level;

        // Refresh existing rule texts (Dynamic Phrasing)
        this.state.activeRules.forEach(rule => {
            this.generator.refreshRuleDescription(rule);
        });

        // Add rule
        const newRule = this.generator.generateRule();
        this.state.activeRules.push(newRule);

        try {
            // HARDER: Scaling object density
            const count = Math.min(5 + Math.floor(this.state.level / 1.5), 20);

            this.state.currentObjects = this.generator.generateRoundObjects(count, this.state.activeRules);

            this.ui.renderRules(this.state.activeRules);
            this.ui.renderGrid(this.state.currentObjects, this.state.activeRules, this.state.isAdmin);

            this.startTimer();

        } catch (e) {
            console.error("Round generation failed", e);
            this.state.activeRules.shift();
            this.nextRound();
        }
    }

    startTimer() {
        clearInterval(this.timerInterval);
        const totalTime = Math.max(15 - (this.state.level * 0.5), 5);
        let timeLeft = totalTime;

        this.ui.updateTimer(timeLeft, totalTime);

        this.timerInterval = setInterval(() => {
            if (!this.state.isPlaying) {
                clearInterval(this.timerInterval);
                return;
            }
            timeLeft -= 0.1;
            this.ui.updateTimer(timeLeft, totalTime);
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeout();
            }
        }, 100);
    }

    handleTimeout() {
        this.handleFailure();
    }

    handleObjectSelection(object) {
        const isCorrect = this.state.activeRules.every(rule => rule.check(object));

        if (isCorrect) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    handleSuccess() {
        clearInterval(this.timerInterval);
        this.audio.playSuccess();
        this.state.score += 100 * this.state.level;
        this.state.level++;
        this.nextRound();
    }

    handleFailure() {
        this.audio.playError();
        this.state.mistakes++;
        this.ui.updateHUD(this.state.level, this.state.mistakes, this.state.maxMistakes, this.state.score);

        if (this.state.mistakes >= this.state.maxMistakes) {
            this.gameOver();
        } else {
            const penaltyRule = this.generator.generateRule();
            this.state.activeRules.push(penaltyRule);
            this.ui.renderRules(this.state.activeRules);

            try {
                const count = Math.min(5 + Math.floor(this.state.level / 1.5), 20);
                this.state.currentObjects = this.generator.generateRoundObjects(count, this.state.activeRules);
                this.ui.renderGrid(this.state.currentObjects, this.state.activeRules, this.state.isAdmin);
                this.startTimer();
            } catch (e) {
                this.state.activeRules.pop();
                const count = Math.min(5 + Math.floor(this.state.level / 1.5), 20);
                this.state.currentObjects = this.generator.generateRoundObjects(count, this.state.activeRules);
                this.ui.renderGrid(this.state.currentObjects, this.state.activeRules, this.state.isAdmin);
                this.startTimer();
            }
        }
    }

    gameOver() {
        this.state.isPlaying = false;
        clearInterval(this.timerInterval);
        this.audio.stopDrone();
        this.ui.setGameOver(this.state.level, this.state.score);
    }

    returnToMenu() {
        this.state.isPlaying = false;
        clearInterval(this.timerInterval);
        this.audio.stopDrone();
        this.ui.showScreen('menu');
    }
}
