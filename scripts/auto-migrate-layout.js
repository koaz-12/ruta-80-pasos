// AUTOMATIC LAYOUT MIGRATION SCRIPT v7.0
// Execute this in browser console at http://localhost:XXXX
// Copy the output and paste into map-data.js

(async function autoMigrateSavedLayout() {
    console.clear();
    console.log('%c=== AUTO MIGRATION SCRIPT v7.0 ===', 'color: cyan; font-size: 18px; font-weight: bold');

    // Import current data
    const mapData = await import('./js/data/map-data.js');
    const { SAVED_LAYOUT } = mapData;

    console.log('Current tiles:', SAVED_LAYOUT.tiles.length);

    // OLD ROUTE from diagnostic (the actual path through the board)
    const OLD_ROUTE_MAIN = [
        '0',     // Start
        '5062',  // 1
        '6057',  // 2
        '6055',  // 3
        '6056',  // 4
        '6053',  // 5
        '6054',  // 6
        '1',     // 7
        '2',     // 8
        '3',     // 9
        '4',     // 10 ← JUNCTION HERE
        '5',     // 11 (continues on main)
        '6',     // 12
        '7',     // 13
        '8',     // 14
        '9',     // 15
        '10',    // 16 (old junction, now regular)
        '18',    // 17
        '19',    // 18
        '20',    // 19
        '22',    // 20
        '21',    // 21
        '23',    // 22
        '31',    // 23
        '30',    // 24
        '29',    // 25 ← JUNCTION 2
        '24',    // 26
        '28',    // 27
        '27',    // 28
        '32',    // 29
        '26',    // 30
        '25',    // 31
        // Continue to 50, 79, 80...
    ];

    // Branch paths
    const BRANCHES = {
        // From old ID '4' (new ID '10')
        '1012': '11',   // Alto path
        '1013': '12',
        '1014': '13',
        '2014': '14',
        '2013': '15',
        '2012': '16',

        // Medio path from '4'
        '2015': '10a',
        '2016': '11a',
        '2017': '12a',

        // Bajo path from '4'
        '3012': '10b',
        '3013': '11b',
        '3014': '12b',

        // Additional tiles
        '33': '32',
        '34': '33',
        '35': '34',
        '36': '35',
        '37': '36',
        '38': '37',
        '39': '38',
        '40': '39',
        '41': '40',
        '42': '41',
        '43': '42',
        '44': '43',
        '45': '44',
        '46': '45',
        '47': '46',
        '48': '47',
        '49': '48',
        '50': '50',  // Junction 3
        '5051': '50a',
        '5052': '51a',
        '5053': '52a',
        '5054': '53a',
        '5055': '54a',
        '5056': '55a',
        '5057': '56a',
        '5058': '57a',
        '5059': '58a',
        '5060': '59a',
        '5061': '60a',
        '5063': '61a',
        '5064': '62a',
        '6051': '63',
        '6052': '64',
        '6058': '65',
        '6059': '66',
    };

    // Build complete mapping
    const idMapping = {};

    // Map main route
    OLD_ROUTE_MAIN.forEach((oldId, index) => {
        idMapping[oldId] = String(index);
    });

    // Add branch mappings
    Object.assign(idMapping, BRANCHES);

    console.log('\n%cID Mapping Created:', 'color: yellow; font-weight: bold');
    console.log('Total mappings:', Object.keys(idMapping).length);
    console.log('Sample:', idMapping);

    // Apply mapping to tiles
    const newTiles = SAVED_LAYOUT.tiles.map(tile => {
        const newId = idMapping[tile.id] || tile.id;
        return {
            id: newId,
            display: newId,
            x: tile.x,
            y: tile.y
        };
    });

    // Apply mapping to edges
    const newEdges = SAVED_LAYOUT.edges.map(([from, to]) => [
        idMapping[from] || from,
        idMapping[to] || to
    ]);

    // Create new layout
    const newLayout = {
        tiles: newTiles,
        edges: newEdges
    };

    console.log('\n%cMigration Complete!', 'color: green; font-size: 16px; font-weight: bold');
    console.log('New tiles:', newTiles.length);
    console.log('New edges:', newEdges.length);

    // Check for unmapped tiles
    const unmapped = SAVED_LAYOUT.tiles.filter(t => !idMapping[t.id]);
    if (unmapped.length > 0) {
        console.log('\n%c⚠️ UNMAPPED TILES:', 'color: orange; font-weight: bold');
        console.log(unmapped.map(t => t.id));
    }

    // Output formatted code
    console.log('\n%c=== COPY THIS INTO map-data.js ===', 'color: cyan; font-size: 14px; font-weight: bold');
    const output = `export const SAVED_LAYOUT = ${JSON.stringify(newLayout, null, 2)};`;
    console.log(output);

    return newLayout;
})();
