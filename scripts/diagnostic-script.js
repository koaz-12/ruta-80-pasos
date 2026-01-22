// DIAGNOSTIC SCRIPT - Pega esto en la consola del navegador

(async function analyzeBoard() {
    console.clear();
    console.log('%c=== DIAGNÓSTICO DEL TABLERO ===', 'color: cyan; font-size: 16px; font-weight: bold');

    // Import modules
    const mapData = await import('./js/data/map-data.js');
    const { buildGraph, SAVED_LAYOUT } = mapData;

    const graph = buildGraph();
    const layoutIds = SAVED_LAYOUT.tiles.map(t => t.id);

    console.log('\n%c1. IDs EN BUILDGRAPH()', 'color: yellow; font-weight: bold');
    console.log(Object.keys(graph));

    console.log('\n%c2. IDs EN SAVED_LAYOUT', 'color: yellow; font-weight: bold');
    console.log(layoutIds);

    console.log('\n%c3. VALIDACIÓN', 'color: yellow; font-weight: bold');
    const missingInLayout = Object.keys(graph).filter(id => !layoutIds.includes(id));
    const missingInGraph = layoutIds.filter(id => !graph[id]);

    if (missingInLayout.length > 0) {
        console.log('%c❌ IDs en GRAPH pero NO en LAYOUT:', 'color: red', missingInLayout);
    }
    if (missingInGraph.length > 0) {
        console.log('%c❌ IDs en LAYOUT pero NO en GRAPH:', 'color: red', missingInGraph);
    }
    if (missingInLayout.length === 0 && missingInGraph.length === 0) {
        console.log('%c✅ Todos los IDs coinciden', 'color: green');
    }

    console.log('\n%c4. RUTA COMPLETA SEGÚN GRAPH', 'color: yellow; font-weight: bold');
    let pos = '0';
    let step = 0;
    const route = [];

    while (pos && step < 100) {
        const node = graph[pos];
        if (!node) {
            console.log(`%c❌ Paso ${step}: ID "${pos}" NO EXISTE en graph`, 'color: red');
            break;
        }

        const inLayout = layoutIds.includes(pos) ? '✅' : '❌';
        route.push({ step, id: pos, inLayout });

        if (Array.isArray(node.next)) {
            console.log(`%c🔀 Paso ${step}: ID "${pos}" ${inLayout} → BIFURCACIÓN`, 'color: orange; font-weight: bold');
            console.log(`   Opciones: ${node.next.join(', ')}`);
            console.log(`   Labels:`, node.branchInfo?.map(b => b.label).join(', '));
            break;
        }

        console.log(`Paso ${step}: ID "${pos}" ${inLayout} → ${node.next}`);
        pos = node.next;
        step++;
    }

    console.log('\n%c5. BIFURCACIONES ENCONTRADAS', 'color: yellow; font-weight: bold');
    Object.entries(graph).forEach(([id, node]) => {
        if (Array.isArray(node.next)) {
            const inLayout = layoutIds.includes(id) ? '✅' : '❌';
            console.log(`${inLayout} ID "${id}" → ${node.next.length} caminos: ${node.next.join(', ')}`);
        }
    });

    console.log('\n%c6. RESUMEN', 'color: cyan; font-size: 14px; font-weight: bold');
    console.log(`Total tiles en LAYOUT: ${layoutIds.length}`);
    console.log(`Total nodos en GRAPH: ${Object.keys(graph).length}`);
    console.log(`Pasos recorridos: ${step}`);

    return { graph, layoutIds, route, missingInLayout, missingInGraph };
})();
