/**
 * Handles all DOM manipulations.
 */
export class UI {
    constructor() {
        this.app = document.getElementById('app');
        this.screens = {
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over-screen')
        };

        this.elements = {
            level: document.getElementById('level-display'),
            mistakes: document.getElementById('mistakes-display'),
            maxMistakes: document.getElementById('max-mistakes'),
            score: document.getElementById('score-display'),
            rulesList: document.getElementById('rules-list'),
            gameGrid: document.getElementById('game-grid'),
            finalLevel: document.getElementById('final-level'),
            finalScore: document.getElementById('final-score'),
            toggleDebug: document.getElementById('toggle-debug'),
            debugControls: document.getElementById('debug-controls'),
            timerFill: document.getElementById('timer-fill')
        };
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });

        const target = this.screens[screenName];
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    }

    updateHUD(level, mistakes, maxMistakes, score) {
        this.elements.level.textContent = level.toString().padStart(2, '0');
        this.elements.mistakes.textContent = mistakes;
        this.elements.maxMistakes.textContent = maxMistakes;
        this.elements.score.textContent = score;

        // Visual warning for mistakes
        if (mistakes >= maxMistakes - 1) {
            this.elements.mistakes.parentElement.style.color = 'var(--accent-error)';
        } else {
            this.elements.mistakes.parentElement.style.color = 'inherit';
        }
    }

    updateTimer(current, max) {
        const pct = Math.max(0, (current / max) * 100);
        if (this.elements.timerFill) {
            this.elements.timerFill.style.width = `${pct}%`;

            if (pct < 30) {
                this.elements.timerFill.parentElement.classList.add('timer-critical');
            } else {
                this.elements.timerFill.parentElement.classList.remove('timer-critical');
            }
        }
    }

    renderRules(rules) {
        this.elements.rulesList.innerHTML = '';
        rules.forEach(rule => {
            const li = document.createElement('li');
            li.textContent = `♥ ${rule.description}`; // Cute bullet point
            this.elements.rulesList.appendChild(li);
        });
    }

    renderGrid(objects, activeRules, isAdmin) {
        this.elements.gameGrid.innerHTML = '';

        objects.forEach(obj => {
            const el = document.createElement('div');
            el.className = `game-object shape-${obj.shape}`;
            const colorCode = this.getColorCode(obj.color);
            el.style.backgroundColor = colorCode;

            // Safety check for number
            let displayNum = obj.number;
            if (typeof displayNum !== 'number' || isNaN(displayNum)) {
                console.error("Invalid number detected:", obj);
                displayNum = Math.floor(Math.random() * 9) + 1; // Fallback
            }
            el.textContent = displayNum;
            el.dataset.id = obj.id;

            // Triangle specific style fix using clip-path
            if (obj.shape === 'triangle') {
                el.style.backgroundColor = colorCode;
                el.style.setProperty('background-color', colorCode, 'important');
            }

            if (isAdmin) {
                const isValid = activeRules.every(r => r.check(obj));
                if (isValid) {
                    el.classList.add('debug-valid');
                }
            }

            this.elements.gameGrid.appendChild(el);
        });
    }

    getColorCode(colorName) {
        // PASTEL PALETTE for "Versi Cewek"
        const map = {
            'red': '#ff8fa3',    // Pastel Red/Pink
            'blue': '#80deea',   // Pastel Blue/Cyan
            'green': '#a7f3d0',  // Pastel Green/Mint
            'yellow': '#fcd34d', // Warm Yellow
            'purple': '#d8b4fe', // Pastel Purple
            'cyan': '#67e8f9'    // Cyan
        };
        return map[colorName] || colorName;
    }

    setGameOver(level, score) {
        this.elements.finalLevel.textContent = level;
        this.elements.finalScore.textContent = score;
        this.showScreen('gameOver');
    }

    applyDistractions(level) {
        this.elements.gameGrid.classList.remove('distraction-pulse', 'distraction-spin', 'distraction-jitter');

        if (level >= 3) {
            this.elements.gameGrid.classList.add('distraction-pulse');
        }
        if (level >= 4) {
            this.elements.gameGrid.classList.add('distraction-jitter');
        }
        if (level >= 6) {
            this.elements.gameGrid.classList.remove('distraction-jitter');
            this.elements.gameGrid.classList.add('distraction-spin');
        }
    }
}
