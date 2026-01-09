// SIMPLE TILE INFO - Añade esto al FINAL de svg-board-renderer.js
// ANTES de la llave de cierre de la clase }

// v7.6: SIMPLE Tile Info Display
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
