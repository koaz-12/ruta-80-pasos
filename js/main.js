import { initDOMHandlers } from './ui/ui-handlers.js';
import { GameEngine } from './core/game-engine.js';
import { UIRenderer } from './ui/ui-renderer.js';
import { BoardEditor } from './editor.js';
import { SVGBoardRenderer } from './svg-board-renderer.js';

// --- INITIALIZATION ---
const store = window.gameStore = new GameEngine();
const ui = new UIRenderer(store);

// RENDER BOARD USING SVG
const boardContainer = document.querySelector('.board-container');
const boardRenderer = new SVGBoardRenderer(boardContainer);
ui.boardRenderer = boardRenderer; // Link UI to Board logic

// Render board when game starts (or on demand)
document.addEventListener('DOMContentLoaded', () => {
    // Board is hidden initially, render when shown
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList && !mutation.target.classList.contains('hidden')) {
                boardRenderer.render();
                observer.disconnect(); // Only render once
            }
        });
    });

    if (boardContainer) {
        observer.observe(boardContainer, { attributes: true, attributeFilter: ['class'] });
    }

    // Bind Lobby Editor Button
    const btnEditor = document.getElementById('btn-editor-mode');
    if (btnEditor) {
        const isDev = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
        if (isDev) {
            btnEditor.style.display = 'block'; // Show button
            btnEditor.onclick = () => boardRenderer.activateEditorMode();
        }
    }
});

// const editor = new BoardEditor(); // Legacy Editor removed
initDOMHandlers();
// Engine and UI are already instantiated and listening via imports
