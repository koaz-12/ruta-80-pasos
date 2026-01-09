// INSPECTOR DE CASILLAS - Versión Simplificada
// Pega esto en la consola del navegador después de cargar el juego

console.clear();
console.log('%c🔍 Inspector Activado', 'color: cyan; font-size: 16px; font-weight: bold');

const svg = document.querySelector('svg');
if (!svg) {
    console.error('❌ No se encontró el SVG del tablero');
} else {
    svg.addEventListener('click', async function (e) {
        console.log('Click detectado en:', e.target);

        // Try to find tile group
        let element = e.target;
        let found = false;

        // Search up to 5 parents
        for (let i = 0; i < 5; i++) {
            if (!element) break;

            console.log(`Nivel ${i}:`, element.tagName, element.classList, element.dataset);

            const tileId = element.getAttribute('data-tile-id');
            if (tileId) {
                found = true;
                console.log('%c━━━━━━ CASILLA ENCONTRADA ━━━━━━', 'color: yellow; font-weight: bold');
                console.log('ID:', tileId);

                // Get data
                const mapData = await import('./js/data/map-data.js');
                const { SAVED_LAYOUT, buildGraph } = mapData;
                const graph = buildGraph();

                const tile = SAVED_LAYOUT.tiles.find(t => String(t.id) === String(tileId));
                const node = graph[tileId];

                console.log('Tile:', tile);
                console.log('Node:', node);
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: yellow');
                break;
            }

            element = element.parentElement;
        }

        if (!found) {
            console.log('⚠️ No se encontró data-tile-id en este elemento');
        }
    });

    console.log('✅ Haz click en cualquier parte del tablero');
}
