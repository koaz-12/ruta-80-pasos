/**
 * SVG Board Renderer - Exact Sequential Layout
 * Tiles organized 1-80 following the sketch flow
 */
import { SAVED_LAYOUT, buildGraph } from './data/map-data.js';
import { getTileType, TILE_TYPE_MAP } from './data/tile-types.js';
import { TileRenderer } from './tile-renderer.js';
import { CITY_TILEMAP } from './data/tilemap-data.js';

export class SVGBoardRenderer {
    constructor(container) {
        this.container = container || document.querySelector('.board-container');
        this.ns = 'http://www.w3.org/2000/svg';

        // Board dimensions - Portrait mode (taller than wide)
        this.width = 850;
        this.height = 1400;
        this.ts = 52; // tile size (Increased to 52)
        this.gap = 5;

        // CHECK LOCAL STORAGE BACKUP
        const backup = localStorage.getItem('BOARD_LAYOUT_BACKUP');
        // Check LocalStorage first? NO, FORCE SAVED_LAYOUT for integrity.
        // const saved = localStorage.getItem('board_layout');
        // if (saved) {
        //     this.layoutData = JSON.parse(saved);
        // } else {
        this.layoutData = SAVED_LAYOUT;
        // }
        this.edges = this.layoutData.edges || [];   // Load Edges

        // Colors - City Street Theme (semi-transparent to show city underneath)
        this.colors = ['rgba(60, 60, 70, 0.7)', 'rgba(70, 70, 80, 0.7)', 'rgba(50, 55, 65, 0.7)', 'rgba(65, 65, 75, 0.7)'];
        this.safe = 'rgba(40, 120, 80, 0.8)';     // Green (safe zones)
        this.mortal = 'rgba(150, 40, 40, 0.8)';   // Red (danger zones)

        this.isEditorMode = false; // Default blocked

        // Grid settings (load from localStorage)
        this.showGrid = localStorage.getItem('editorShowGrid') === 'true';
        this.snapToGrid = localStorage.getItem('editorSnapToGrid') === 'true';
        this.gridSize = parseInt(localStorage.getItem('editorGridSize')) || 25;

        // Tile Renderer for isometric city map
        this.tileRenderer = null;  // Will be initialized in render()
        this.useTilemap = false;   // Use AI-generated city background image
    }

    render() {
        // Camera State
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            isDragging: false,
            lastX: 0,
            lastY: 0,
            initialDist: 0
        };

        // SVG Init - DIRECT PORTRAIT MODE (no rotation needed)
        // Board dimensions: 850x1400 (portrait - taller than wide)
        this.svg = document.createElementNS(this.ns, 'svg');

        // ViewBox matches width x height directly
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

        // Let browser handle aspect ratio perfectly
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Clean styling - touch-action:manipulation allows pan and zoom on mobile
        this.svg.style.cssText = 'width:100%;height:100%;background:#F7F5E6;touch-action:manipulation;cursor:grab';
        this.svg.id = 'game-board-svg';

        this.container.innerHTML = '';
        this.container.appendChild(this.svg);

        // Create root group (no rotation needed - board is directly in portrait)
        this.rootGroup = document.createElementNS(this.ns, 'g');
        this.svg.appendChild(this.rootGroup);

        this.drawBoard();
        this.drawConnectionLines();  // Draw paths between connected tiles
        this.addInteractivity();

        // Enable camera zoom/pan for mobile
        this.initCamera();
        this.createZoomControls();

        // Initialize position map (v6.0)
        this.positionMap = this.buildPositionMap();

        // v7.3: Tile Inspector - Always Active
        this.enableTileInspector();

        // v8.0: Render tile type icons (zombie, luck, event)
        this.renderTileTypeIcons();

