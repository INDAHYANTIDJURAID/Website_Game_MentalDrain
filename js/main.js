import { Game } from './game.js';

window.addEventListener('load', () => {
    const game = new Game();
    // Expose for debug if needed
    window.game = game;
});
