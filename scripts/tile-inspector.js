// TILE INSPECTOR - Pega esto en la consola del navegador
// Click en cualquier casilla para ver su información

(function enableTileInspector() {
    console.log('%c🔍 TILE INSPECTOR ACTIVADO', 'color: cyan; font-size: 16px; font-weight: bold');
    console.log('Click en cualquier casilla del tablero para ver su información');

    // Crear tooltip element
    let tooltip = document.getElementById('tile-inspector-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tile-inspector-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            display: none;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;
        document.body.appendChild(tooltip);
    }

    // Get SVG and data
    const svg = document.querySelector('svg');

    // Add click listener to SVG
    svg.addEventListener('click', async function (e) {
        // Get clicked element
        const target = e.target;

        // Find parent group if clicked on rect/text
        let tileGroup = target;
        while (tileGroup && !tileGroup.classList.contains('tile')) {
            tileGroup = tileGroup.parentElement;
        }

        if (!tileGroup) return;

        // Get tile ID from data attribute
        const tileId = tileGroup.getAttribute('data-tile-id');
        if (!tileId) return;

        // Import data\n        const mapData = await import('./js/data/map-data.js');
        const { SAVED_LAYOUT, buildGraph } = mapData;
        const graph = buildGraph();

        // Find tile in layout
        const tile = SAVED_LAYOUT.tiles.find(t => String(t.id) === String(tileId));
        const node = graph[tileId];

        // Prepare data
        const info = {
            id: tileId,
            display: tile?.display || tileId,
            x: tile?.x || '?',
            y: tile?.y || '?',
            next: node?.next || '?',
            hasBranch: Array.isArray(node?.next),
            branchOptions: node?.branchInfo?.map(b => b.label).join(', ') || 'N/A'
        };

        // Log to console
        console.log('%c━━━━━ TILE INFO ━━━━━', 'color: yellow; font-weight: bold');
        console.log('ID:', info.id);
        console.log('Display:', info.display);
        console.log('Coordinates:', `x: ${info.x}, y: ${info.y}`);
        console.log('Next:', info.next);
        if (info.hasBranch) {
            console.log('🔀 JUNCTION:', info.branchOptions);
        }
        console.log('━━━━━━━━━━━━━━━━━━━');
        console.log('Full tile data:', tile);
        console.log('Full graph node:', node);

        // Show tooltip
        const content = `
            <div style="border-bottom: 1px solid #555; margin-bottom: 8px; padding-bottom: 4px;">
                <strong style="color: #4facfe;">TILE ${info.id}</strong>
            </div>
            <div>Display: ${info.display}</div>
            <div>X: ${info.x}, Y: ${info.y}</div>
            <div>Next: ${Array.isArray(info.next) ? info.next.join(', ') : info.next}</div>
            ${info.hasBranch ? `<div style="color: #fda085;">🔀 ${info.branchOptions}</div>` : ''}
            <div style="margin-top: 8px; font-size: 10px; color: #888;">Ver consola para más detalles</div>
        `;

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';

        // Hide after 3 seconds
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 3000);
    });

    console.log('✅ Listo! Click en cualquier casilla para ver su info');
})();
