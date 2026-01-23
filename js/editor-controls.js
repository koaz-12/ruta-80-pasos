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

                    // Show the empty tiles button
                    if (window.emptyTilesBtn) {
                        window.emptyTilesBtn.style.display = 'block';
                    }
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

    // === TOGGLE EMPTY TILES (for screenshots) ===
    let emptyTilesMode = false;

    // Create the button dynamically (hidden by default, shown in editor mode)
    const emptyTilesBtn = document.createElement('button');
    emptyTilesBtn.id = 'toggle-empty-tiles';
    emptyTilesBtn.textContent = '📷 Casillas Vacías';
    emptyTilesBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: none;
    `;
    document.body.appendChild(emptyTilesBtn);

    // Make button available globally to show/hide from editor
    window.emptyTilesBtn = emptyTilesBtn;

    emptyTilesBtn.addEventListener('click', () => {
        emptyTilesMode = !emptyTilesMode;

        // Toggle visibility of all tile texts
        const tileTexts = document.querySelectorAll('.tile-group text');
        const tileIcons = document.querySelectorAll('.tile-group image');

        tileTexts.forEach(text => {
            text.style.display = emptyTilesMode ? 'none' : '';
        });

        tileIcons.forEach(icon => {
            icon.style.display = emptyTilesMode ? 'none' : '';
        });

        if (emptyTilesMode) {
            emptyTilesBtn.textContent = '📷 Mostrar Texto';
            emptyTilesBtn.style.background = '#FF9800';
        } else {
            emptyTilesBtn.textContent = '📷 Casillas Vacías';
            emptyTilesBtn.style.background = '#2196F3';
        }

        console.log(`[EDITOR] Empty tiles mode: ${emptyTilesMode ? 'ON' : 'OFF'}`);
    });
})();
