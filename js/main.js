import { initDOMHandlers } from './ui/ui-handlers.js';
import { engine } from './core/game-engine.js'; // Starts engine listeners
import { ui } from './ui/ui-renderer.js'; // Starts UI listeners

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 La Ruta de los 80 Pasos - Iniciando módulos...");
    initDOMHandlers();
    // Engine and UI are already instantiated and listening via imports
});
