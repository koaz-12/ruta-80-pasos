// Editor Mode Toggle and Export - Accessible from Lobby
(function () {
    let editorMode = false;

    const toggleBtn = document.getElementById('toggle-editor');
    const exportBtn = document.getElementById('export-coords');
    const controlsDiv = document.getElementById('editor-controls');
    const lobbyEditorBtn = document.getElementById('btn-editor-mode');

    // Enter Editor from Lobby button
    if (lobbyEditorBtn) {
        lobbyEditorBtn.addEventListener('click', () => {
            console.log('[EDITOR] Loading editor from lobby...');

            // Wait for board renderer to be ready
            setTimeout(() => {
                if (window.boardRenderer && window.boardRenderer.activateEditorMode) {
                    window.boardRenderer.activateEditorMode();
                    console.log('[EDITOR] Editor mode activated via SVGBoardRenderer');
                } else {
                    console.error('[EDITOR] Board renderer not available');
                    alert('Error: El editor no está disponible. Recarga la página.');
                }
            }, 100);
        });
    }

    // Toggle editor mode
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            editorMode = !editorMode;

            if (window.boardRenderer) {
                window.boardRenderer.isEditorMode = editorMode;
            }

            if (editorMode) {
                toggleBtn.textContent = '🔧 Modo Editor: ON';
                toggleBtn.style.background = '#FF5722';
                if (exportBtn) exportBtn.style.display = 'block';
            } else {
                toggleBtn.textContent = '🔧 Modo Editor: OFF';
                toggleBtn.style.background = '#4CAF50';
                if (exportBtn) exportBtn.style.display = 'none';
            }
        });
    }

    // Export coordinates
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (!window.boardRenderer) {
                alert('Tablero no cargado');
                return;
            }

            const tiles = window.boardRenderer.svg.querySelectorAll('.tile-group');
            const coords = [];

            tiles.forEach(tile => {
                const id = tile.getAttribute('data-id');
                const display = tile.getAttribute('data-display');
                const x = parseInt(tile.dataset.x) || 0;
                const y = parseInt(tile.dataset.y) || 0;
                coords.push({ id, display, x, y });
            });

            // Sort by ID
            coords.sort((a, b) => {
                const aNum = parseInt(a.id);
                const bNum = parseInt(b.id);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.id.localeCompare(b.id);
            });

            const output = JSON.stringify(coords, null, 4);

            navigator.clipboard.writeText(output).then(() => {
                alert('✅ Coordenadas copiadas!');
            }).catch(() => {
                console.log('COORDENADAS:', output);
                alert('Ver Consola (F12)');
            });
        });
    }
})();
