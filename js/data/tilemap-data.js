/**
 * Tilemap Data - Layout del mapa isométrico de la ciudad
 * Define qué tile va en cada posición del grid
 */

// Tile type constants (match tile-renderer.js)
const T = {
    _: 0,   // Empty
    SH: 1,  // Street Horizontal
    SV: 2,  // Street Vertical
    SC: 3,  // Street Cross
    BL: 10, // Building Low
    BM: 11, // Building Medium
    BH: 12, // Building High
    HO: 13, // Hospital
    ST: 14, // Store
    RU: 15, // Ruins
    PK: 20, // Park
    TR: 21  // Tree
};

/**
 * City tilemap - 20x20 grid
 * This represents the base city layout
 * Game tiles are overlaid on top of streets
 */
export const CITY_TILEMAP = [
    // Row 0 (top)
    [T.TR, T.TR, T._, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T._, T.TR, T.TR],
    // Row 1
    [T.TR, T.BL, T.BM, T.SV, T.BL, T.BM, T.SV, T.BH, T.BL, T.BM, T.SV, T.BL, T.HO, T.BM, T.SV, T.BL, T.BM, T.BH, T._, T.TR],
    // Row 2
    [T._, T.BM, T.BL, T.SV, T.BH, T.BL, T.SV, T.BL, T.BM, T.BH, T.SV, T.BM, T.BL, T.BH, T.SV, T.BM, T.BL, T.BM, T._, T._],
    // Row 3
    [T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SH, T.SH],
    // Row 4
    [T.BL, T.BM, T.BH, T.SV, T.PK, T.TR, T.SV, T.BL, T.BM, T.BH, T.SV, T.ST, T.BM, T.BL, T.SV, T.BH, T.BM, T.BL, T._, T._],
    // Row 5
    [T.BH, T.BL, T.BM, T.SV, T.TR, T.PK, T.SV, T.BM, T.BH, T.BL, T.SV, T.BL, T.BH, T.BM, T.SV, T.BL, T.BH, T.BM, T.TR, T._],
    // Row 6
    [T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SH, T.SH],
    // Row 7
    [T.BM, T.RU, T.BL, T.SV, T.BH, T.BM, T.SV, T.RU, T.BL, T.BH, T.SV, T.BM, T.BL, T.BH, T.SV, T.BM, T.RU, T.BH, T._, T._],
    // Row 8
    [T.BL, T.BH, T.BM, T.SV, T.BL, T.BH, T.SV, T.BM, T.BH, T.BL, T.SV, T.BH, T.BM, T.BL, T.SV, T.BH, T.BL, T.BM, T._, T.TR],
    // Row 9
    [T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SH, T.SH],
    // Row 10
    [T.BH, T.BL, T.BM, T.SV, T.BL, T.BM, T.SV, T.BH, T.BL, T.HO, T.SV, T.BL, T.BM, T.BH, T.SV, T.BL, T.BM, T.BH, T._, T._],
    // Row 11
    [T.BM, T.BH, T.BL, T.SV, T.BM, T.BH, T.SV, T.BL, T.BM, T.BH, T.SV, T.BM, T.BH, T.BL, T.SV, T.ST, T.BH, T.BM, T.TR, T._],
    // Row 12
    [T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SH, T.SH],
    // Row 13
    [T.BL, T.BM, T.BH, T.SV, T.RU, T.BL, T.SV, T.BM, T.BH, T.BL, T.SV, T.RU, T.BL, T.BM, T.SV, T.BH, T.BM, T.BL, T._, T._],
    // Row 14
    [T.BH, T.BL, T.BM, T.SV, T.BM, T.BH, T.SV, T.BL, T.BM, T.BH, T.SV, T.BM, T.BH, T.BL, T.SV, T.BL, T.BH, T.BM, T._, T.TR],
    // Row 15
    [T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SH, T.SH],
    // Row 16
    [T._, T.BL, T.BM, T.SV, T.BH, T.BL, T.SV, T.BM, T.ST, T.BH, T.SV, T.BL, T.BM, T.BH, T.SV, T.BM, T.BL, T.BH, T._, T._],
    // Row 17
    [T.TR, T.BM, T.BH, T.SV, T.BL, T.BM, T.SV, T.BH, T.BL, T.BM, T.SV, T.BH, T.BL, T.BM, T.SV, T.BL, T.BH, T.BM, T._, T.TR],
    // Row 18
    [T.TR, T._, T._, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T.SH, T.SC, T.SH, T.SH, T._, T.TR, T.TR],
    // Row 19 (bottom)
    [T.TR, T.TR, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T._, T.TR, T.TR]
];

/**
 * Mapping of game tile IDs to tilemap positions
 * This connects the board game tiles to the city grid
 */
export const GAME_TILE_POSITIONS = {
    // Example mapping - will be updated based on actual game layout
    // tileId: { gridX, gridY }
    1: { gridX: 3, gridY: 18 },   // Start
    2: { gridX: 3, gridY: 15 },
    3: { gridX: 3, gridY: 12 },
    // ... continue for all 80 tiles
};

/**
 * Special buildings near game tiles
 * These are themed based on game mechanics
 */
export const SPECIAL_BUILDINGS = {
    HOSPITAL: [
        { gridX: 12, gridY: 1 },  // Near healing tiles
        { gridX: 9, gridY: 10 }
    ],
    STORE: [
        { gridX: 11, gridY: 4 },  // Near loot tiles
        { gridX: 8, gridY: 16 },
        { gridX: 15, gridY: 11 }
    ],
    RUINS: [
        { gridX: 1, gridY: 7 },   // Near zombie tiles
        { gridX: 7, gridY: 7 },
        { gridX: 4, gridY: 13 },
        { gridX: 11, gridY: 13 },
        { gridX: 16, gridY: 7 }
    ]
};

export default { CITY_TILEMAP, GAME_TILE_POSITIONS, SPECIAL_BUILDINGS };
