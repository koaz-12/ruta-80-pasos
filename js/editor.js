export class BoardEditor {
    constructor() {
        this.active = false;
        this.container = document.querySelector('.board-container');
        this.tiles = [];
        this.dragItem = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;

        // Multi-select state
        this.selectedItems = new Set();
        this.dragOffsets = new Map();

        this.initUI();
    }

    initUI() {
        // EDITOR UI CONTAINER
        const ui = document.createElement('div');
        Object.assign(ui.style, {
            position: 'fixed', bottom: '10px', right: '10px',
            zIndex: '10000', background: '#222', border: '1px solid #444',
            padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px',
            color: '#fff', fontFamily: 'sans-serif', width: '220px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        });

        // 1. MAIN ACTIONS
        const rowActions = document.createElement('div');
        rowActions.style.display = 'flex';
        rowActions.style.gap = '10px';

        const btnToggle = this.createBtn('🛠️ Activar Editor', () => this.toggleEditor(), true);
        const btnExport = this.createBtn('💾 Exportar', () => this.exportCSS());

        rowActions.appendChild(btnToggle);
        rowActions.appendChild(btnExport);
        ui.appendChild(rowActions);

        // 2. CLEAR BUTTON
        const btnClear = this.createBtn('🗑️ Limpiar Todo', () => this.clearBoard());
        btnClear.style.background = '#800';
        ui.appendChild(btnClear);

        // 3. SIZING CONTROLS
        ui.appendChild(this.createLabel('Tamaño Inicio:'));
        ui.appendChild(this.createSizeControl('.start-box', 100));

        ui.appendChild(this.createLabel('Tamaño Meta:'));
        ui.appendChild(this.createSizeControl('.finish-box', 100));

        ui.appendChild(this.createLabel('Tamaño Casillas:'));
        ui.appendChild(this.createSizeControl('.tile', 50));

        ui.appendChild(this.createLabel('Tamaño Conectores:'));
        ui.appendChild(this.createSizeControl('.connector-box', 80));

        // 4. ROTATION CONTROL
        ui.appendChild(this.createLabel('Rotación (Selección):'));

        const rowRot = document.createElement('div');
        rowRot.style.display = 'flex';
        rowRot.style.gap = '5px';

        const btnRotateL = this.createBtn('↺', () => this.rotateSelection(-90));
        const btnRotateR = this.createBtn('↻', () => this.rotateSelection(90));

        rowRot.appendChild(btnRotateL);
        rowRot.appendChild(btnRotateR);
        ui.appendChild(rowRot);

        // 5. INSTRUCTIONS (Small)
        const help = document.createElement('small');
        help.innerHTML = 'Tips:<br>Ctrl+Click: Multi-select<br>Teclas R/E: Rotar';
        help.style.color = '#aaa';
        ui.appendChild(help);

        document.body.appendChild(ui);

        // Bind Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.active) return;
            if (e.key.toLowerCase() === 'r') this.rotateSelection(90);
            if (e.key.toLowerCase() === 'e') this.rotateSelection(-90);
            if (e.key === 'Delete') this.clearSelection();
        });

        // PALETTE REMOVED
        // this.initPalette();

        // Bind events globally
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }

    createBtn(text, onClick, highlight = false) {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.onclick = onClick;
        Object.assign(btn.style, {
            padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
            background: highlight ? '#007bff' : '#444', color: '#fff', fontWeight: 'bold', width: '100%'
        });
        return btn;
    }

    createLabel(text) {
        const lbl = document.createElement('div');
        lbl.innerText = text;
        lbl.style.fontSize = '0.85rem';
        lbl.style.marginTop = '5px';
        return lbl;
    }

    createSizeControl(selectorOrArray, defaultSize) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '5px';

        const input = document.createElement('input');
        input.type = 'number';
        input.value = defaultSize;
        input.style.width = '60px'; // Fixed width
        input.onchange = (e) => {
            const size = e.target.value + 'px';
            const selectors = Array.isArray(selectorOrArray) ? selectorOrArray : [selectorOrArray];
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.style.width = size;
                    el.style.height = size;
                });
            });
        };

        const btnSet = document.createElement('button');
        btnSet.innerText = 'Set';
        btnSet.style.cursor = 'pointer';
        btnSet.onclick = () => input.onchange({ target: input }); // Manual trigger

        row.appendChild(input);
        row.appendChild(btnSet);
        return row;
    }

    // initPalette() REMOVED

    toggleEditor() {
        this.active = !this.active;
        if (this.active) {
            this.activate();
            document.body.classList.add('editor-active');
        } else {
            if (confirm('¿Recargar para salir?')) location.reload();
        }
    }

    activate() {
        this.hideGameUI();
        this.palette.style.display = 'flex';

        const nodes = document.querySelectorAll('.tile, .start-box, .finish-box, .connector-box');

        const sortedNodes = Array.from(nodes).sort((a, b) => {
            const idxA = parseInt(a.getAttribute('data-index')) || 0;
            const idxB = parseInt(b.getAttribute('data-index')) || 0;

            // Priority Order in Palette
            if (a.classList.contains('start-box')) return -1;
            if (b.classList.contains('start-box')) return 1;

            if (a.classList.contains('finish-box')) return 1;
            if (b.classList.contains('finish-box')) return -1;

            if (a.classList.contains('connector-box') && !b.classList.contains('connector-box')) return 1;
            if (!a.classList.contains('connector-box') && b.classList.contains('connector-box')) return -1;

            return idxA - idxB;
        });

        sortedNodes.forEach(node => {
            this.moveToPalette(node);
            node.onmousedown = (e) => this.startDrag(e, node);
        });

        document.querySelectorAll('.board-zone, .segment, .branch-container, #editor-props').forEach(el => el.style.display = 'none');
    }

    movetoBoard(node, x, y) {
        this.container.appendChild(node);
        node.style.position = 'absolute';
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.style.margin = '0';
        node.classList.remove('in-palette');
    }

    moveToPalette(node) {
        node.style.position = 'relative';
        node.style.left = 'auto';
        node.style.top = 'auto';
        node.style.margin = '0';
        node.style.transition = 'none';
        node.classList.add('in-palette');
        this.palette.appendChild(node);
    }

    clearBoard() {
        if (!confirm('¿Seguro que quieres recoger todas las fichas a la caja?')) return;
        const nodes = document.querySelectorAll('.tile, .start-box, .finish-box, .connector-box');
        nodes.forEach(node => {
            this.moveToPalette(node);
            this.selectedItems.delete(node);
            node.style.outline = 'none';
        });
    }

    startDrag(e, node) {
        if (!this.active) return;

        // MULTI-SELECT LOGIC
        if (e.ctrlKey || e.metaKey) {
            // Toggle selection
            if (this.selectedItems.has(node)) {
                this.selectedItems.delete(node);
                node.style.outline = 'none';
            } else {
                this.selectedItems.add(node);
                node.style.outline = '2px solid cyan';
            }
        } else {
            // If clicking an unselected item without Ctrl, clear others unless dragging a group
            if (!this.selectedItems.has(node)) {
                // Clear others
                this.selectedItems.forEach(el => el.style.outline = 'none');
                this.selectedItems.clear();
                // Select this one
                this.selectedItems.add(node);
                node.style.outline = '2px solid cyan';
            }
        }

        this.isDragging = true;
        this.dragItem = node; // Primary drag item (anchor)

        // Calculate offsets for ALL selected items
        this.dragOffsets.clear();
        const containerRect = this.container.getBoundingClientRect();

        this.selectedItems.forEach(item => {
            item.style.cursor = 'grabbing';
            item.style.zIndex = '999';

            // If item is in palette, we must move it to board first!
            if (item.parentElement === this.palette) {
                const rect = item.getBoundingClientRect();
                this.movetoBoard(item, rect.left - containerRect.left, rect.top - containerRect.top);
            }

            const rect = item.getBoundingClientRect();
            // Store offset relative to MOUSE
            this.dragOffsets.set(item, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        });

        e.preventDefault();
        e.stopPropagation();
    }

    onDrag(e) {
        if (!this.isDragging) return;

        const containerRect = this.container.getBoundingClientRect();

        this.selectedItems.forEach(item => {
            const offset = this.dragOffsets.get(item);
            let newLeft = e.clientX - containerRect.left - offset.x;
            let newTop = e.clientY - containerRect.top - offset.y;

            // Snap 10px
            newLeft = Math.round(newLeft / 10) * 10;
            newTop = Math.round(newTop / 10) * 10;

            item.style.left = newLeft + 'px';
            item.style.top = newTop + 'px';
        });
    }

    endDrag() {
        this.isDragging = false;
        this.selectedItems.forEach(item => item.style.cursor = 'grab');
    }

    hideGameUI() {
        const uis = ['#lobby-screen', '#game-header', '#character-modal', 'footer', '.modal-overlay'];
        uis.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = 'none';
        });
        const board = document.querySelector('.board-container');
        if (board) {
            board.classList.remove('hidden');
            board.style.display = 'block';
            board.style.background = '#222';
            board.style.height = '100vh';
            board.style.width = '100vw';
            board.style.overflow = 'hidden';
        }
    }

    exportCSS() {
        let css = '/* TABLERO GENERADO POR EDITOR */\n';
        css += '.board-container { position: relative; height: 100vh; }\n';

        // Export Sizes INDIVIDUALLY
        const start = document.querySelector('.start-box');
        if (start) css += `.start-box { width: ${start.style.width || '100px'}; height: ${start.style.height || '100px'}; }\n`;

        const finish = document.querySelector('.finish-box');
        if (finish) css += `.finish-box { width: ${finish.style.width || '100px'}; height: ${finish.style.height || '100px'}; }\n`;

        const tile = document.querySelector('.tile');
        if (tile) css += `.tile { width: ${tile.style.width || '50px'}; height: ${tile.style.height || '50px'}; }\n`;

        const conn = document.querySelector('.connector-box');
        if (conn) css += `.connector-box { width: ${conn.style.width || '80px'}; height: ${conn.style.height || '80px'}; }\n`;

        css += '.tile, .start-box, .finish-box, .connector-box { position: absolute; margin: 0; }\n\n';

        const nodes = this.container.querySelectorAll('.tile, .start-box, .finish-box, .connector-box');

        if (nodes.length === 0) {
            alert('¡No has colocado ninguna ficha en el tablero!');
            return;
        }

        nodes.forEach(node => {
            // Ignore if in palette
            if (node.parentElement !== this.container) return;

            const idx = node.getAttribute('data-index');
            const isStart = node.classList.contains('start-box');
            const isFinish = node.classList.contains('finish-box');
            const isConn = node.classList.contains('connector-box');

            const left = node.style.left;
            const top = node.style.top;
            const rot = node.dataset.rotation ? `transform: rotate(${node.dataset.rotation}deg);` : '';

            // Helper to build rule
            const rule = (sel) => `${sel} { left: ${left}; top: ${top}; ${rot} }\n`;

            if (isStart) {
                css += rule('.start-box');
            } else if (isFinish) {
                css += rule('.finish-box');
            } else if (isConn) {
                const type = node.classList.contains('split-3') ? 'split-3' : 'split-2';
                css += rule(`.connector-box.${type}`);
            } else if (idx) {
                css += rule(`.tile[data-index="${idx}"]`);
            }
        });

        navigator.clipboard.writeText(css).then(() => {
            alert(`¡CSS copiado! Pegar en el chat.`);
        });
    }
}