        // No orientation check needed - CSS is simple now
        window.addEventListener('resize', () => {
            // Just trigger re-render if needed
        });
    }

    // v6.0: Build position map from graph traversal
    buildPositionMap() {
        const graph = buildGraph();
        const startId = '0';

        const positionMap = {};
        const visited = new Set();
        const queue = [{ id: startId, pos: 0 }];

        while (queue.length > 0) {
            const { id, pos } = queue.shift();

            if (visited.has(id)) continue;
            visited.add(id);

            positionMap[id] = pos;

            const node = graph[id];
            if (!node) continue;

            // Handle next tiles
            if (Array.isArray(node.next)) {
                // Junction: all branches get pos + 1
                node.next.forEach(nextId => {
                    if (!visited.has(nextId)) {
                        queue.push({ id: nextId, pos: pos + 1 });
                    }
                });
            } else if (node.next) {
                // Single path
                if (!visited.has(node.next)) {
                    queue.push({ id: node.next, pos: pos + 1 });
                }
            }
        }

        console.log('[Position Map] Built:', positionMap);
        return positionMap;
    }

    // Draw connection lines between tiles based on graph
    drawConnectionLines() {
        const graph = buildGraph();
        const layout = this.layoutData.tiles;

        // Create position lookup
        const posLookup = {};
        layout.forEach(tile => {
            posLookup[tile.id] = { x: tile.x, y: tile.y };
        });

        // Create a group for connection lines (behind tiles)
        const linesGroup = document.createElementNS(this.ns, 'g');
        linesGroup.setAttribute('id', 'connection-lines');
        linesGroup.style.pointerEvents = 'none';

        // Process each node in graph
        Object.keys(graph).forEach(fromId => {
            const node = graph[fromId];
            if (!node || !node.next) return;

            const fromPos = posLookup[fromId];
            if (!fromPos) return;

            // Handle single or multiple next tiles
            const nextTiles = Array.isArray(node.next) ? node.next : [node.next];

            nextTiles.forEach(toId => {
                if (!toId) return;
                const toPos = posLookup[toId];
                if (!toPos) return;

                // Center positions (tile size is this.ts)
                const x1 = fromPos.x + this.ts / 2;
                const y1 = fromPos.y + this.ts / 2;
                const x2 = toPos.x + this.ts / 2;
                const y2 = toPos.y + this.ts / 2;

                // Create connection line (subtle glow for city map)
                const line = document.createElementNS(this.ns, 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'rgba(255, 220, 100, 0.5)');
                line.setAttribute('stroke-width', '3');
                line.setAttribute('stroke-linecap', 'round');
                linesGroup.appendChild(line);
            });
        });

        // Insert lines AFTER the background rect but BEFORE tiles
        // The background rect is the first child added by drawBoard()
        const bgRect = this.rootGroup.querySelector('rect');
        if (bgRect && bgRect.nextSibling) {
            this.rootGroup.insertBefore(linesGroup, bgRect.nextSibling);
        } else if (bgRect) {
            this.rootGroup.appendChild(linesGroup);
        } else {
            // Fallback: just append
            this.rootGroup.appendChild(linesGroup);
        }

        console.log('🔗 [BOARD] Connection lines drawn');
    }

    // v6.0: Get sequential position for a tile ID
    getSequentialPosition(tileId) {
        // Try positionMap first
        if (this.positionMap && this.positionMap[tileId] !== undefined) {
            return this.positionMap[tileId];
        }

        // Fallback 1: Check layout for display field
        const tile = this.layoutData.tiles.find(t => String(t.id) === String(tileId));
        if (tile && tile.display) {
            return tile.display;
        }

        // Fallback 2: Return ID itself (better than '?')
        return tileId;
    }

    // v6.0: Check if tile is a junction
    isJunction(tileId) {
        const graph = buildGraph();
        const node = graph[tileId];
        return node && Array.isArray(node.next) && node.next.length > 1;
    }

    // v6.0: Get junction type
    getJunctionType(tileId) {
        const graph = buildGraph();
        const node = graph[tileId];

        if (!node || !Array.isArray(node.next)) return 'none';

        const count = node.next.length;

        // Detect loops (connection goes to lower position)
        const currentPos = this.getSequentialPosition(tileId);
        const hasLoop = node.next.some(nextId => {
            const nextPos = this.getSequentialPosition(nextId);
            return nextPos < currentPos;
        });

        if (count === 2 && hasLoop) return 'loop';
        if (count === 2) return 'fork2';
        if (count === 3) return 'fork3';
        return 'multi';
    }

    checkMobileOrientation() {
        // Enforce Vertical Layout Globally (as requested)
        // "global-rotated" mimics the previous "mobile-rotated" but for all
        this.container.classList.add('global-rotated');

        // Force update viewbox after a small delay to handle layout shift
        setTimeout(() => this.updateViewBox(), 100);
    }

    initCamera() {
        // 1. Mouse/Touch Pan
        const startDrag = (e) => {
            // Ignore if touching a UI element (like token, maybe?)
            // Actually, we want to drag ANYWHERE unless it's a critical interaction.
            // Tokens don't have click actions yet except inspector.
            // if (this.isEditorMode) return; // REMOVED: Allow camera move in Editor

            this.camera.isDragging = true;
            const pt = this.getEventPoint(e);
            this.camera.lastX = pt.x;
            this.camera.lastY = pt.y;
            this.svg.style.cursor = 'grabbing';
            this.camera.initialDist = 0; // Reset pinch
        };

        const moveDrag = (e) => {
            if (!this.camera.isDragging) return;
            e.preventDefault();

            // Pinch Zoom Check
            if (e.touches && e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                if (this.camera.initialDist === 0) {
                    this.camera.initialDist = dist;
                    return;
                }

                const delta = dist - this.camera.initialDist;
                const zoomFactor = delta > 0 ? 0.98 : 1.02; // Inverted logic for "Push apart = Zoom In (smaller ViewBox)"
                // Wait... Bigger Distance = Zoom In?
                // ViewBox Width: Smaller = Zoom In.
                // Pull Apart (Positive Delta) -> Zoom In -> Multiply ViewBox Size by < 1.
                this.zoomCamera(delta > 0 ? 1.02 : 0.98); // Helper handles zoom Level (scale)

                this.camera.initialDist = dist;
                return;
            }

            const pt = this.getEventPoint(e);
            const dx = (pt.x - this.camera.lastX) / (this.camera.zoom * (window.innerWidth / this.svg.clientWidth || 1));
            // Mapping screen pixels to SVG units requires knowing current scale ratio? 
            // Simplified: Delta Screen * (ViewBoxWidth / ScreenWidth)

            // Allow simpler Panning:
            // Just move viewBox X/Y by -delta using a sensitivity factor

            // Robust calculation:
            // SVG Unit per Pixel = CurrentViewBoxWidth / ClientWidth
            const vbw = this.width / this.camera.zoom;
            const ratio = vbw / (this.svg.clientWidth || window.innerWidth);

            const svgDx = (pt.x - this.camera.lastX) * ratio;
            const svgDy = (pt.y - this.camera.lastY) * ratio;

            this.camera.x -= svgDx; // Drag Left moves Camera Right (ViewBox X increases)
            this.camera.y -= svgDy;

            this.camera.lastX = pt.x;
            this.camera.lastY = pt.y;
            this.updateViewBox();
        };

        const endDrag = () => {
            this.camera.isDragging = false;
            this.svg.style.cursor = 'grab';
            this.camera.initialDist = 0;
        };

        // Scroll Zoom
        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 0.9;
            this.zoomCamera(factor);
        }, { passive: false });

        this.svg.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('mouseup', endDrag);

        this.svg.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('touchend', endDrag);

        // Initial Center (Delayed to allow CSS 100vh/vw layout to apply)
        setTimeout(() => this.centerCamera(), 100);
        setTimeout(() => this.centerCamera(), 500); // Verify again
    }

    getEventPoint(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    zoomCamera(factor) {
        const newZoom = this.camera.zoom * factor;
        // Limit Zoom (Widen range for "Full Map" vs "Macro Detail")
        if (newZoom < 0.3 || newZoom > 5.0) return;
        this.camera.zoom = newZoom;
        this.updateViewBox();
    }

    /**
     * Create floating zoom control buttons for mobile
     */
    createZoomControls() {
        // Check if already exists
        if (document.querySelector('.zoom-controls')) return;

        const container = document.createElement('div');
        container.className = 'zoom-controls';

        // Zoom In button
        const zoomIn = document.createElement('button');
        zoomIn.className = 'zoom-btn';
        zoomIn.innerHTML = '+';
        zoomIn.setAttribute('aria-label', 'Zoom In');
        zoomIn.addEventListener('click', () => this.zoomCamera(1.3));

        // Center button
        const center = document.createElement('button');
        center.className = 'zoom-btn zoom-btn-center';
        center.innerHTML = '⌖';
        center.setAttribute('aria-label', 'Center View');
        center.addEventListener('click', () => this.centerCamera());

        // Zoom Out button
        const zoomOut = document.createElement('button');
        zoomOut.className = 'zoom-btn';
        zoomOut.innerHTML = '−';
        zoomOut.setAttribute('aria-label', 'Zoom Out');
        zoomOut.addEventListener('click', () => this.zoomCamera(0.7));

        container.appendChild(zoomIn);
        container.appendChild(center);
        container.appendChild(zoomOut);

        document.body.appendChild(container);
        console.log('📱 [ZOOM] Mobile zoom controls created');
    }

    centerCamera() {
        // Goal: Center the 1400x850 board in the viewport with Smart Zoom
        // The container is 100dvh x 100dvw (Rotated)
        // SVG Logic Dimensions:
        // Width  (Local X) = 1400
        // Height (Local Y) = 850

        // CSS/Visual Dimensions of Wrapper (rotated):
        // Wrapper Width = 100dvh (e.g. 800px)
        // Wrapper Height = 100dvw (e.g. 360px)

        // HOWEVER, SVG `clientWidth` inside the wrapper will reflect the wrapper's logical dims.
        // Inside Wrapper: width is 100dvh (800), height is 100dvw (360).

        const svgW = this.svg.clientWidth || window.innerHeight; // 800 (Visual Height)
        const svgH = this.svg.clientHeight || window.innerWidth; // 360 (Visual Width)

        // STRATEGY: FULL COVER (Immersive)
        // calculated purely to fill the screen such that no background is visible.
        // Users can drag/pan to see the rest.

        // FitWidth: Zoom needed to fit 850px width into Screen Width (e.g. 390). -> 0.45
        // FitHeight: Zoom needed to fit 1400px height into Screen Height (e.g. 844). -> 0.60

        // To remove ALL empty space, we must use the LARGER zoom (0.60).
        // This effectively "Crops" the width (showing only 650px of the 850px board width).
        // But it guarantees the board goes top-to-bottom and side-to-side (filling the long axis).

        const zoomFitWidth = svgH / this.height;
        const zoomFitHeight = svgW / this.width;
        let idealZoom = Math.max(zoomFitWidth, zoomFitHeight);

        // Apply a tiny safety buffer (0.95) just so usage isn't maximal?
        // No, user said "Solo el tablero". No space.
        // idealZoom = idealZoom; 

        // Safety: If this zoom is insane (desktop?), clamp it.
        // But for mobile "strip", it's fine.

        this.camera.zoom = idealZoom;

        // Center:
        const cx = this.width / 2;
        const cy = this.height / 2;

        const viewW = svgW / this.camera.zoom;
        const viewH = svgH / this.camera.zoom;

        this.camera.x = cx - (viewW / 2);
        this.camera.y = cy - (viewH / 2);

        console.log(`Smart Zoom: ${idealZoom.toFixed(3)} (FitW: ${zoomFitWidth.toFixed(3)}, FitH: ${zoomFitHeight.toFixed(3)})`);
        this.updateViewBox();
    }

    updateViewBox() {
        // Calculate Visible Area
        const w = this.width / this.camera.zoom;
        const h = this.height / this.camera.zoom;
        // Center camera X/Y is center point?
        // Let's assume camera.x/y is Top-Left for simple 'viewBox' mapping first
        // But for Zoom-to-Center, it's better if x/y is CENTER.
        // Current logic: camera.x is viewBox min-x.

        // Clamping? Optional.

        this.svg.setAttribute('viewBox', `${this.camera.x} ${this.camera.y} ${w} ${h}`);

        // DEBUG HUD UPDATE
        const hud = document.getElementById('debug-hud');
        if (hud) {
            const svgW = this.svg.clientWidth || window.innerHeight;
            const svgH = this.svg.clientHeight || window.innerWidth;
            hud.innerHTML = `
                ZOOM: ${this.camera.zoom.toFixed(3)}<br>
                X: ${Math.round(this.camera.x)} | Y: ${Math.round(this.camera.y)}<br>
                SCR: ${svgW}x${svgH} (Rotated)<br>
                WIN: ${window.innerWidth}x${window.innerHeight}
            `;
        }
    }

    focusOn(targetX, targetY) {
        // Smoothly pan camera to center on target
        // Not implemented full lerp yet, visual snap
        const w = this.width / this.camera.zoom;
        const h = this.height / this.camera.zoom;

        this.camera.x = targetX - (w / 2);
        this.camera.y = targetY - (h / 2);
        this.updateViewBox();
    }

    initEditor() {
        // Load saved position or use default
        const savedPos = localStorage.getItem('editorPanelPos');
        const pos = savedPos ? JSON.parse(savedPos) : { top: 50, right: 50 };
        const isMinimized = localStorage.getItem('editorPanelMinimized') === 'true';

        // Create floating draggable panel (SMALLER SIZE)
        this.editorPanel = document.createElement('div');
        this.editorPanel.id = 'unified-editor-panel';
        Object.assign(this.editorPanel.style, {
            position: 'fixed',
            top: pos.top + 'px',
            right: pos.right + 'px',
            width: isMinimized ? '60px' : '280px',  // Smaller: 280px instead of 320px
            maxHeight: '85vh',  // Don't take entire screen
            display: 'none',
            flexDirection: 'column',
            background: '#1e1e1e',
            border: '2px solid #444',
            borderRadius: '8px',
            zIndex: '10000',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            cursor: 'grab'  // Show it's draggable
        });

        this.editorPanel.isMinimized = isMinimized;
        document.body.appendChild(this.editorPanel);

        // Populate Controls
        this.drawUnifiedControls();

        // Make panel draggable
        this.makePanelDraggable();
    }

    makePanelDraggable() {
        const panel = this.editorPanel;
        let isDragging = false;
        let startX, startY, startTop, startRight;

        const isInteractive = (target) => {
            return target.tagName === 'INPUT' ||
                target.tagName === 'BUTTON' ||
                target.tagName === 'SELECT' ||
                target.tagName === 'LABEL';
        };

        const startDrag = (clientX, clientY, target) => {
            if (isInteractive(target)) return false;

            isDragging = true;
            startX = clientX;
            startY = clientY;
            startTop = parseInt(panel.style.top) || 0;
            startRight = parseInt(panel.style.right) || 0;
            panel.style.cursor = 'grabbing';
            return true;
        };

        const doDrag = (clientX, clientY) => {
            if (!isDragging) return;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            const newTop = Math.max(0, Math.min(window.innerHeight - 100, startTop + deltaY));
            const newRight = Math.max(0, Math.min(window.innerWidth - 100, startRight - deltaX));

            panel.style.top = newTop + 'px';
            panel.style.right = newRight + 'px';
        };

        const endDrag = () => {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = 'grab';

                localStorage.setItem('editorPanelPos', JSON.stringify({
                    top: parseInt(panel.style.top),
                    right: parseInt(panel.style.right)
                }));
            }
        };

        // Mouse events (PC)
        panel.addEventListener('mousedown', (e) => {
            if (startDrag(e.clientX, e.clientY, e.target)) {
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            doDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', endDrag);

        // Touch events (Mobile)
        panel.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (startDrag(touch.clientX, touch.clientY, e.target)) {
                // Only prevent if dragging started
            }
        }, { passive: true });

        panel.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                doDrag(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        }, { passive: false });

        panel.addEventListener('touchend', endDrag);
    }

    activateEditorMode() {
        this.isEditorMode = true;

        // 1. Hide Lobby
        const lobby = document.querySelector('.lobby-container');
        if (lobby) lobby.style.display = 'none';

        // 2. Show Board Container fullscreen
        const boardContainer = document.querySelector('.board-container');
        if (boardContainer) {
            boardContainer.classList.remove('hidden');
            boardContainer.classList.add('editor-mode-active'); // Prevent mobile scaling
            boardContainer.style.display = 'flex';
        }

        // 3. Render if needed
        if (!this.svg) {
            this.render();
        }

        // 4. Ensure Editor Panel Exists
        if (!this.editorPanel) {
            this.initEditor();
        }

        // 5. Show Editor Panel
        if (this.editorPanel) {
            this.editorPanel.style.display = 'flex';
        }

        // 6. Render grid if enabled
        if (this.showGrid) {
            this.renderGrid();
        }

        // 7. Setup keyboard shortcuts
        if (!this.keyboardInitialized) {
            this.initKeyboardShortcuts();
            this.keyboardInitialized = true;
        }

        window.dispatchEvent(new Event('resize'));
    }

    // Keyboard shortcuts for editor
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEditorMode) return;

            // Don't trigger if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Delete - remove selected tile
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (this.selectedTileId) {
                    const group = this.svg.querySelector(`g[data-id="${this.selectedTileId}"]`);
                    if (group && confirm(`¿Eliminar casilla ${this.selectedTileId}?`)) {
                        group.remove();
                        this.edges = this.edges.filter(edge =>
                            edge[0] !== parseInt(this.selectedTileId) &&
                            edge[1] !== parseInt(this.selectedTileId)
                        );
                        this.drawEdges();
                        this.selectedTileId = null;
                        this.showEditorNotification('🗑️ Casilla eliminada');
                    }
                }
                return;
            }

            // Ctrl+S - Save project
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentProject();
                return;
            }

            // Ctrl+N - New project
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.newProject();
                return;
            }

            // G - Toggle grid
            if (e.key === 'g' || e.key === 'G') {
                this.showGrid = !this.showGrid;
                localStorage.setItem('editorShowGrid', this.showGrid ? 'true' : 'false');
                this.renderGrid();
                this.showEditorNotification(this.showGrid ? '📐 Grid activado' : '📐 Grid desactivado');
                const checkbox = document.getElementById('grid-toggle');
                if (checkbox) checkbox.checked = this.showGrid;
                return;
            }

            // S - Toggle snap
            if (e.key === 's' && !e.ctrlKey) {
                this.snapToGrid = !this.snapToGrid;
                localStorage.setItem('editorSnapToGrid', this.snapToGrid ? 'true' : 'false');
                this.showEditorNotification(this.snapToGrid ? '🧲 Snap activado' : '🧲 Snap desactivado');
                const checkbox = document.getElementById('snap-toggle');
                if (checkbox) checkbox.checked = this.snapToGrid;
                return;
            }

            // N - New tile
            if (e.key === 'n' && !e.ctrlKey) {
                this.addNewTile();
                this.showEditorNotification('➕ Nueva casilla creada');
                return;
            }

            // Escape - Deselect / close inspector
            if (e.key === 'Escape') {
                this.selectedTileId = null;
                if (this.inspectorWin) this.inspectorWin.remove();
                this.showEditorNotification('Deseleccionado');
                return;
            }
        });

        console.log('⌨️ [EDITOR] Keyboard shortcuts initialized');
    }

    // Show quick notification in editor
    showEditorNotification(message) {
        let notif = document.getElementById('editor-notification');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'editor-notification';
            notif.style.cssText = `
                position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.8); color: #fff; padding: 10px 20px;
                border-radius: 20px; font-size: 14px; z-index: 10002;
                transition: opacity 0.3s; pointer-events: none;
            `;
            document.body.appendChild(notif);
        }

        notif.textContent = message;
        notif.style.opacity = '1';

        clearTimeout(this.notifTimeout);
        this.notifTimeout = setTimeout(() => {
            notif.style.opacity = '0';
        }, 1500);
    }




    drawUnifiedControls() {
        const panel = this.editorPanel;
        if (!panel) return;

        // If minimized, show only icon
        if (panel.isMinimized) {
            panel.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; padding:15px; cursor:pointer; background:#2d2d2d; border-radius:8px;" id="uni-expand" title="Expandir Editor">
                    <span style="font-size:28px;">🎨</span>
                </div>
            `;

            const expandBtn = document.getElementById('uni-expand');
            const doExpand = () => {
                panel.isMinimized = false;
                panel.style.width = '280px';
                localStorage.setItem('editorPanelMinimized', 'false');
                this.drawUnifiedControls();
            };
            expandBtn.onclick = doExpand;
            expandBtn.ontouchend = (e) => {
                e.preventDefault();
                doExpand();
            };
            return;
        }

        // Get current board size
        const currentWidth = this.width || 850;
        const currentHeight = this.height || 1400;

        // Get active project name
        const activeProject = this.getActiveProject();
        const projectName = activeProject ? activeProject.name : 'Sin proyecto';

        // NEW ORGANIZED PANEL DESIGN
        panel.innerHTML = `
            <!-- Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:2px solid #444; background:#2d2d2d;">
                <h3 style="margin:0; font-size:18px; color:#fff; font-weight:bold;">🎨 EDITOR ESTUDIO</h3>
                <button id="uni-close" style="background:none; border:none; color:#bbb; cursor:pointer; font-size:20px;" title="Minimizar">✕</button>
            </div>

            <!-- Projects Section (NEW) -->
            <div style="padding:15px; border-bottom:1px solid #333; background:#252525;">
                <div style="color:#9cdcfe; font-size:13px; font-weight:bold; margin-bottom:8px;">📁 PROYECTOS</div>
                <div id="active-project-name" style="color:#4ade80; font-size:12px; margin-bottom:10px; padding:6px; background:#1a1a1a; border-radius:4px; text-align:center;">
                    📋 ${projectName}
                </div>
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
                    <button id="project-save" style="background:#28a745; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:11px;">
                        💾 Guardar
                    </button>
                    <button id="project-load" style="background:#17a2b8; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:11px;">
                        📂 Cargar
                    </button>
                    <button id="project-new" style="background:#6c757d; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:11px;">
                        ✨ Nuevo
                    </button>
                    <button id="project-delete" style="background:#dc3545; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:11px;">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>

            <!-- Configuration Section -->
            <div style="padding:15px; border-bottom:1px solid #333;">
                <div style="color:#9cdcfe; font-size:13px; font-weight:bold; margin-bottom:12px;">⚙️ CONFIGURACIÓN</div>
                
                <div style="margin-bottom:10px;">
                    <label style="color:#aaa; font-size:11px; display:block; margin-bottom:4px;">Ancho (px)</label>
                    <input type="number" id="board-width" value="${currentWidth}" 
                           style="width:100%; background:#3c3c3c; border:1px solid #555; color:#fff; padding:6px; border-radius:4px;" />
                </div>
                
                <div style="margin-bottom:10px;">
                    <label style="color:#aaa; font-size:11px; display:block; margin-bottom:4px;">Alto (px)</label>
                    <input type="number" id="board-height" value="${currentHeight}"
                           style="width:100%; background:#3c3c3c; border:1px solid #555; color:#fff; padding:6px; border-radius:4px;" />
                </div>
                
                <button id="apply-size" style="width:100%; background:#667eea; color:#fff; border:none; padding:8px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">
                    Aplicar Tamaño
                </button>
                
                <!-- Grid Controls -->
                <div style="margin-top:12px; padding-top:12px; border-top:1px solid #333;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <span style="color:#aaa; font-size:11px;">📐 Grid Visual</span>
                        <label style="display:flex; align-items:center; cursor:pointer;">
                            <input type="checkbox" id="grid-toggle" ${this.showGrid ? 'checked' : ''} 
                                   style="width:18px; height:18px; cursor:pointer;" />
                        </label>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <span style="color:#aaa; font-size:11px;">🧲 Snap-to-Grid</span>
                        <label style="display:flex; align-items:center; cursor:pointer;">
                            <input type="checkbox" id="snap-toggle" ${this.snapToGrid ? 'checked' : ''} 
                                   style="width:18px; height:18px; cursor:pointer;" />
                        </label>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="color:#aaa; font-size:11px; white-space:nowrap;">Tamaño:</span>
                        <input type="number" id="grid-size" value="${this.gridSize || 25}" min="10" max="100" step="5"
                               style="flex:1; background:#3c3c3c; border:1px solid #555; color:#fff; padding:4px; border-radius:4px; font-size:11px;" />
                        <span style="color:#666; font-size:10px;">px</span>
                    </div>
                </div>
            </div>

            <!-- Theme Section (NEW) -->
            <div style="padding:15px; border-bottom:1px solid #333; background:#1e2d1e;">
                <div style="color:#9cdcfe; font-size:13px; font-weight:bold; margin-bottom:12px;">🎨 TEMA VISUAL</div>
                
                <div style="margin-bottom:10px;">
                    <label style="color:#aaa; font-size:11px; display:block; margin-bottom:6px;">Fondo del Tablero</label>
                    <select id="theme-background" style="width:100%; background:#3c3c3c; border:1px solid #555; color:#fff; padding:8px; border-radius:4px; cursor:pointer;">
                        <option value="solid">🟫 Color Sólido Oscuro</option>
                        <option value="texture" selected>🪨 Textura Sutil</option>
                        <option value="night">🌙 Noche de Terror</option>
                    </select>
                </div>
                
                <div style="margin-bottom:10px;">
                    <label style="color:#aaa; font-size:11px; display:block; margin-bottom:6px;">Color de Líneas</label>
                    <select id="theme-lines" style="width:100%; background:#3c3c3c; border:1px solid #555; color:#fff; padding:8px; border-radius:4px; cursor:pointer;">
                        <option value="cyan" selected>💎 Cyan Brillante</option>
                        <option value="black">⬛ Negro</option>
                        <option value="gold">🟡 Dorado</option>
                        <option value="red">🔴 Rojo Sangre</option>
                    </select>
                </div>
                
                <button id="apply-theme" style="width:100%; background:#28a745; color:#fff; border:none; padding:10px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">
                    ✅ Aplicar Tema
                </button>
            </div>
            <!-- Tools Section -->
            <div style="padding:15px; border-bottom:1px solid #333;">
                <div style="color:#9cdcfe; font-size:13px; font-weight:bold; margin-bottom:12px;">🛠️ HERRAMIENTAS</div>
                
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-bottom:10px;">
                    <button id="tool-new" title="Nueva Casilla" style="background:#007bff; border:none; border-radius:6px; height:45px; cursor:pointer; font-size:22px; display:flex; align-items:center; justify-content:center;">
                        ➕
                    </button>
                    <button id="tool-clear" title="Limpiar Todo" style="background:#ff6b6b; border:none; border-radius:6px; height:45px; cursor:pointer; font-size:22px; display:flex; align-items:center; justify-content:center;">
                        🗑️
                    </button>
                </div>
                
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
                    <button id="tool-save" title="Exportar JSON" style="background:#28a745; border:none; border-radius:6px; height:45px; cursor:pointer; font-size:22px; display:flex; align-items:center; justify-content:center;">
                        💾
                    </button>
                    <label title="Importar JSON" style="background:#17a2b8; border:none; border-radius:6px; height:45px; cursor:pointer; font-size:22px; display:flex; align-items:center; justify-content:center;">
                        📥 <input type="file" accept=".json" style="display:none" id="tool-import">
                    </label>
                </div>
                
                <label title="Subir Fondo" style="background:#6c757d; border:none; border-radius:6px; height:45px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; margin-top:8px;">
                    🖼️ Imagen de Fondo <input type="file" accept="image/*" style="display:none" id="tool-upload">
                </label>
            </div>

            <!-- Info Section -->
            <div style="padding:15px;">
                <div style="color:#666; font-size:11px; text-align:center; line-height:1.4;">
                    <p style="margin:0 0 8px 0;">Click en una casilla para editarla</p>
                    <p style="margin:0; color:#4ade80;">Tablero: ${currentWidth}×${currentHeight}px</p>
                </div>
            </div>

            <!-- Exit Button -->
            <div style="padding:15px; border-top:2px solid #444;">
                <button id="tool-exit" style="width:100%; background:#dc3545; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px;">
                    🏠 Volver al Lobby
                </button>
            </div>
        `;

        // SIDEBAR EVENTS
        document.getElementById('uni-close').onclick = () => {
            // Toggle minimize/maximize
            panel.isMinimized = !panel.isMinimized;
            panel.style.width = panel.isMinimized ? '60px' : '280px';  // Match new size
            localStorage.setItem('editorPanelMinimized', panel.isMinimized ? 'true' : 'false');

            // Redraw panel to show minimized or expanded view
            this.drawUnifiedControls();
        };

        document.getElementById('tool-exit').onclick = () => {
            panel.style.display = 'none';
            if (this.inspectorWin) this.inspectorWin.remove();

            const game = document.querySelector('.game-container') || document.querySelector('.board-container');
            if (game) game.classList.add('hidden');
            if (this.container) this.container.classList.add('hidden');
            const lobby = document.querySelector('.lobby-container');
            if (lobby) lobby.style.display = 'flex';

            window.location.reload();
        };

        // Apply board size
        document.getElementById('apply-size').onclick = () => {
            const newWidth = parseInt(document.getElementById('board-width').value) || 850;
            const newHeight = parseInt(document.getElementById('board-height').value) || 1400;

            this.setBoardSize(newWidth, newHeight);
            this.drawUnifiedControls(); // Refresh panel to show new size
        };

        // Clear all tiles
        document.getElementById('tool-clear').onclick = () => {
            if (confirm('⚠️ ¿Eliminar TODAS las casillas?\n\nEsta acción no se puede deshacer.')) {
                this.clearAllTiles();
            }
        };

        document.getElementById('tool-save').onclick = () => this.exportSkeleton();
        document.getElementById('tool-new').onclick = () => this.addNewTile();

        // Import JSON handler
        document.getElementById('tool-import').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (confirm('¿Importar layout? Esto reemplazará el tablero actual.')) {
                        localStorage.setItem('BOARD_LAYOUT_BACKUP', evt.target.result);
                        window.location.reload();
                    }
                } catch (err) {
                    alert('Error al leer JSON: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        document.getElementById('tool-upload').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => this.setBackgroundImage(evt.target.result);
            reader.readAsDataURL(file);
        };

        // === PROJECT MANAGEMENT HANDLERS ===
        document.getElementById('project-save').onclick = () => this.saveCurrentProject();
        document.getElementById('project-load').onclick = () => this.showProjectList('load');
        document.getElementById('project-new').onclick = () => this.newProject();
        document.getElementById('project-delete').onclick = () => this.showProjectList('delete');

        // === GRID CONTROL HANDLERS ===
        document.getElementById('grid-toggle').onchange = (e) => {
            this.showGrid = e.target.checked;
            localStorage.setItem('editorShowGrid', this.showGrid ? 'true' : 'false');
            this.renderGrid();
        };

        document.getElementById('snap-toggle').onchange = (e) => {
            this.snapToGrid = e.target.checked;
            localStorage.setItem('editorSnapToGrid', this.snapToGrid ? 'true' : 'false');
        };

        document.getElementById('grid-size').onchange = (e) => {
            this.gridSize = parseInt(e.target.value) || 25;
            localStorage.setItem('editorGridSize', this.gridSize);
            if (this.showGrid) this.renderGrid();
        };

        // === THEME CONTROL HANDLERS ===
        document.getElementById('apply-theme').onclick = () => {
            const bgSelect = document.getElementById('theme-background').value;
            const lineSelect = document.getElementById('theme-lines').value;

            // Apply background
            this.applyThemeBackground(bgSelect);

            // Apply line color
            this.applyThemeLines(lineSelect);

            // Save preferences
            localStorage.setItem('boardThemeBg', bgSelect);
            localStorage.setItem('boardThemeLines', lineSelect);

            this.showEditorNotification('✅ Tema aplicado');
        };
    }

    // Apply theme background
    applyThemeBackground(type) {
        const bgImage = this.rootGroup.querySelector('image');
        const bgRect = this.rootGroup.querySelector('rect:first-of-type');

        // Remove existing background
        if (bgImage) bgImage.remove();
        if (bgRect) bgRect.remove();

        // Create new background based on type
        let newBg;
        switch (type) {
            case 'solid':
                newBg = document.createElementNS(this.ns, 'rect');
                newBg.setAttribute('width', this.width);
                newBg.setAttribute('height', this.height);
                newBg.setAttribute('fill', '#1a1f1a');
                break;
            case 'texture':
                newBg = document.createElementNS(this.ns, 'image');
                newBg.setAttribute('width', this.width);
                newBg.setAttribute('height', this.height);
                newBg.setAttribute('href', './assets/bg-texture-subtle.png');
                newBg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                break;
            case 'night':
                newBg = document.createElementNS(this.ns, 'image');
                newBg.setAttribute('width', this.width);
                newBg.setAttribute('height', this.height);
                newBg.setAttribute('href', './assets/board-bg-night.png');
                newBg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                break;
        }

        // Insert at beginning of rootGroup
        if (newBg && this.rootGroup.firstChild) {
            this.rootGroup.insertBefore(newBg, this.rootGroup.firstChild);
        } else if (newBg) {
            this.rootGroup.appendChild(newBg);
        }
    }

    // Apply theme line colors
    applyThemeLines(color) {
        const linesGroup = this.rootGroup.querySelector('#connection-lines');
        if (!linesGroup) return;

        const colors = {
            'cyan': 'rgba(0, 255, 200, 0.6)',
            'black': '#000000',
            'gold': '#FFD700',
            'red': '#8B0000'
        };

        const strokeColor = colors[color] || colors['cyan'];
        const lines = linesGroup.querySelectorAll('line');
        lines.forEach(line => {
            line.setAttribute('stroke', strokeColor);
        });
    }

    addNewTile() {
        // Find max ID
        const tiles = Array.from(this.svg.querySelectorAll('.tile-group'));
        let maxId = 0;
        tiles.forEach(t => {
            const id = parseInt(t.getAttribute('data-id') || 0);
            if (id > maxId && id < 1000) maxId = id; // Avoid zone IDs like 5000 if simple sequential
        });
        // Or if standard sequential 1-80, just max
        // Actually, let's just use max + 1
        const newId = maxId + 1;

        // Position at center of view or near top left
        this.tile(100, 100, newId, newId);

        // Feedback
        // maybe open inspector for it immediately?
        const newTile = this.svg.querySelector(`.tile-group[data-id="${newId}"]`);
        if (newTile) this.openInspector(newTile);
    }

    openInspector(tileGroup) {
        this.selectedTile = tileGroup;
        this.selectedTileId = tileGroup.getAttribute('data-id'); // Track for keyboard shortcuts
        const id = tileGroup.getAttribute('data-id');
        const display = tileGroup.getAttribute('data-display');
        const x = tileGroup.dataset.x || 0;
        const y = tileGroup.dataset.y || 0;

        // Remove existing inspector window to refresh
        if (this.inspectorWin) this.inspectorWin.remove();

        // Infer Type from TILE_TYPE_MAP
        const typeKey = TILE_TYPE_MAP[String(id)];
        const tileTypeData = typeKey ? getTileType(id) : { id: 'normal', color: '#A0C4FF' };
        let type = tileTypeData.id;
        let col = tileTypeData.color;

        // CREATE FLOATING WINDOW (PRO DARK THEME)
        const win = document.createElement('div');
        this.inspectorWin = win;
        win.id = 'inspector-floating-window';

        Object.assign(win.style, {
            position: 'fixed', top: '100px', left: '100px',
            width: '260px', maxHeight: '85vh', overflowY: 'auto',
            background: '#1e1e1e', // Unity/VSCode Dark
            border: '1px solid #333',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            color: '#ccc', fontFamily: 'Segoe UI, sans-serif', fontSize: '12px',
            zIndex: '10001', display: 'flex', flexDirection: 'column'
        });

        const rowStyle = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;";
        const labelStyle = "color: #9cdcfe; font-weight: 600; min-width: 60px;";
        const inputStyle = "background: #3c3c3c; border: 1px solid #333; color: white; padding: 4px; width: 100px; border-radius: 2px; outline:none;";
        const sectionStyle = "background: #252526; padding: 10px; margin-bottom: 1px; border-left: 3px solid #007acc;";

        win.innerHTML = `
            <div id="insp-header" style="background:#2d2d2d; padding:8px 10px; border-bottom:1px solid #111; cursor:move; display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:white; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Inspector</strong>
                <button id="insp-close-btn" style="background:none; border:none; color:#aaa; cursor:pointer;">✕</button>
            </div>
            
            <div style="flex:1;">
                <!-- Transform Section -->
                <div style="${sectionStyle}">
                    <div style="color:#aaa; margin-bottom:8px; font-weight:bold;">TRANSFORM</div>
                    <div style="${rowStyle}">
                        <label style="${labelStyle}">Pos X</label>
                        <input type="number" id="insp-x" value="${x}" style="${inputStyle}">
                    </div>
                    <div style="${rowStyle}">
                        <label style="${labelStyle}">Pos Y</label>
                        <input type="number" id="insp-y" value="${y}" style="${inputStyle}">
                    </div>
                </div>

                <!-- Attributes Section -->
                <div style="${sectionStyle}">
                     <div style="color:#aaa; margin-bottom:8px; font-weight:bold;">ATTRIBUTES</div>
                     <div style="${rowStyle}">
                        <label style="${labelStyle}">Display</label>
                        <input type="text" id="insp-num" value="${display}" style="${inputStyle}">
                    </div>
                    <div style="${rowStyle}">
                         <label style="${labelStyle}">Type</label>
                         <select id="insp-type" style="${inputStyle} width:120px; cursor:pointer;">
                            <option value="normal" ${type === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="zombie" ${type === 'zombie' ? 'selected' : ''}>🧟 Zombie</option>
                            <option value="luck" ${type === 'luck' ? 'selected' : ''}>🍀 Suerte</option>
                            <option value="event" ${type === 'event' ? 'selected' : ''}>❓ Evento</option>
                            <option value="market" ${type === 'market' ? 'selected' : ''}>🏪 Mercado</option>
                            <option value="safe" ${type === 'safe' ? 'selected' : ''}>🏠 Segura</option>
                         </select>
                    </div>
                     <div style="${rowStyle}">
                        <label style="${labelStyle}">ID</label>
        <input type="text" value="${id}" disabled style="${inputStyle} opacity:0.6; cursor:not-allowed;">
                    </div>
                </div>

                <!-- Connections -->
            <div style="${sectionStyle} border-left-color: #4ec9b0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:#aaa; font-weight:bold;">CONNECTIONS</span>
                    <div style="display:flex; gap:4px;">
                         <input type="number" id="insp-new-c" placeholder="Ref ID" style="width:50px; background:#333; border:none; color:white; padding:2px;">
                         <button id="insp-add-c" style="background:#444; color:white; border:none; cursor:pointer; padding:2px; border-radius:2px;">+</button>
                    </div>
                </div>
                <div id="insp-conn-list" style="max-height:120px; overflow-y:auto;"></div>
            </div>

            <!-- GRAPH INFO SECTION - NEW -->
            <div style="${sectionStyle} border-left-color: #fda085;">
                <div style="color:#aaa; margin-bottom:8px; font-weight:bold;">GRAPH INFO</div>
                <div style="margin-bottom:6px;">
                    <div style="color:#9cdcfe; font-size:11px; margin-bottom:2px;">Sequential Position:</div>
                    <div style="background:#3c3c3c; padding:4px; border-radius:2px; color:#4facfe; font-weight:bold;">
                        ${this.getSequentialPosition ? this.getSequentialPosition(id) : '?'}
                    </div>
                </div>
                <div style="margin-bottom:6px;">
                    <div style="color:#9cdcfe; font-size:11px; margin-bottom:2px;">Next (from buildGraph):</div>
                    <div style="background:#3c3c3c; padding:4px; border-radius:2px; color:#84fab0; word-break:break-all;">
                        ${this.boardGraph && this.boardGraph[id] ?
                (Array.isArray(this.boardGraph[id].next) ?
                    this.boardGraph[id].next.join(', ') :
                    this.boardGraph[id].next) :
                'NONE'}
                    </div>
                </div>
                ${this.boardGraph && this.boardGraph[id] && Array.isArray(this.boardGraph[id].next) ?
                `<div style="margin-top:8px; padding:6px; background:rgba(253,160,133,0.1); border-radius:4px;">
                    <div style="color:#fda085; font-weight:bold; font-size:11px; margin-bottom:4px;">🔀 JUNCTION</div>
                    <div style="font-size:10px; color:#ccc;">
                      ${this.boardGraph[id].branchInfo?.map(b => `${b.id}: ${b.label}`).join('<br>') || ''}
                    </div>
                  </div>` :
                ''}
            </div>

                <!-- Actions -->
                <div style="padding:10px;">
                    <button id="insp-del" style="width:100%; background:#800000; color:white; border:none; padding:8px; cursor:pointer; text-transform:uppercase; font-size:11px; letter-spacing:1px; border-radius:2px;">Delete Object</button>
                </div>
            </div>
        `;
        document.body.appendChild(win);

        // DRAG LOGIC
        const hdr = win.querySelector('#insp-header');
        let isDown = false, offX, offY;
        hdr.onmousedown = (e) => { isDown = true; offX = e.clientX - win.offsetLeft; offY = e.clientY - win.offsetTop; };
        document.onmouseup = () => { isDown = false; };
        document.onmousemove = (e) => {
            if (isDown) {
                win.style.left = (e.clientX - offX) + 'px';
                win.style.top = (e.clientY - offY) + 'px';
            }
        };

        // BINDINGS
        win.querySelector('#insp-close-btn').onclick = () => win.remove();

        const update = () => {
            const vNum = win.querySelector('#insp-num').value;
            const vX = parseInt(win.querySelector('#insp-x').value) || 0;
            const vY = parseInt(win.querySelector('#insp-y').value) || 0;
            const vType = win.querySelector('#insp-type').value;

            this.selectedTile.setAttribute('data-display', vNum);
            const txt = this.selectedTile.querySelector('text');
            if (txt) {
                txt.textContent = vNum;
                // Move text to corner for 'Space' look
                txt.setAttribute('x', '6');
                txt.setAttribute('y', '14');
                txt.setAttribute('text-anchor', 'start');
                txt.setAttribute('font-size', '12');
                txt.setAttribute('font-weight', 'bold');
                txt.setAttribute('fill', '#777');
                txt.removeAttribute('filter');
            }

            this.selectedTile.setAttribute('transform', `translate(${vX},${vY})`);
            this.selectedTile.dataset.x = vX;
            this.selectedTile.dataset.y = vY;
            this.drawEdges();

            // RENDER WITH GAME TILE COLORS
            const rects = this.selectedTile.querySelectorAll('rect');
            rects.forEach(re => {
                re.setAttribute('rx', '4');
                re.setAttribute('stroke-width', '1');
                re.removeAttribute('filter');

                let fill = '#f7f5e6'; // Normal tile color
                let stroke = '#adb5bd';

                // Game tile type colors (matching tile-types.js)
                if (vType === 'zombie') { fill = '#4ade80'; stroke = '#22c55e'; } // Green
                if (vType === 'luck') { fill = '#a78bfa'; stroke = '#8b5cf6'; }    // Purple
                if (vType === 'event') { fill = '#fbbf24'; stroke = '#f59e0b'; }   // Yellow
                if (vType === 'market') { fill = '#f472b6'; stroke = '#ec4899'; }  // Pink
                if (vType === 'safe') { fill = '#60a5fa'; stroke = '#3b82f6'; }    // Blue

                re.setAttribute('fill', fill);
                re.setAttribute('stroke', stroke);
            });
        };

        win.querySelectorAll('input, select').forEach(el => el.onchange = update);
        win.querySelectorAll('input').forEach(el => {
            if (el.id !== 'insp-new-c') el.oninput = update;
        });

        win.querySelector('#insp-del').onclick = () => {
            if (confirm('Delete Object?')) {
                const nid = parseInt(id);
                this.modifyEdge(nid, null, 'remove_all'); // Need to handle remove all for id? Or just filter arrays.
                this.edges = this.edges.filter(e => e[0] !== nid && e[1] !== nid);
                this.drawEdges();
                this.selectedTile.remove();
                win.remove();
            }
        };

        // === CONNECTIONS UPDATE ===
        const connsDiv = win.querySelector('#insp-conn-list');
        let numId;
        if (connsDiv) {
            numId = parseInt(id);

            // Show connections from boardGraph (game data)
            if (this.boardGraph && this.boardGraph[id]) {
                const graphNext = this.boardGraph[id].next;
                const nextIds = Array.isArray(graphNext) ? graphNext : [graphNext];

                nextIds.forEach(nextId => {
                    const tag = document.createElement('span');
                    tag.style.cssText = "background:#4ade80; color:black; padding:2px 8px; border-radius:10px; font-size:11px; display:inline-flex; align-items:center; gap:5px; margin-right:4px; margin-bottom:4px; font-weight:bold;";
                    tag.innerHTML = `→ ${nextId} <span style='color:#666; font-size:9px;'>(GAME)</span>`;
                    connsDiv.appendChild(tag);
                });
            }

            // Show manual editor edges
            const myEdges = this.edges.filter(e => e[0] === numId || e[1] === numId);
            myEdges.forEach(e => {
                const other = (e[0] === numId) ? e[1] : e[0];
                const tag = document.createElement('span');
                tag.style.cssText = "background:#0e639c; color:white; padding:2px 8px; border-radius:10px; font-size:11px; display:inline-flex; align-items:center; gap:5px; margin-right:4px; margin-bottom:4px;";
                tag.innerHTML = `${other} <span style='cursor:pointer; font-weight:bold; opacity:0.7;'>x</span>`;
                tag.querySelector('span').onclick = () => {
                    this.modifyEdge(numId, other, 'remove');
                    this.openInspector(this.selectedTile);
                };
                connsDiv.appendChild(tag);
            });
        }

        win.querySelector('#insp-add-c').onclick = () => {
            const dest = win.querySelector('#insp-new-c').value;
            if (dest) {
                this.modifyEdge(numId, parseInt(dest), 'add');
                this.openInspector(this.selectedTile);
            }
        };
    }

    setBackgroundImage(url) {
        // Add image to SVG at bottom
        // Remove existing background image if any
        const existing = this.svg.querySelector('.bg-sketch');
        if (existing) existing.remove();

        const img = document.createElementNS(this.ns, 'image');
        img.setAttribute('href', url);
        img.setAttribute('width', this.width);
        img.setAttribute('height', this.height);
        img.setAttribute('preserveAspectRatio', 'none'); // Stretch to fit? Or xMidYMid meet?
        img.setAttribute('class', 'bg-sketch');
        img.setAttribute('opacity', '0.5'); // Semi-transparent to see tiles on top

        // Prepend so it's behind everything
        this.svg.insertBefore(img, this.svg.firstChild);
    }

    exportSkeleton() {
        const tiles = Array.from(this.svg.querySelectorAll('.tile-group')).map(g => {
            const id = g.getAttribute('data-id');
            // Detect type from TILE_TYPE_MAP
            const typeKey = TILE_TYPE_MAP[String(id)];
            const tileType = typeKey || 'NORMAL';

            return {
                id: id,
                display: g.getAttribute('data-display'),
                x: parseInt(g.dataset.x),
                y: parseInt(g.dataset.y),
                type: tileType
            };
        });

        const edges = this.edges;

        const data = { tiles, edges, version: 'v2' };
        const json = JSON.stringify(data, null, 2);
        console.log("SKELETON DATA:", json);

        // Save to Local Storage
        localStorage.setItem('BOARD_LAYOUT_BACKUP', json);

        // Download as file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `board-layout-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert("✅ Guardado en Navegador y descargado como JSON!\n\n🔹 Incluye tipos de casillas\n🔹 Copia al portapapeles también");
        navigator.clipboard.writeText(json);
    }

    // === PROJECT MANAGEMENT SYSTEM ===

    // Get all projects from localStorage
    getProjects() {
        try {
            const data = localStorage.getItem('editorProjects');
            return data ? JSON.parse(data) : { projects: [], activeProjectId: null };
        } catch {
            return { projects: [], activeProjectId: null };
        }
    }

    // Save projects to localStorage
    setProjects(data) {
        localStorage.setItem('editorProjects', JSON.stringify(data));
    }

    // Get active project
    getActiveProject() {
        const data = this.getProjects();
        if (!data.activeProjectId) return null;
        return data.projects.find(p => p.id === data.activeProjectId) || null;
    }

    // Get current board data as project data
    getCurrentBoardData() {
        const tiles = Array.from(this.svg.querySelectorAll('.tile-group')).map(g => {
            const id = g.getAttribute('data-id');
            const typeKey = TILE_TYPE_MAP[String(id)];
            return {
                id: id,
                display: g.getAttribute('data-display'),
                x: parseInt(g.dataset.x),
                y: parseInt(g.dataset.y),
                type: typeKey || 'NORMAL'
            };
        });
        return {
            tiles,
            edges: this.edges,
            boardWidth: this.width || 850,
            boardHeight: this.height || 1400
        };
    }

    // Save current project
    saveCurrentProject() {
        const data = this.getProjects();
        const activeProject = data.projects.find(p => p.id === data.activeProjectId);

        if (activeProject) {
            // Update existing project
            activeProject.data = this.getCurrentBoardData();
            activeProject.modified = new Date().toISOString();
            this.setProjects(data);
            alert(`✅ Proyecto "${activeProject.name}" guardado!`);
        } else {
            // Create new project
            const name = prompt('Nombre del proyecto:');
            if (!name || !name.trim()) return;

            const newProject = {
                id: 'proj_' + Date.now(),
                name: name.trim(),
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                data: this.getCurrentBoardData()
            };

            data.projects.push(newProject);
            data.activeProjectId = newProject.id;
            this.setProjects(data);

            alert(`✅ Proyecto "${name}" creado!`);
            this.drawUnifiedControls(); // Refresh panel to show new name
        }
    }

    // Create new project
    newProject() {
        const data = this.getProjects();
        const activeProject = data.projects.find(p => p.id === data.activeProjectId);

        if (activeProject && !confirm('¿Crear nuevo proyecto?\n\nEl proyecto actual se guardará primero.')) {
            return;
        }

        // Save current if exists
        if (activeProject) {
            activeProject.data = this.getCurrentBoardData();
            activeProject.modified = new Date().toISOString();
        }

        // Clear active project and board
        data.activeProjectId = null;
        this.setProjects(data);
        this.clearAllTiles();
        this.drawUnifiedControls();
    }

    // Show project list modal
    showProjectList(mode) {
        const data = this.getProjects();

        if (data.projects.length === 0) {
            alert('📁 No hay proyectos guardados.\n\nUsa "💾 Guardar" para crear uno.');
            return;
        }

        // Create modal
        let modal = document.getElementById('project-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'project-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10001;
            display: flex; align-items: center; justify-content: center;
        `;

        const title = mode === 'load' ? '📂 Cargar Proyecto' : '🗑️ Eliminar Proyecto';
        const actionBtn = mode === 'load' ? '📂 Cargar' : '🗑️ Eliminar';
        const actionColor = mode === 'load' ? '#17a2b8' : '#dc3545';

        modal.innerHTML = `
            <div style="background:#1e1e1e; border-radius:12px; width:320px; max-height:80vh; overflow:hidden; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
                <div style="padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:#fff; font-size:16px;">${title}</h3>
                    <button id="close-project-modal" style="background:none; border:none; color:#888; font-size:20px; cursor:pointer;">✕</button>
                </div>
                <div id="project-list" style="max-height:300px; overflow-y:auto; padding:10px;">
                    ${data.projects.map(p => `
                        <div class="project-item" data-id="${p.id}" style="
                            padding:12px; margin-bottom:8px; background:#2d2d2d; border-radius:8px;
                            cursor:pointer; border:2px solid transparent; transition:all 0.2s;
                        " onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='transparent'">
                            <div style="color:#fff; font-weight:bold; margin-bottom:4px;">${p.name}</div>
                            <div style="color:#666; font-size:11px;">
                                📅 ${new Date(p.modified).toLocaleDateString()} • 
                                🧱 ${p.data?.tiles?.length || 0} tiles
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="padding:15px; border-top:1px solid #333;">
                    <button id="project-action-btn" disabled style="
                        width:100%; background:${actionColor}; color:#fff; border:none;
                        padding:10px; border-radius:6px; cursor:pointer; font-size:14px; opacity:0.5;
                    ">${actionBtn}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        let selectedId = null;
        const actionBtnEl = document.getElementById('project-action-btn');

        // Selection handlers
        modal.querySelectorAll('.project-item').forEach(item => {
            item.onclick = () => {
                modal.querySelectorAll('.project-item').forEach(i => i.style.background = '#2d2d2d');
                item.style.background = '#3d3d3d';
                selectedId = item.dataset.id;
                actionBtnEl.disabled = false;
                actionBtnEl.style.opacity = '1';
            };
        });

        // Close button
        document.getElementById('close-project-modal').onclick = () => modal.remove();

        // Action button
        actionBtnEl.onclick = () => {
            if (!selectedId) return;

            if (mode === 'load') {
                this.loadProject(selectedId);
            } else {
                this.deleteProject(selectedId);
            }
            modal.remove();
        };

        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // Load project by ID
    loadProject(projectId) {
        const data = this.getProjects();
        const project = data.projects.find(p => p.id === projectId);

        if (!project) {
            alert('❌ Proyecto no encontrado');
            return;
        }

        // Set as active
        data.activeProjectId = projectId;
        this.setProjects(data);

        // Load board data
        if (project.data) {
            const layoutJson = JSON.stringify({
                tiles: project.data.tiles,
                edges: project.data.edges,
                version: 'v2'
            });
            localStorage.setItem('BOARD_LAYOUT_BACKUP', layoutJson);

            // Reload to apply
            alert(`📂 Cargando proyecto "${project.name}"...`);
            window.location.reload();
        }
    }

    // Delete project by ID
    deleteProject(projectId) {
        const data = this.getProjects();
        const project = data.projects.find(p => p.id === projectId);

        if (!project) return;

        if (!confirm(`¿Eliminar proyecto "${project.name}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        data.projects = data.projects.filter(p => p.id !== projectId);

        if (data.activeProjectId === projectId) {
            data.activeProjectId = null;
        }

        this.setProjects(data);
        alert(`🗑️ Proyecto "${project.name}" eliminado`);
        this.drawUnifiedControls();
    }

    // Render visual grid on the board
    renderGrid() {
        // Remove existing grid
        const existingGrid = this.svg.querySelector('#editor-grid');
        if (existingGrid) existingGrid.remove();

        if (!this.showGrid) return;

        const gridGroup = document.createElementNS(this.ns, 'g');
        gridGroup.id = 'editor-grid';
        gridGroup.style.pointerEvents = 'none'; // Don't interfere with clicks

        const width = this.width || 850;
        const height = this.height || 1400;
        const size = this.gridSize || 25;

        // Create grid pattern using lines
        // Vertical lines
        for (let x = 0; x <= width; x += size) {
            const line = document.createElementNS(this.ns, 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', 'rgba(100, 126, 234, 0.2)');
            line.setAttribute('stroke-width', '0.5');
            gridGroup.appendChild(line);
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += size) {
            const line = document.createElementNS(this.ns, 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(100, 126, 234, 0.2)');
            line.setAttribute('stroke-width', '0.5');
            gridGroup.appendChild(line);
        }

        // Major gridlines every 100px
        for (let x = 0; x <= width; x += 100) {
            const line = document.createElementNS(this.ns, 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', 'rgba(100, 126, 234, 0.5)');
            line.setAttribute('stroke-width', '1');
            gridGroup.appendChild(line);
        }
        for (let y = 0; y <= height; y += 100) {
            const line = document.createElementNS(this.ns, 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'rgba(100, 126, 234, 0.5)');
            line.setAttribute('stroke-width', '1');
            gridGroup.appendChild(line);
        }

        // Insert at beginning of rootGroup so it's behind tiles
        this.rootGroup.insertBefore(gridGroup, this.rootGroup.firstChild);
        console.log(`📐 [GRID] Rendered grid: ${size}px spacing`);
    }

    // Snap position to grid
    snapToGridPos(value) {
        if (!this.snapToGrid) return value;
        const size = this.gridSize || 25;
        return Math.round(value / size) * size;
    }

    // Set board size
    setBoardSize(width, height) {
        this.width = width;
        this.height = height;

        // Update SVG viewBox
        if (this.svg) {
            this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            console.log(`📐 Board size updated: ${width}×${height}px`);
        }
    }

    // Clear all tiles from board
    clearAllTiles() {
        if (!this.svg) return;

        // Remove all tile groups
        const tiles = this.svg.querySelectorAll('.tile-group');
        tiles.forEach(tile => tile.remove());

        // Clear edges
        this.edges = [];
        this.drawEdges();

        // Close inspector if open
        if (this.inspectorWin) this.inspectorWin.remove();

        console.log('🗑️ All tiles cleared');
        alert('✅ Todas las casillas eliminadas\n\n Usa ➕ para crear nuevas');
    }

    drawBoard() {
        this.edges = []; // Reset edges
        this.tileIdx = 0; // Reset counter for layout overrides

        // Use this.layoutData from Constructor (Imported or LocalStorage)


        // --- DEFINITIONS (Gradients & Shadows) ---

        const defs = document.createElementNS(this.ns, 'defs');
        // ... (Filters code assumed unchanged, reuse existing but need to ensure it's here if replacing whole function? 
        // No, I'm replacing the whole drawBoard, so I must include the definitions.)

        // 1. Soft Drop Shadow
        const shadowFilter = document.createElementNS(this.ns, 'filter');
        shadowFilter.setAttribute('id', 'softShadow');
        shadowFilter.setAttribute('x', '-50%');
        shadowFilter.setAttribute('y', '-50%');
        shadowFilter.setAttribute('width', '200%');
        shadowFilter.setAttribute('height', '200%');
        const blur = document.createElementNS(this.ns, 'feGaussianBlur');
        blur.setAttribute('in', 'SourceAlpha'); blur.setAttribute('stdDeviation', '3');
        const offset = document.createElementNS(this.ns, 'feOffset');
        offset.setAttribute('dx', '2'); offset.setAttribute('dy', '4'); offset.setAttribute('result', 'offsetblur');
        const flood = document.createElementNS(this.ns, 'feFlood');
        flood.setAttribute('flood-color', 'rgba(0,0,0,0.3)');
        const composite = document.createElementNS(this.ns, 'feComposite');
        composite.setAttribute('in2', 'offsetblur'); composite.setAttribute('operator', 'in');
        const merge = document.createElementNS(this.ns, 'feMerge');
        const node1 = document.createElementNS(this.ns, 'feMergeNode');
        const node2 = document.createElementNS(this.ns, 'feMergeNode');
        node2.setAttribute('in', 'SourceGraphic');
        merge.appendChild(node1); merge.appendChild(node2);
        shadowFilter.appendChild(blur); shadowFilter.appendChild(offset);
        shadowFilter.appendChild(flood); shadowFilter.appendChild(composite); shadowFilter.appendChild(merge);
        defs.appendChild(shadowFilter);

        // 2. Gradients
        const gradients = [
            { id: 'gradBlue', start: '#4facfe', end: '#00f2fe' },
            { id: 'gradRed', start: '#ff9a9e', end: '#fecfef' },
            { id: 'gradYellow', start: '#f6d365', end: '#fda085' },
            { id: 'gradGreen', start: '#84fab0', end: '#8fd3f4' },
            { id: 'gradSafe', start: '#43e97b', end: '#38f9d7' },
            { id: 'gradMortal', start: '#fa709a', end: '#fee140' },
            { id: 'gradGray', start: '#ffffff', end: '#ced4da' }
        ];
        gradients.forEach(g => {
            const lg = document.createElementNS(this.ns, 'linearGradient');
            lg.setAttribute('id', g.id);
            lg.setAttribute('x1', '0%'); lg.setAttribute('x2', '100%'); lg.setAttribute('y1', '0%'); lg.setAttribute('y2', '100%');
            const stop1 = document.createElementNS(this.ns, 'stop');
            stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', g.start);
            const stop2 = document.createElementNS(this.ns, 'stop');
            stop2.setAttribute('offset', '100%'); stop2.setAttribute('stop-color', g.end);
            lg.appendChild(stop1); lg.appendChild(stop2);
            defs.appendChild(lg);
        });
        this.svg.appendChild(defs);

        // Background - Either Tilemap or Image
        if (this.useTilemap) {
            // Initialize TileRenderer if not already done
            if (!this.tileRenderer) {
                this.tileRenderer = new TileRenderer(this.svg, this.ns);
            }

            // Render dark background first
            const bg = document.createElementNS(this.ns, 'rect');
            bg.setAttribute('width', this.width);
            bg.setAttribute('height', this.height);
            bg.setAttribute('fill', '#1a1f1a');
            this.rootGroup.appendChild(bg);

            // Render city tilemap
            this.tileRenderer.renderMap(CITY_TILEMAP, this.rootGroup);
        } else {
            // LAYER 1: City Map Background Image
            const bg = document.createElementNS(this.ns, 'image');
            bg.setAttribute('width', this.width);
            bg.setAttribute('height', this.height);
            bg.setAttribute('href', './assets/city-background.jpg');
            bg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            this.rootGroup.appendChild(bg);
        }

        // CHECK FOR FULL SNAPSHOT
        if (this.layoutData && !Array.isArray(this.layoutData) && this.layoutData.tiles) {
            console.log("Loading Full Snapshot Mode...");
            // Render Border
            this.drawWorldBorder();
            // Render Decoration
            // this.drawDecoration(); // Disabled - decorative lines removed

            // Render Tiles from Snapshot
            this.layoutData.tiles.forEach(t => {
                // Draw all tiles including START (0) and FINAL (80)
                this.tile(t.x, t.y, t.id, t.display || t.id);
            });
            // Load Edges
            this.edges = this.layoutData.edges || [];
            this.drawEdges();
            // this.drawCenter(); // Disabled - decorative center lines removed
            return; // SKIP STANDARD GENERATION
        }

        const s = this.ts + this.gap;

        // Render Border
        this.drawWorldBorder();

        // Decoration (Moved to helper to allow reuse)
        // this.drawDecoration(); // Disabled - decorative lines removed
        // === INICIO ===


        // === ZONA INFERIOR: 1-10 ===
        let x = 150;
        const bottomY = 710;
        for (let i = 1; i <= 10; i++) {
            this.tile(x, bottomY, i, i);
            if (i > 1) this.addEdge(i - 1, i);
            x += s;
        }
        // Connect 10 to Next (Split)
        // 10 connects to start of A, B, C

        // === BIFURCACIÓN A/B/C: 12-18 ===
        const bx = x + 15;
        const parallelIndices = [12, 13, 14, 15, 16, 17];

        // IDs: Row A (10xx), Row B (20xx), Row C (30xx)

        // Draw & Edge Logic
        // Row A (Top): 12, 13, 14
        this.tile(bx, bottomY - 50, 1012, 12); this.addEdge(10, 1012);
        this.tile(bx + s, bottomY - 50, 1013, 13); this.addEdge(1012, 1013);
        this.tile(bx + s * 2, bottomY - 50, 1014, 14); this.addEdge(1013, 1014);

        // Row B (Mid): 12..17
        this.tile(bx, bottomY, 2012, 12); this.addEdge(10, 2012);
        let prev = 2012;
        [13, 14, 15, 16, 17].forEach(n => {
            let id = 2000 + n;
            this.tile(bx + (n - 12) * s + s, bottomY, id, n);
            this.addEdge(prev, id);
            prev = id;
        });

        // Row C (Bot): 12, 13, 14
        this.tile(bx, bottomY + 50, 3012, 12); this.addEdge(10, 3012);
        this.tile(bx + s, bottomY + 50, 3013, 13); this.addEdge(3012, 3013);
        this.tile(bx + s * 2, bottomY + 50, 3014, 14); this.addEdge(3013, 3014);

        // Merge (18)
        x = bx + s * 4 + 20;
        this.tile(x, bottomY, 18, 18);
        this.addEdge(1014, 18);
        this.addEdge(prev, 18); // 2017
        this.addEdge(3014, 18);

        // === ZONA DERECHA: 19-25 ===
        x = 1250;
        let y = 710;
        this.addEdge(18, 19);
        for (let i = 19; i <= 25; i++) {
            this.tile(x, y, i, i);
            if (i > 19) this.addEdge(i - 1, i);
            y -= s;
        }

        // === DIAMANTE: 26-33 ===
        y -= s;
        this.tile(x, y, 26, 26); this.addEdge(25, 26);

        // Left Branch (27-30) unique IDs standard
        this.tile(x - 45, y - 45, 27, 27); this.addEdge(26, 27);
        this.tile(x - 45, y - 90, 28, 28); this.addEdge(27, 28);
        this.tile(x - 45, y - 135, 29, 29); this.addEdge(28, 29);
        this.tile(x - 45, y - 180, 30, 30); this.addEdge(29, 30);

        // Right Branch (31-33)
        this.tile(x + 45, y - 45, 31, 31); this.addEdge(26, 31);
        this.tile(x + 45, y - 90, 32, 32); this.addEdge(31, 32);
        this.tile(x + 45, y - 135, 33, 33); this.addEdge(32, 33);

        // Exit (34)
        const zigY = y - 225;
        this.tile(x, zigY, 34, 34);
        this.addEdge(30, 34);
        this.addEdge(33, 34);

        // === ZIG-ZAG: 35-50 ===
        let zigX = x - 45;
        let up = false;
        this.addEdge(34, 35);
        for (let i = 35; i <= 50; i++) {
            const yOff = up ? -30 : 30;
            this.tile(zigX, zigY + yOff, i, i);
            if (i > 35) this.addEdge(i - 1, i);
            zigX -= 42;
            up = !up;
        }

        // === ZONA SUPERIOR PARALELA: 51-64 ===
        const topY = 80;
        const mortRowY = 150;
        let px = 350;

        // Split from 50
        this.addEdge(50, 5051); // Safe start
        this.addEdge(50, 6051); // Mortal start

        // Safe (50xx)
        for (let i = 0; i < 14; i++) {
            const n = 51 + i;
            const id = 5000 + n;
            this.tile(px + i * s, topY, id, n);
            if (i > 0) this.addEdge(5000 + n - 1, id);
        }

        // Mortal (60xx)
        // px reset if aligned left? Yes px=350
        for (let i = 0; i < 10; i++) {
            const n = 51 + i;
            const id = 6000 + n;
            this.tile(px + i * s, mortRowY, id, n);
            if (i > 0) this.addEdge(6000 + n - 1, id);
        }

        // Merge to 65?
        // Safe 5064 -> 65
        this.addEdge(5064, 65);
        // Mortal 6060 -> 65? Or Penalty? Assuming merge for visual graph
        this.addEdge(6060, 65);

        // === SERPIENTE: 65-80 ===
        const snake = [
            [180, 220], [155, 260], [130, 300], [110, 345],
            [95, 390], [85, 435], [100, 480], [125, 520],
            [150, 555], [130, 595], [105, 635], [85, 670],
            [70, 710], [90, 750], [120, 780], [155, 795]
        ];
        snake.forEach((pos, i) => {
            const n = 65 + i;
            this.tile(pos[0], pos[1], n, n);
            if (i > 0) this.addEdge(n - 1, n);
        });

        // === META ===
        // === META ===
        this.box(30, 550, 70, 50, 'META', '#DC3545', '#fff');
        this.addEdge(80, 8081); // Legacy

        this.drawEdges(); // Initial edge draw
        // this.drawCenter(); // Disabled - decorative center lines removed
    }

    drawWorldBorder() {
        // Dynamic Wood Frame inside SVG
        const frame = document.createElementNS(this.ns, 'rect');
        frame.setAttribute('x', 0);
        frame.setAttribute('y', 0);
        frame.setAttribute('width', this.width);
        frame.setAttribute('height', this.height);
        frame.setAttribute('fill', 'none');
        frame.setAttribute('stroke', '#5D4037'); // Wood Dark
        frame.setAttribute('stroke-width', '24'); // Thick Border
        frame.setAttribute('rx', '12'); // Rounded corners inside

        // Inner Bevel (simulated with another rect)
        const bevel = document.createElementNS(this.ns, 'rect');
        bevel.setAttribute('x', 12);
        bevel.setAttribute('y', 12);
        bevel.setAttribute('width', this.width - 24);
        bevel.setAttribute('height', this.height - 24);
        bevel.setAttribute('fill', 'none');
        bevel.setAttribute('stroke', '#3E2723'); // Darker Inner
        bevel.setAttribute('stroke-width', '4');
        bevel.setAttribute('rx', '8');

        // Append to SVG (Background Layer)
        // Insert at beginning to be behind everything? No, border should be visually on top?
        // If on top, it borders everything. If behind, tiles might overlap.
        // Usually frames are on top.
        this.rootGroup.appendChild(frame);
        this.rootGroup.appendChild(bevel);
    }

    drawDecoration() {
        // === INICIO ===
        this.box(30, 680, 80, 60, 'INICIO', '#ffffff', '#333');
        // === META ===
        this.box(30, 550, 70, 50, 'META', '#DC3545', '#fff');

        // Labels
        this.label(450, 800, 'Zona Inferior');
        this.label(680, 670, 'A/B/C', '#666', 12);
        this.label(1320, 500, 'Z. Derecha', '#666', 12, 90);
        this.label(280, 95, 'Segura', '#2E7D32', 14);
        this.label(280, 165, 'Mortal', '#C62828', 14);
    }

    tile(x, y, id, displayNum) {
        // Handle args
        let n = displayNum;
        let uid = id;

        // Fallback for old calls
        if (displayNum === undefined) { n = id; uid = id; }

        // Layout Override (Legacy Array Mode)
        if (this.layoutData && Array.isArray(this.layoutData)) {
            const override = this.layoutData.find(d => d.id == uid);
            if (override) {
                if (typeof override.x === 'number') x = override.x;
                if (typeof override.y === 'number') y = override.y;
            }
        }

        const g = document.createElementNS(this.ns, 'g');
        g.setAttribute('class', 'tile-group draggable');
        g.setAttribute('data-id', uid); // Unique ID for logic
        g.setAttribute('data-display', n); // Visual Number
        g.setAttribute('transform', `translate(${x},${y})`);
        g.dataset.x = x; g.dataset.y = y;

        // Default 'Floor' Style (Not Button)
        let fill = '#fcfcfc';
        let stroke = '#adb5bd';
        let textColor = '#555';
        let tileSize = this.ts; // Default tile size

        // Special tiles: START and FINAL - Make them larger
        if (String(uid) === '0') {
            // Punto de Partida - Green and larger
            fill = '#4CAF50';
            stroke = '#2E7D32';
            textColor = '#FFF';
            tileSize = this.ts * 1.5; // 50% larger
        } else if (String(uid) === '80') {
            // FINAL - Gold/Red and larger
            fill = '#FFD700';
            stroke = '#FF6B00';
            textColor = '#8B4513';
            tileSize = this.ts * 1.5; // 50% larger
        }

        // Group gets attributes
        const r = document.createElementNS(this.ns, 'rect');
        r.setAttribute('class', 'tile-base'); // Mark for updates
        r.setAttribute('width', tileSize);
        r.setAttribute('height', tileSize);
        r.setAttribute('rx', 4); // Slight round
        r.setAttribute('fill', fill);
        r.setAttribute('stroke', stroke); // Border
        r.setAttribute('stroke-width', '3'); // Thicker border for special tiles
        // No filter for clean floor look
        g.appendChild(r);

        // Number Badge (hidden in game mode, visible in editor)
        const t = document.createElementNS(this.ns, 'text');
        t.setAttribute('class', 'badge-txt tile-number');
        // Center text in tile for rotation (LOCAL COORDINATES, since Group is translated)
        const cx = tileSize / 2;
        const cy = tileSize / 2;

        t.setAttribute('x', cx);
        t.setAttribute('y', cy);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'middle');

        // Dynamic font size for long text
        let fontSize = 14;
        const textStr = String(n);

        if (textStr.length > 8) {
            fontSize = 10; // Smaller for long text
        } else if (textStr.length > 5) {
            fontSize = 11;
        }

        t.setAttribute('font-size', fontSize);
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('font-family', '"Segoe UI", sans-serif');
        t.setAttribute('fill', textColor);

        // Rotate 90deg around center (Local)
        t.setAttribute('transform', `rotate(90, ${cx}, ${cy})`);

        // Multi-line support for long text with spaces
        if (textStr.includes(' ') && textStr.length > 8) {
            // Split into words
            const words = textStr.split(' ');
            const lineHeight = fontSize + 2;
            const totalLines = words.length;
            const startY = -(totalLines - 1) * lineHeight / 2;

            words.forEach((word, i) => {
                const tspan = document.createElementNS(this.ns, 'tspan');
                tspan.setAttribute('x', cx);
                tspan.setAttribute('dy', i === 0 ? startY : lineHeight);
                tspan.textContent = word;
                t.appendChild(tspan);
            });
        } else {
            // Single line
            t.textContent = textStr;
        }

        g.appendChild(t);

        this.rootGroup.appendChild(g);
    }

    box(x, y, w, h, txt, fill, txtCol = '#333') {
        const g = document.createElementNS(this.ns, 'g');
        g.setAttribute('class', 'draggable'); // Make draggable
        g.setAttribute('transform', `translate(${x},${y})`);
        // Adapt rect to 0,0 since group is translated
        const r = document.createElementNS(this.ns, 'rect');
        r.setAttribute('x', 0);
        r.setAttribute('y', 0);
        r.setAttribute('width', w);
        r.setAttribute('height', h);
        r.setAttribute('rx', 4);
        r.setAttribute('fill', fill);
        r.setAttribute('stroke', '#222');
        r.setAttribute('stroke-width', 3);
        r.style.filter = 'url(#sketchy)'; // APPLY FILTER
        g.appendChild(r);

        const t = document.createElementNS(this.ns, 'text');
        t.setAttribute('x', w / 2);
        t.setAttribute('y', h / 2 + 8);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '18'); // Smaller font
        t.setAttribute('font-family', '"Patrick Hand", sans-serif');
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('fill', txtCol);
        // Rotate 90deg around center of text (w/2, h/2+8 approx?)
        // Actually center of box is w/2, h/2. Text is at y = h/2 + 8.
        // Let's rotate around w/2, h/2.
        t.setAttribute('transform', `rotate(90, ${w / 2}, ${h / 2})`);
        t.textContent = txt;
        g.appendChild(t);

        this.rootGroup.appendChild(g);
    }

    drawCenter() {
        const cx = 600, cy = 420;

        // Mazos
        this.deck(cx - 120, cy - 50, '#4A90D9', 'Segura');
        this.deck(cx + 80, cy - 50, '#E85D5D', 'Mortal');

        // Dado
        const g = document.createElementNS(this.ns, 'g');
        g.setAttribute('id', 'dice-svg');
        g.style.cursor = 'pointer';

        const r = document.createElementNS(this.ns, 'rect');
        r.setAttribute('x', cx - 15);
        r.setAttribute('y', cy - 30);
        r.setAttribute('width', 45);
        r.setAttribute('height', 45);
        r.setAttribute('rx', 6);
        r.setAttribute('fill', '#FFF');
        r.setAttribute('stroke', '#333');
        r.setAttribute('stroke-width', 2);
        g.appendChild(r);

        [[10, 10], [23, 23], [10, 35]].forEach(([px, py]) => {
            const c = document.createElementNS(this.ns, 'circle');
            c.setAttribute('cx', cx - 15 + px);
            c.setAttribute('cy', cy - 30 + py);
            c.setAttribute('r', 4);
            c.setAttribute('fill', '#333');
            g.appendChild(c);
        });

        t.setAttribute('x', cx + 7);
        t.setAttribute('y', cy + 30);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '11');
        // Rotate Dice 90
        t.setAttribute('transform', `rotate(90, ${cx + 7}, ${cy + 30})`);
        t.textContent = '🎲';
        g.appendChild(t);

        this.rootGroup.appendChild(g);
    }

    deck(x, y, col, lbl) {
        const g = document.createElementNS(this.ns, 'g');
        g.setAttribute('class', 'deck');
        g.setAttribute('data-deck', lbl.toLowerCase());
        g.style.cursor = 'pointer';

        for (let i = 2; i >= 0; i--) {
            const r = document.createElementNS(this.ns, 'rect');
            r.setAttribute('x', x + i * 2);
            r.setAttribute('y', y + i * 2);
            r.setAttribute('width', 50);
            r.setAttribute('height', 75);
            r.setAttribute('rx', 4);
            r.setAttribute('fill', col);
            r.setAttribute('stroke', '#333');
            r.setAttribute('stroke-width', 2);
            g.appendChild(r);
        }

        const t = document.createElementNS(this.ns, 'text');
        t.setAttribute('x', x + 25);
        t.setAttribute('y', y + 95);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '11');
        t.textContent = lbl;
        g.appendChild(t);

        this.rootGroup.appendChild(g);
    }

    label(x, y, txt, col = '#666', sz = 14, rot = 90) {
        const t = document.createElementNS(this.ns, 'text');
        t.setAttribute('x', x);
        t.setAttribute('y', y);
        t.setAttribute('font-size', sz);
        t.setAttribute('fill', col);
        // Default rot is now 90
        t.setAttribute('transform', `rotate(${rot},${x},${y})`);
        t.textContent = txt;
        this.rootGroup.appendChild(t);
    }

    // Capture standard graph connections
    addEdge(fromId, toId) {
        this.edges.push([fromId, toId]);
    }

    drawEdges() {
        // Remove existing
        const oldGrp = this.svg.querySelector('#connections-layer');
        if (oldGrp) oldGrp.remove();

        const grp = document.createElementNS(this.ns, 'g');
        grp.id = 'connections-layer';

        // Try to insert after background, but use appendChild as fallback
        try {
            const bg = this.svg.querySelector('rect');
            if (bg && bg.nextSibling && bg.parentNode === this.svg) {
                this.svg.insertBefore(grp, bg.nextSibling);
            } else {
                // Fallback: just append to root
                this.svg.appendChild(grp);
            }
        } catch (e) {
            console.warn('[drawEdges] insertBefore failed, using appendChild:', e);
            this.svg.appendChild(grp);
        }

        this.edges.forEach(([id1, id2]) => {
            const t1 = this.svg.querySelector(`.tile-group[data-id="${id1}"]`);
            const t2 = this.svg.querySelector(`.tile-group[data-id="${id2}"]`);

            if (t1 && t2) {
                // Determine centers
                // Transforms
                const getPos = (el) => {
                    const tr = el.transform.baseVal.getItem(0).matrix;
                    return { x: tr.e + this.ts / 2, y: tr.f + this.ts / 2 };
                };

                const p1 = getPos(t1);
                const p2 = getPos(t2);

                const line = document.createElementNS(this.ns, 'line');
                line.setAttribute('x1', p1.x);
                line.setAttribute('y1', p1.y);
                line.setAttribute('x2', p2.x);
                line.setAttribute('y2', p2.y);
                line.setAttribute('stroke', '#6c757d');
                line.setAttribute('stroke-width', '2');
                // line.setAttribute('stroke-dasharray', '4'); // Optional dashed
                grp.appendChild(line);
            }
        });
    }

    addInteractivity() {
        console.log('[INTERACTIVITY] addInteractivity() called, this.svg:', this.svg);
        // DRAG AND DROP LOGIC
        let draggedElement = null;
        let offset = { x: 0, y: 0 };
        let startPos = { x: 0, y: 0 }; // Track start for threshold
        let isDragging = false;

        const startDrag = (evt) => {
            console.log('[DRAG] mousedown detected, isEditorMode:', this.isEditorMode);
            if (!this.isEditorMode) return; // EDITOR GUARD

            const group = evt.target.closest('.draggable');
            console.log('[DRAG] draggable group:', group);
            if (group) {
                isDragging = false;
                draggedElement = group;
                startPos = { x: evt.clientX, y: evt.clientY };

                // Get transforms
                const transforms = group.transform.baseVal;
                let tx = 0, ty = 0;
                if (transforms.length > 0 && transforms.getItem(0).type === SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                    tx = transforms.getItem(0).matrix.e;
                    ty = transforms.getItem(0).matrix.f;
                }

                // Get click position in rootGroup coordinate space
                const pt = this.svg.createSVGPoint();
                pt.x = evt.clientX;
                pt.y = evt.clientY;
                const ctm = this.rootGroup.getScreenCTM().inverse();
                const svgPt = pt.matrixTransform(ctm);

                offset.x = svgPt.x - tx;
                offset.y = svgPt.y - ty;

                // Bring to front
                this.rootGroup.appendChild(group);
                console.log('[DRAG] Drag started for element:', group.getAttribute('data-id'));
            }
        };

        const drag = (evt) => {
            if (!this.isEditorMode) return; // EDITOR GUARD

            if (draggedElement) {
                // THRESHOLD CHECK
                const dx = Math.abs(evt.clientX - startPos.x);
                const dy = Math.abs(evt.clientY - startPos.y);
                if (dx < 3 && dy < 3) return; // Ignore jitter

                isDragging = true;
                evt.preventDefault();

                // Get point in SVG coordinate space
                const pt = this.svg.createSVGPoint();
                pt.x = evt.clientX;
                pt.y = evt.clientY;

                // Transform to rootGroup coordinate space (accounting for rotation)
                const ctm = this.rootGroup.getScreenCTM().inverse();
                const svgPt = pt.matrixTransform(ctm);

                // Apply snap-to-grid if enabled
                let newX = Math.round(svgPt.x - offset.x);
                let newY = Math.round(svgPt.y - offset.y);

                if (this.snapToGrid && this.isEditorMode) {
                    newX = this.snapToGridPos(newX);
                    newY = this.snapToGridPos(newY);
                }

                draggedElement.setAttribute('transform', `translate(${newX},${newY})`);
                draggedElement.dataset.x = newX;
                draggedElement.dataset.y = newY;
                draggedElement.style.cursor = 'grabbing';

                this.drawEdges();
            }
        };

        const endDrag = (evt) => {
            if (!this.isEditorMode) return; // EDITOR GUARD

            if (draggedElement) {
                draggedElement.style.cursor = 'pointer';

                // If it wasn't a drag (just a click), open Inspector
                // ONLY if not in editor mode (inspector conflicts with dragging)
                if (!isDragging && !this.isEditorMode) {
                    this.openInspector(draggedElement);
                }

                draggedElement = null;
            }
        };

        console.log('[INTERACTIVITY] Attaching event listeners');

        // Helper to get clientX/Y from mouse or touch event
        const getClientPos = (evt) => {
            if (evt.touches && evt.touches.length > 0) {
                return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
            }
            return { x: evt.clientX, y: evt.clientY };
        };

        // Wrapped handlers for touch support
        const handleStart = (evt) => {
            const pos = getClientPos(evt);
            // Create a mock event-like object with the coordinates
            const eventWithPos = {
                clientX: pos.x,
                clientY: pos.y,
                target: evt.target,
                preventDefault: () => evt.preventDefault?.(),
                stopPropagation: () => evt.stopPropagation?.()
            };
            startDrag(eventWithPos);
        };

        const handleMove = (evt) => {
            const pos = getClientPos(evt);
            // Create a mock event-like object with the coordinates
            const eventWithPos = {
                clientX: pos.x,
                clientY: pos.y,
                target: evt.target,
                preventDefault: () => evt.preventDefault?.(),
                stopPropagation: () => evt.stopPropagation?.()
            };
            drag(eventWithPos);
        };

        // Mouse events
        this.svg.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', endDrag);

        // Touch events for mobile tile dragging
        this.svg.addEventListener('touchstart', handleStart, { passive: true });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', endDrag);

        console.log('[INTERACTIVITY] Event listeners attached (mouse + touch)');
    }

    getSVGPoint(evt) {
        const pt = this.svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        return pt.matrixTransform(this.svg.getScreenCTM().inverse());
    }

    // REMOVED DUPLICATE openInspector/closeInspector
    // modifyEdge IS NEEDED if not defined earlier.
    // Let's check if modifyEdge was defined earlier. 
    // It was likely at the end. I should Keep modifyEdge.

    modifyEdge(id1, id2, action) {
        if (action === 'add') {
            const exists = this.edges.some(e =>
                (e[0] === id1 && e[1] === id2) || (e[0] === id2 && e[1] === id1)
            );
            if (!exists) {
                this.edges.push([id1, id2]);
            }
        } else if (action === 'remove') {
            this.edges = this.edges.filter(e =>
                !((e[0] === id1 && e[1] === id2) || (e[0] === id2 && e[1] === id1))
            );
        }
        this.drawEdges();
    }

    drawPlayers(players) {
        // Clear existing tokens
        const oldTokens = this.svg.querySelectorAll('.player-token');
        oldTokens.forEach(t => {
            if (!t.classList.contains('animating')) t.remove();
        });

        if (!players || players.length === 0) return;

        // 1. Pre-Count players per tile to decide layout mode
        const tileTotals = {};
        players.forEach(p => {
            const tileId = String(p.pos || '1');
            tileTotals[tileId] = (tileTotals[tileId] || 0) + 1;
        });

        // 2. Render
        const tileCurrentCount = {}; // Track how many we've drawn per tile

        players.forEach((p, index) => {
            // SKIP IF ANIMATING
            const existing = this.svg.querySelector(`.player-token[data-player-id="${p.id}"]`);
            if (existing && existing.classList.contains('animating')) return;
            if (existing) existing.remove(); // Remove old static if exists

            const tileId = String(p.pos || '1');

            // Find Position in DATA, not DOM
            const tileData = this.layoutData.tiles.find(t => String(t.id) === tileId);

            if (tileData) {
                // Base Center
                let x = tileData.x + (this.ts / 2);
                let y = tileData.y + (this.ts / 2);

                const totalOnTile = tileTotals[tileId];
                tileCurrentCount[tileId] = (tileCurrentCount[tileId] || 0) + 1;
                const idx = tileCurrentCount[tileId] - 1; // 0-based index

                // Stacking Logic: Grid Distribution if > 1 player
                if (totalOnTile > 1) {
                    const offset = 9; // Displace 9px from center
                    // 2x2 Grid Pattern:
                    // 0: Top-Left, 1: Top-Right, 2: Bot-Left, 3: Bot-Right
                    if (idx === 0) { x -= offset; y -= offset; }
                    else if (idx === 1) { x += offset; y -= offset; }
                    else if (idx === 2) { x -= offset; y += offset; }
                    else if (idx === 3) { x += offset; y += offset; }
                }

                // Create Token Group
                const tokenGroup = document.createElementNS(this.ns, 'g');
                tokenGroup.setAttribute('class', 'player-token');
                tokenGroup.setAttribute('transform', `translate(${x}, ${y})`);
                tokenGroup.setAttribute('data-player-id', p.id);

                const circle = document.createElementNS(this.ns, 'circle');
                circle.setAttribute('r', '14'); // Slightly smaller (28px)
                circle.setAttribute('fill', p.color || this.colors[index % this.colors.length]);
                circle.setAttribute('stroke', '#fff');
                circle.setAttribute('stroke-width', '2');
                circle.setAttribute('filter', 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))');
                circle.classList.add('token-body');

                const text = document.createElementNS(this.ns, 'text');
                text.textContent = (p.name || `P${index + 1}`).substring(0, 1).toUpperCase();
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'central');
                text.setAttribute('fill', '#fff');
                text.setAttribute('font-size', '13px');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('transform', 'rotate(90)'); // Rotate upright for vertical board

                tokenGroup.appendChild(circle);
                tokenGroup.appendChild(text);
                this.rootGroup.appendChild(tokenGroup);
            }
        });
    }

    animateMove(playerId, path, callback) {
        // path is Array of Tile IDs ['1', '2', '3']
        if (!path || path.length < 2) {
            if (callback) callback();
            return;
        }

        const token = this.svg.querySelector(`.player-token[data-player-id="${playerId}"]`);
        if (!token) {
            console.error("Token not found for animation:", playerId);
            if (callback) callback();
            return;
        }

        // Cancel any ongoing animation for this token
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        // ✨ ADAPTIVE SPEED: Faster for longer paths
        const pathLength = path.length - 1;
        let baseSpeed = 400;

        if (pathLength >= 6) {
            baseSpeed = 250; // Fast for long distances
        } else if (pathLength >= 3) {
            baseSpeed = 350; // Medium
        }

        console.log(`🎬 [ANIMATION] ${pathLength} steps, speed: ${baseSpeed}ms/step`);

        // ✨ PATH PREVIEW
        this.highlightPath && this.highlightPath(path);
        this.highlightDestination && this.highlightDestination(path[path.length - 1]);

        token.classList.add('animating');

        let pathIdx = 0;
        const animationId = Date.now();
        this.currentAnimationId = animationId;

        const hop = () => {
            if (this.currentAnimationId !== animationId) {
                console.log('[MOVE] Animation cancelled');
                this.clearPathHighlight && this.clearPathHighlight();
                this.clearDestinationHighlight && this.clearDestinationHighlight();
                return;
            }

            if (pathIdx >= path.length - 1) {
                // Finished
                token.classList.remove('animating');
                this.currentAnimationId = null;
                this.currentTimeout = null;
                if (callback) callback();
                return;
            }

            const nextId = String(path[pathIdx + 1]);
            pathIdx++;

            // Lookup Data
            const nextTileData = this.layoutData.tiles.find(t => String(t.id) === nextId);

            console.log(`[MOVE] Step ${pathIdx}/${path.length - 1}: Tile "${nextId}":`, nextTileData ? 'FOUND' : 'MISSING');

            if (!nextTileData) {
                console.warn(`[MOVE] Tile "${nextId}" NOT in layout! Skipping...`);
                hop(); return;
            }

            // Get target coords
            const tx = nextTileData.x + (this.ts / 2);
            const ty = nextTileData.y + (this.ts / 2);

            // ✨ SMOOTH EASING
            token.style.transition = `transform ${baseSpeed}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
            token.setAttribute('transform', `translate(${tx}, ${ty})`);

            this.currentTimeout = setTimeout(() => {
                hop();
            }, baseSpeed + 50);
        };

        // Start after brief delay to show preview
        setTimeout(() => hop(), 300);
    }

    // v7.6: Tile Inspector - Full editor inspector
    enableTileInspector() {
        console.log('%c🔧 Editor Inspector Enabled', 'color: cyan; font-weight: bold');
        console.log('Click cualquier casilla para editar sus propiedades');

        this.svg.addEventListener('click', (evt) => {
            // Only show inspector in editor mode
            if (!this.isEditorMode) return;

            // Find tile element (look for tile-group class)
            let target = evt.target;
            while (target && !target.classList.contains('tile-group')) {
                target = target.parentElement;
                if (target === this.svg) return;
            }

            if (!target) return;

            // Show full editor inspector with type dropdown
            this.openInspector(target);
        });
    }

    // v7.6: SIMPLE Tile Info Display - Works everywhere
    showSimpleTileInfo(tileGroup) {
        const id = tileGroup.getAttribute('data-id');
        const display = tileGroup.getAttribute('data-display');
        const x = tileGroup.dataset.x || 0;
        const y = tileGroup.dataset.y || 0;

        // Crear overlay si no existe
        let overlay = document.getElementById('simple-tile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'simple-tile-overlay';
            document.body.appendChild(overlay);
        }

        // Obtener posición secuencial y conexión
        const seqPos = this.getSequentialPosition ? this.getSequentialPosition(id) : '?';
        const node = this.boardGraph?.[id];
        const nextTile = node?.next;
        const isJunction = Array.isArray(nextTile);

        // HTML simple y claro
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: black;
                color: white;
                padding: 40px;
                border: 4px solid cyan;
                border-radius: 15px;
                font-family: monospace;
                font-size: 18px;
                z-index: 999999;
                min-width: 400px;
                box-shadow: 0 0 50px rgba(0,255,255,0.5);
            ">
                <h1 style="text-align:center; color:cyan; margin:0 0 30px 0; font-size:32px;">
                    CASILLA ${id}
                </h1>
                
                <div style="line-height:2.5;">
                    <div><strong style="color:yellow;">Display:</strong> ${display || id}</div>
                    <div><strong style="color:yellow;">Posición Secuencial:</strong> ${seqPos}</div>
                    <div><strong style="color:yellow;">Coordenadas:</strong> x: ${x}, y: ${y}</div>
                    <div><strong style="color:yellow;">Siguiente:</strong> ${isJunction ? nextTile.join(', ') : (nextTile || 'NINGUNO')}</div>
                    ${isJunction ? `
                        <div style="margin-top:20px; padding:15px; background:rgba(255,165,0,0.2); border:2px solid orange; border-radius:8px;">
                            <div style="color:orange; font-weight:bold; font-size:20px; margin-bottom:10px;">🔀 BIFURCACIÓN</div>
                            ${node.branchInfo?.map(b => `<div>${b.id}: ${b.label}</div>`).join('') || ''}
                        </div>
                    ` : ''}
                </div>
                
                <div style="text-align:center; margin-top:30px;">
                    <button onclick="document.getElementById('simple-tile-overlay').remove()"
                            style="
                                background: cyan;
                                color: black;
                                border: none;
                                padding: 15px 40px;
                                font-size: 20px;
                                font-weight: bold;
                                cursor: pointer;
                                border-radius: 8px;
                            ">
                        CERRAR
                    </button>
                </div>
            </div>
        `;

        console.log('📍 Tile Info:', { id, display, x, y, seqPos, next: nextTile });
    }

    // ✨ Highlight path preview
    highlightPath(path) {
        this.clearPathHighlight();
        const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pathGroup.id = 'path-preview';

        path.slice(1).forEach(tileId => {
            const tileData = this.layoutData.tiles.find(t => String(t.id) === String(tileId));
            if (!tileData) return;

            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            highlight.setAttribute('cx', tileData.x + this.ts / 2);
            highlight.setAttribute('cy', tileData.y + this.ts / 2);
            highlight.setAttribute('r', this.ts * 0.4);
            highlight.setAttribute('fill', 'rgba(255, 215, 0, 0.3)');
            highlight.setAttribute('stroke', '#FFD700');
            highlight.setAttribute('stroke-width', '2');
            pathGroup.appendChild(highlight);
        });

        this.svg.insertBefore(pathGroup, this.svg.firstChild);
    }

    clearPathHighlight() {
        const existing = this.svg.querySelector('#path-preview');
        if (existing) existing.remove();
    }

    highlightDestination(tileId) {
        this.clearDestinationHighlight();
        const tileData = this.layoutData.tiles.find(t => String(t.id) === String(tileId));
        if (!tileData) return;

        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.id = 'destination-highlight';
        pulse.setAttribute('cx', tileData.x + this.ts / 2);
        pulse.setAttribute('cy', tileData.y + this.ts / 2);
        pulse.setAttribute('r', this.ts * 0.5);
        pulse.setAttribute('fill', 'none');
        pulse.setAttribute('stroke', '#10b981');
        pulse.setAttribute('stroke-width', '3');
        pulse.setAttribute('opacity', '0.8');
        pulse.style.animation = 'destination-pulse 1s ease-in-out infinite';
        this.svg.insertBefore(pulse, this.svg.firstChild);
    }

    clearDestinationHighlight() {
        const existing = this.svg.querySelector('#destination-highlight');
        if (existing) existing.remove();
    }

    // v8.0: Render tile type icons on special tiles
    renderTileTypeIcons() {
        console.log('🎨 [TILE ICONS] Rendering tile type icons...');

        const tilesRendered = [];

        // Loop through all tiles that have special types
        for (const [tileId, typeName] of Object.entries(TILE_TYPE_MAP)) {
            const tileType = getTileType(tileId);
            if (!tileType || !tileType.icon) continue;

            // Find the tile in SVG
            const tileGroup = this.svg.querySelector(`g[data-id="${tileId}"]`);
            if (!tileGroup) {
                console.log(`  Tile ${tileId} not found in SVG`);
                continue;
            }

            // Get tile position
            const transform = tileGroup.getAttribute('transform');
            const match = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (!match) continue;

            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);

            // Create icon element - ADD TO TILE GROUP so it moves together
            const icon = document.createElementNS(this.ns, 'text');

            // Position relative to tile center (tile is 50x50)
            icon.setAttribute('x', 25);  // Center of tile
            icon.setAttribute('y', 38);  // Slightly below center
            icon.setAttribute('text-anchor', 'middle');
            icon.setAttribute('font-size', '20');
            icon.setAttribute('class', 'tile-type-icon');
            icon.setAttribute('data-tile-id', tileId);
            icon.setAttribute('pointer-events', 'none');
            icon.textContent = tileType.icon;

            // Add to tileGroup (not rootGroup) so icon moves with tile
            tileGroup.appendChild(icon);
            tilesRendered.push({ id: tileId, type: typeName, icon: tileType.icon });
        }

        console.log(`🎨 [TILE ICONS] Rendered ${tilesRendered.length} icons:`, tilesRendered);
    }

    /**
     * LAYER 2: Render building sprites on top of terrain
     * Buildings are placed strategically around the game path
     */
    renderBuildingSprites() {
        const buildingsGroup = document.createElementNS(this.ns, 'g');
        buildingsGroup.setAttribute('id', 'buildings-layer');

        // Building positions (x, y, type)
        // Types: 0=house, 1=apartment, 2=skyscraper, 3=hospital, 4=store, 5=ruins
        const buildingPlacements = [
            // Top area - safer zone
            { x: 50, y: 80, type: 0 },
            { x: 150, y: 60, type: 1 },
            { x: 280, y: 100, type: 0 },
            { x: 400, y: 50, type: 1 },
            { x: 550, y: 90, type: 3 }, // Hospital near start
            { x: 700, y: 70, type: 0 },

            // Middle area
            { x: 80, y: 300, type: 1 },
            { x: 200, y: 350, type: 2 },
            { x: 350, y: 280, type: 4 }, // Store
            { x: 500, y: 320, type: 1 },
            { x: 650, y: 300, type: 0 },
            { x: 750, y: 380, type: 2 },

            // Mid-lower area
            { x: 100, y: 550, type: 5 }, // Ruins
            { x: 250, y: 500, type: 2 },
            { x: 400, y: 580, type: 4 }, // Store
            { x: 550, y: 520, type: 1 },
            { x: 700, y: 600, type: 5 }, // Ruins

            // Lower area - danger zone
            { x: 60, y: 800, type: 5 }, // Ruins
            { x: 200, y: 750, type: 2 },
            { x: 350, y: 820, type: 5 }, // Ruins
            { x: 500, y: 780, type: 3 }, // Hospital
            { x: 650, y: 850, type: 5 }, // Ruins
            { x: 780, y: 800, type: 2 },

            // Bottom area - boss zone
            { x: 100, y: 1050, type: 5 },
            { x: 280, y: 1000, type: 5 },
            { x: 450, y: 1100, type: 5 },
            { x: 600, y: 1000, type: 5 },
            { x: 750, y: 1080, type: 5 },
        ];

        // Individual sprite file paths
        const spriteFiles = {
            0: './assets/tiles/house.png',
            1: './assets/tiles/apartment.png',
            2: './assets/tiles/skyscraper.png',
            3: './assets/tiles/hospital.png',
            4: './assets/tiles/store.png',
            5: './assets/tiles/ruins.png'
        };

        // Building sizes for each type
        const spriteSizes = {
            0: { w: 80, h: 90 },
            1: { w: 70, h: 110 },
            2: { w: 60, h: 140 },
            3: { w: 90, h: 100 },
            4: { w: 75, h: 70 },
            5: { w: 85, h: 85 }
        };

        // Render each building
        buildingPlacements.forEach((b) => {
            const building = document.createElementNS(this.ns, 'image');
            const size = spriteSizes[b.type];

            building.setAttribute('href', spriteFiles[b.type]);
            building.setAttribute('x', b.x);
            building.setAttribute('y', b.y - size.h + 40);
            building.setAttribute('width', size.w);
            building.setAttribute('height', size.h);
            building.setAttribute('opacity', '0.95');
            building.setAttribute('preserveAspectRatio', 'xMidYMax meet');

            buildingsGroup.appendChild(building);
        });

        this.rootGroup.appendChild(buildingsGroup);
        console.log('🏢 [BUILDINGS] Rendered', buildingPlacements.length, 'buildings');
    }

    /**
     * Draw grid lines to help visualize tile positions
     */
    drawGridLines() {
        const gridGroup = document.createElementNS(this.ns, 'g');
        gridGroup.setAttribute('id', 'grid-lines');
        gridGroup.setAttribute('opacity', '0.3');

        const gridSize = 50; // 50px grid
        const strokeColor = '#4a4a6a';

        // Vertical lines
        for (let x = 0; x <= this.width; x += gridSize) {
            const line = document.createElementNS(this.ns, 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', this.height);
            line.setAttribute('stroke', strokeColor);
            line.setAttribute('stroke-width', x % 100 === 0 ? '1' : '0.5');
            gridGroup.appendChild(line);
        }

        // Horizontal lines
        for (let y = 0; y <= this.height; y += gridSize) {
            const line = document.createElementNS(this.ns, 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', this.width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', strokeColor);
            line.setAttribute('stroke-width', y % 100 === 0 ? '1' : '0.5');
            gridGroup.appendChild(line);
        }

        this.rootGroup.appendChild(gridGroup);
        console.log('📐 [GRID] Rendered grid lines');
    }
}
