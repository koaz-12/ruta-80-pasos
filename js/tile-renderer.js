/**
 * Tile Renderer - Sistema de renderizado de tiles isométricos
 * v1.0 - Sistema básico para La Ruta de los 80 Pasos
 */

export class TileRenderer {
    constructor(svgElement, namespace) {
        this.svg = svgElement;
        this.ns = namespace;

        // Tile dimensions - square tiles for cleaner grid
        // Board is 850x1400 (portrait mode - taller than wide)
        this.tileWidth = 40;    // Square tiles
        this.tileHeight = 40;   // Square tiles

        // Loaded tile images
        this.tiles = {};

        // Tile types
        this.TILE_TYPES = {
            EMPTY: 0,
            STREET_H: 1,      // Horizontal street
            STREET_V: 2,      // Vertical street
            STREET_CROSS: 3,  // Intersection
            STREET_CORNER_NE: 4,
            STREET_CORNER_NW: 5,
            STREET_CORNER_SE: 6,
            STREET_CORNER_SW: 7,
            BUILDING_LOW: 10,
            BUILDING_MED: 11,
            BUILDING_HIGH: 12,
            BUILDING_HOSPITAL: 13,
            BUILDING_STORE: 14,
            BUILDING_RUINS: 15,
            PARK: 20,
            TREE: 21
        };
    }

    /**
     * Convert cartesian coordinates to isometric
     * @param {number} x - Cartesian X
     * @param {number} y - Cartesian Y
     * @returns {object} Isometric coordinates {isoX, isoY}
     */
    cartesianToIsometric(x, y) {
        const isoX = (x - y) * (this.tileWidth / 2);
        const isoY = (x + y) * (this.tileHeight / 2);
        return { isoX, isoY };
    }

    /**
     * Convert isometric coordinates back to cartesian
     * @param {number} isoX - Isometric X
     * @param {number} isoY - Isometric Y
     * @returns {object} Cartesian coordinates {x, y}
     */
    isometricToCartesian(isoX, isoY) {
        const x = (isoX / (this.tileWidth / 2) + isoY / (this.tileHeight / 2)) / 2;
        const y = (isoY / (this.tileHeight / 2) - isoX / (this.tileWidth / 2)) / 2;
        return { x, y };
    }

    /**
     * Load tile images
     * @param {object} tileConfig - Configuration object with tile paths
     */
    async loadTiles(tileConfig) {
        console.log('🎨 [TILES] Loading tile assets...');

        for (const [name, path] of Object.entries(tileConfig)) {
            this.tiles[name] = path;
        }

        console.log(`🎨 [TILES] Loaded ${Object.keys(this.tiles).length} tile types`);
    }

    /**
     * Render a single tile at grid position
     * @param {number} gridX - Grid X position
     * @param {number} gridY - Grid Y position
     * @param {number} tileType - Type of tile to render
     * @param {SVGElement} container - Container to append tile to
     */
    renderTile(gridX, gridY, tileType, container) {
        // Simple grid positioning - start from 0,0 for full coverage
        const finalX = gridX * this.tileWidth;
        const finalY = gridY * this.tileHeight;

        // Create tile group
        const tileGroup = document.createElementNS(this.ns, 'g');
        tileGroup.setAttribute('transform', `translate(${finalX}, ${finalY})`);
        tileGroup.setAttribute('class', 'grid-tile');
        tileGroup.setAttribute('data-grid-x', gridX);
        tileGroup.setAttribute('data-grid-y', gridY);

        // Create square tile
        const square = document.createElementNS(this.ns, 'rect');
        square.setAttribute('width', this.tileWidth);
        square.setAttribute('height', this.tileHeight);
        square.setAttribute('x', 0);
        square.setAttribute('y', 0);

        // Color based on tile type
        const color = this.getTileColor(tileType);
        square.setAttribute('fill', color);
        square.setAttribute('stroke', 'rgba(0,0,0,0.2)');
        square.setAttribute('stroke-width', '1');

        tileGroup.appendChild(square);
        container.appendChild(tileGroup);

        return tileGroup;
    }

    /**
     * Get color for tile type - Enhanced visuals
     */
    getTileColor(type) {
        const colors = {
            // Empty/Background - subtle dark tones
            0: 'rgba(30, 40, 30, 0.4)',

            // Streets - asphalt look with subtle variation
            1: '#3a3a3a',                   // Street H - dark asphalt
            2: '#3a3a3a',                   // Street V - dark asphalt
            3: '#2a2a2a',                   // Cross - darker intersection

            // Buildings - varied city colors
            10: '#6B5344',                  // Building low - warm brown
            11: '#5C5C5C',                  // Building med - concrete gray
            12: '#3D3D3D',                  // Building high - dark tower
            13: '#E8E8E8',                  // Hospital - clean white
            14: '#D4A84B',                  // Store - warm gold
            15: '#4A3320',                  // Ruins - dark damaged

            // Nature - organic greens
            20: '#2D5A2D',                  // Park - forest green
            21: '#1B4D1B'                   // Tree - dark green
        };
        return colors[type] || '#4a4a4a';
    }

    /**
     * Render entire tilemap from 2D array
     * @param {number[][]} mapData - 2D array of tile types
     * @param {SVGElement} container - Container to render into
     */
    renderMap(mapData, container) {
        console.log('🗺️ [TILES] Rendering tilemap...');

        // Create tiles group
        const tilesGroup = document.createElementNS(this.ns, 'g');
        tilesGroup.setAttribute('id', 'tilemap-layer');

        // Render from back to front (for proper overlap)
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
                const tileType = mapData[y][x];
                if (tileType !== 0) {  // Skip empty tiles
                    this.renderTile(x, y, tileType, tilesGroup);
                }
            }
        }

        // Insert tilemap behind game tiles
        if (container.firstChild) {
            container.insertBefore(tilesGroup, container.firstChild.nextSibling);
        } else {
            container.appendChild(tilesGroup);
        }

        console.log('🗺️ [TILES] Tilemap rendered');
    }
}

// Export default instance
export default TileRenderer;
