// Editor Mode Toggle and Export
(function () {
    let editorMode = false;
    let selectedTile = null;

    const toggleBtn = document.getElementById('toggle-editor');
    const exportBtn = document.getElementById('export-coords');

    // Toggle editor mode
    toggleBtn.addEventListener('click', () => {
        editorMode = !editorMode;

        if (window.boardRenderer) {
            window.boardRenderer.isEditorMode = editorMode;
        }

        if (editorMode) {
            toggleBtn.textContent = '🔧 Modo Editor: ON';
            toggleBtn.style.background = '#FF5722';
            exportBtn.style.display = 'block';
        } else {
            toggleBtn.textContent = '🔧 Modo Editor: OFF';
            toggleBtn.style.background = '#4CAF50';
            exportBtn.style.display = 'none';
            // Clear selection
            if (selectedTile) {
                selectedTile.style.outline = '';
                selectedTile = null;
            }
        }
    });

    // Export coordinates
    exportBtn.addEventListener('click', () => {
        if (!window.boardRenderer) return;

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

        // Format as JSON
        const output = JSON.stringify(coords, null, 4);

        // Copy to clipboard
        navigator.clipboard.writeText(output).then(() => {
            alert('✅ Coordenadas copiadas al portapapeles!\\n\\nPega el resultado en map-data.js');
        }).catch(err => {
            // Fallback: show in console
            console.log('COORDENADAS:', output);
            alert('⚠️ No se pudo copiar automáticamente.\\nMira la consola (F12) para ver las coordenadas.');
        });
    });

    // Visual selection feedback
    document.addEventListener('click', (e) => {
        if (!editorMode) return;

        const tile = e.target.closest('.tile-group');
        if (tile) {
            // Clear previous selection
            if (selectedTile) {
                selectedTile.style.outline = '';
            }

            // Select new tile
            selectedTile = tile;
            selectedTile.style.outline = '3px solid #FF00FF';
            selectedTile.style.outlineOffset = '2px';
        }
    });
})();
