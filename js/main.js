import { initDOMHandlers } from './ui/ui-handlers.js';
import { engine } from './core/game-engine.js';
import { ui } from './ui/ui-renderer.js';  // Use exported singleton!
import { BoardEditor } from './editor.js';
import { SVGBoardRenderer } from './svg-board-renderer.js';
import { DebugManager } from './debug-manager.js';

// --- INITIALIZATION ---
// UIRenderer singleton is now imported from ui-renderer.js (not created here)

// RENDER BOARD USING SVG
const boardWrapper = document.getElementById('board-rotator');
const boardRenderer = new SVGBoardRenderer(boardWrapper);
ui.boardRenderer = boardRenderer;
window.boardRenderer = boardRenderer; // Make it globally accessible for editor

// Initialize Debug Manager (globally accessible)
window.debugManager = new DebugManager(engine);

// Render board when game starts (Monitor the PARENT container for visibility)
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.board-container');

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList && !mutation.target.classList.contains('hidden')) {
                console.log("Board became visible. Rendering...");
                boardRenderer.render();
                observer.disconnect();
            }
        });
    });

    if (mainContainer) {
        observer.observe(mainContainer, { attributes: true, attributeFilter: ['class'] });
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
