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
        const baseColor = this.getTileColor(tileType);
        square.setAttribute('fill', baseColor);
        square.setAttribute('stroke', 'rgba(0,0,0,0.15)');
        square.setAttribute('stroke-width', '0.5');

        tileGroup.appendChild(square);

        // Add building details (windows, icons, etc.)
        this.addBuildingDetails(tileGroup, tileType);

        // Add zone overlay for atmosphere (gradient from safe to danger)
        const zoneOverlay = this.createZoneOverlay(gridY);
        if (zoneOverlay) {
            tileGroup.appendChild(zoneOverlay);
        }

        container.appendChild(tileGroup);

        return tileGroup;
    }

    /**
     * Add visual details to buildings - ISOMETRIC 2.5D STYLE
     */
    addBuildingDetails(tileGroup, tileType) {
        const w = this.tileWidth;
        const h = this.tileHeight;

        // Buildings - Isometric 3D boxes
        if (tileType >= 10 && tileType <= 12) {
            const heights = { 10: 10, 11: 16, 12: 22 };
            const buildingH = heights[tileType] || 12;

            const frontColor = tileType === 10 ? '#8B7355' : tileType === 11 ? '#6B6B6B' : '#4A4A4A';
            const sideColor = tileType === 10 ? '#6B5344' : tileType === 11 ? '#5A5A5A' : '#3A3A3A';
            const roofColor = tileType === 10 ? '#A08060' : tileType === 11 ? '#7A7A7A' : '#5A5A5A';

            // Front face
            const front = document.createElementNS(this.ns, 'polygon');
            front.setAttribute('points', `${w * 0.15},${h - 4} ${w * 0.75},${h - 4} ${w * 0.75},${h - 4 - buildingH} ${w * 0.15},${h - 4 - buildingH}`);
            front.setAttribute('fill', frontColor);
            front.setAttribute('stroke', '#222');
            front.setAttribute('stroke-width', '0.5');
            tileGroup.appendChild(front);

            // Right side (isometric)
            const side = document.createElementNS(this.ns, 'polygon');
            side.setAttribute('points', `${w * 0.75},${h - 4} ${w * 0.95},${h - 8} ${w * 0.95},${h - 8 - buildingH} ${w * 0.75},${h - 4 - buildingH}`);
            side.setAttribute('fill', sideColor);
            side.setAttribute('stroke', '#222');
            side.setAttribute('stroke-width', '0.5');
            tileGroup.appendChild(side);

            // Roof
            const roof = document.createElementNS(this.ns, 'polygon');
            roof.setAttribute('points', `${w * 0.15},${h - 4 - buildingH} ${w * 0.75},${h - 4 - buildingH} ${w * 0.95},${h - 8 - buildingH} ${w * 0.35},${h - 8 - buildingH}`);
            roof.setAttribute('fill', roofColor);
            roof.setAttribute('stroke', '#222');
            roof.setAttribute('stroke-width', '0.5');
            tileGroup.appendChild(roof);

            // Windows
            const numWin = tileType - 9;
            for (let i = 0; i < numWin; i++) {
                const win = document.createElementNS(this.ns, 'rect');
                win.setAttribute('x', w * 0.25);
                win.setAttribute('y', h - buildingH + 2 + i * 6);
                win.setAttribute('width', 6);
                win.setAttribute('height', 4);
                win.setAttribute('fill', 'rgba(150,200,255,0.6)');
                tileGroup.appendChild(win);
            }
        }

        // Hospital - White building with cross
        if (tileType === 13) {
            const body = document.createElementNS(this.ns, 'polygon');
            body.setAttribute('points', `${w * 0.1},${h - 2} ${w * 0.8},${h - 2} ${w * 0.8},${h - 24} ${w * 0.1},${h - 24}`);
            body.setAttribute('fill', '#f5f5f5');
            body.setAttribute('stroke', '#ccc');
            tileGroup.appendChild(body);

            const sideH = document.createElementNS(this.ns, 'polygon');
            sideH.setAttribute('points', `${w * 0.8},${h - 2} ${w * 0.95},${h - 6} ${w * 0.95},${h - 28} ${w * 0.8},${h - 24}`);
            sideH.setAttribute('fill', '#ddd');
            tileGroup.appendChild(sideH);

            // Red cross
            const cV = document.createElementNS(this.ns, 'rect');
            cV.setAttribute('x', w * 0.4); cV.setAttribute('y', h - 20);
            cV.setAttribute('width', 4); cV.setAttribute('height', 10);
            cV.setAttribute('fill', '#dc2626');
            tileGroup.appendChild(cV);

            const cH = document.createElementNS(this.ns, 'rect');
            cH.setAttribute('x', w * 0.3); cH.setAttribute('y', h - 17);
            cH.setAttribute('width', 12); cH.setAttribute('height', 4);
            cH.setAttribute('fill', '#dc2626');
            tileGroup.appendChild(cH);
        }

        // Store - with awning
        if (tileType === 14) {
            const body = document.createElementNS(this.ns, 'rect');
            body.setAttribute('x', w * 0.1); body.setAttribute('y', h - 16);
            body.setAttribute('width', w * 0.7); body.setAttribute('height', 14);
            body.setAttribute('fill', '#D4A84B'); body.setAttribute('stroke', '#996633');
            tileGroup.appendChild(body);

            const awning = document.createElementNS(this.ns, 'polygon');
            awning.setAttribute('points', `${w * 0.05},${h - 14} ${w * 0.85},${h - 14} ${w * 0.75},${h - 10} ${w * 0.15},${h - 10}`);
            awning.setAttribute('fill', '#c41e3a');
            tileGroup.appendChild(awning);
        }

        // Ruins
        if (tileType === 15) {
            const wall1 = document.createElementNS(this.ns, 'polygon');
            wall1.setAttribute('points', `${w * 0.1},${h - 2} ${w * 0.4},${h - 2} ${w * 0.3},${h - 14} ${w * 0.1},${h - 10}`);
            wall1.setAttribute('fill', '#3d3d3d');
            tileGroup.appendChild(wall1);

            const wall2 = document.createElementNS(this.ns, 'polygon');
            wall2.setAttribute('points', `${w * 0.5},${h - 2} ${w * 0.9},${h - 2} ${w * 0.9},${h - 16} ${w * 0.6},${h - 8}`);
            wall2.setAttribute('fill', '#4a4a4a');
            tileGroup.appendChild(wall2);
        }

        // Park
        if (tileType === 20) {
            const grass = document.createElementNS(this.ns, 'ellipse');
            grass.setAttribute('cx', w / 2); grass.setAttribute('cy', h / 2 + 6);
            grass.setAttribute('rx', 14); grass.setAttribute('ry', 7);
            grass.setAttribute('fill', '#22c55e');
            tileGroup.appendChild(grass);
        }

        // Tree - 3D style
        if (tileType === 21) {
            const shadow = document.createElementNS(this.ns, 'ellipse');
            shadow.setAttribute('cx', w / 2 + 2); shadow.setAttribute('cy', h - 4);
            shadow.setAttribute('rx', 8); shadow.setAttribute('ry', 3);
            shadow.setAttribute('fill', 'rgba(0,0,0,0.2)');
            tileGroup.appendChild(shadow);

            const trunk = document.createElementNS(this.ns, 'rect');
            trunk.setAttribute('x', w / 2 - 2); trunk.setAttribute('y', h - 14);
            trunk.setAttribute('width', 4); trunk.setAttribute('height', 10);
            trunk.setAttribute('fill', '#78350f');
            tileGroup.appendChild(trunk);

            const leaf1 = document.createElementNS(this.ns, 'ellipse');
            leaf1.setAttribute('cx', w / 2); leaf1.setAttribute('cy', h - 18);
            leaf1.setAttribute('rx', 10); leaf1.setAttribute('ry', 8);
            leaf1.setAttribute('fill', '#166534');
            tileGroup.appendChild(leaf1);

            const leaf2 = document.createElementNS(this.ns, 'ellipse');
            leaf2.setAttribute('cx', w / 2); leaf2.setAttribute('cy', h - 22);
            leaf2.setAttribute('rx', 8); leaf2.setAttribute('ry', 6);
            leaf2.setAttribute('fill', '#22c55e');
            tileGroup.appendChild(leaf2);
        }
    }

    /**
     * Create zone-based color overlay
     * Top = Safe (green tint), Bottom = Danger (red tint)
     */
    createZoneOverlay(gridY) {
        const totalRows = 35;
        const progress = gridY / totalRows; // 0 = top, 1 = bottom

        // Define zone colors
        let overlayColor;
        let opacity;

        if (progress < 0.2) {
            // Zone 1: Safe start (subtle green)
            overlayColor = 'rgba(34, 139, 34, 0.08)';
        } else if (progress < 0.4) {
            // Zone 2: Transition (fading to neutral)
            overlayColor = 'rgba(100, 100, 80, 0.05)';
        } else if (progress < 0.6) {
            // Zone 3: Danger zone (subtle orange)
            overlayColor = 'rgba(180, 100, 30, 0.08)';
        } else if (progress < 0.85) {
            // Zone 4: High danger (subtle red)
            overlayColor = 'rgba(180, 50, 50, 0.1)';
        } else {
            // Zone 5: Boss area (dark red)
            overlayColor = 'rgba(120, 20, 20, 0.15)';
        }

        const overlay = document.createElementNS(this.ns, 'rect');
        overlay.setAttribute('width', this.tileWidth);
        overlay.setAttribute('height', this.tileHeight);
        overlay.setAttribute('x', 0);
        overlay.setAttribute('y', 0);
        overlay.setAttribute('fill', overlayColor);
        overlay.setAttribute('pointer-events', 'none');

        return overlay;
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
