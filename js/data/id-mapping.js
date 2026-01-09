// Complete ID Mapping for v7.0 Renumbering
// OLD_ID → NEW_ID (Sequential route-based)

export const ID_MAPPING = {
    // Main path from diagnostic (positions 0-16+)
    '0': '0',
    '5062': '1',
    '6057': '2',
    '6055': '3',
    '6056': '4',
    '6053': '5',
    '6054': '6',
    '1': '7',
    '2': '8',
    '3': '9',
    '4': '10',      // ← JUNCTION HERE (position 10)

    // Branch paths from position 10 (old ID '4')
    // Alto path: IDs that would continue from '4'
    '5': '10a',     // First step of alto path
    '6': '11a',
    '7': '12a',
    '8': '13a',
    '9': '14a',

    // Medio path
    '1012': '10b',  // Medio starts
    '1013': '11b',
    '1014': '12b',
    '2014': '13b',

    // Bajo path
    '2012': '10c',  // Bajo starts
    '2013': '11c',
    '3012': '12c',
    '3013': '13c',
    '3014': '14c',

    // Convergence point (all paths meet)
    '10': '15',     // Old junction becomes position 15
    '18': '16',
    '19': '17',
    '20': '18',
    '22': '19',
    '21': '20',
    '23': '21',
    '31': '22',
    '30': '23',
    '29': '24',
    '24': '25',     // Position 25 - junction 2
    '28': '26',
    '27': '27',
    '32': '28',
    '26': '29',
    '25': '30',

    // Continue to position 50 (junction 3)
    // TODO: Map intermediate positions 31-49

    '50': '50',     // Junction 3

    // Paths from junction 50
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

    // Main path continues
    '48': '51',
    '49': '52',
    // TODO: Complete 53-78

    '79': '79',     // Final junction
    '80': '80',     // End

    // Additional IDs from layout
    '6051': '63',
    '6052': '64',
    '6058': '65',
    '6059': '66',
    '2015': '67',
    '2016': '68',
    '2017': '69',
    '3014': '70',
    '35': '71',
    '36': '72',
    '37': '73',
    '38': '74',
    '39': '75',
    '40': '76',
    '41': '77',
    '42': '78',
    '43': '71',
    '44': '72',
    '45': '73',
    '46': '74',
    '47': '75',
};

// Apply mapping to SAVED_LAYOUT
export function applyMapping(savedLayout, mapping) {
    return {
        tiles: savedLayout.tiles.map(tile => ({
            ...tile,
            id: mapping[tile.id] || tile.id,
            display: mapping[tile.id] || tile.id
        })),
        edges: savedLayout.edges.map(([from, to]) => [
            mapping[from] || from,
            mapping[to] || to
        ])
    };
}
