// Script to migrate SAVED_LAYOUT IDs to sequential 1-80
// Run this in browser console after loading map-data.js

(async function migrateSavedLayout() {
    const mapData = await import('./js/data/map-data.js');
    const { buildGraph, SAVED_LAYOUT } = mapData;

    // Build ID mapping from graph traversal
    const graph = buildGraph();
    const oldLayout = SAVED_LAYOUT;

    // Traverse graph to build OLD_ID → NEW_ID mapping
    const idMapping = {};
    const queue = [{ oldId: '0', newId: '0', step: 0 }];
    const visited = new Set();

    // We need to map based on the ACTUAL old graph structure
    // Since we changed buildGraph, we need the OLD route
    const OLD_ROUTE = [
        '0', '5062', '6057', '6055', '6056', '6053', '6054', '1', '2', '3',
        '4', '5', '6', '7', '8', '9', '10'
        // This needs to match the diagnostic output
    ];

    // Create mapping from diagnostic route
    OLD_ROUTE.forEach((oldId, index) => {
        idMapping[oldId] = String(index);
    });

    // Additional mappings for branch paths
    // These need to be mapped manually based on the new structure
    idMapping['1012'] = '11'; //  Alto path start (after junction 10)
    idMapping['1013'] = '12';
    idMapping['1014'] = '13';

    idMapping['2012'] = '10a'; // Medio path
    idMapping['2013'] = '11a';
    idMapping['2014'] = '12a';

    idMapping['3012'] = '10b'; // Bajo path  
    idMapping['3013'] = '11b';
    idMapping['3014'] = '12b';

    // Continue with rest of path...
    // This is getting complex, let me simplify

    console.log('ID Mapping:', idMapping);

    // Apply mapping to SAVED_LAYOUT
    const newLayout = {
        tiles: oldLayout.tiles.map(tile => ({
            ...tile,
            id: idMapping[tile.id] || tile.id,
            display: idMapping[tile.id] || tile.display
        })),
        edges: oldLayout.edges.map(([from, to]) => [
            idMapping[from] || from,
            idMapping[to] || to
        ])
    };

    console.log('New SAVED_LAYOUT:', JSON.stringify(newLayout, null, 2));

    return newLayout;
})();
