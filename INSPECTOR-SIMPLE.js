// ═══════════════════════════════════════════════════════
// INSPECTOR SIMPLE - Pega esto en la consola (F12)
// ═══════════════════════════════════════════════════════

console.clear();
console.log('%c🔍 ACTIVANDO INSPECTOR SIMPLE', 'color: cyan; font-size: 16px; font-weight: bold');

// Crear tooltip
let tooltip = document.getElementById('simple-inspector');
if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'simple-inspector';
    tooltip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: black;
        color: white;
        padding: 30px;
        border: 3px solid cyan;
        border-radius: 10px;
        font-family: monospace;
        font-size: 16px;
        z-index: 999999;
        display: none;
        min-width: 400px;
    `;
    document.body.appendChild(tooltip);
}

// Detectar clicks
document.addEventListener('click', function (e) {
    console.log('Click en:', e.target);

    // Buscar el grupo de la casilla
    let el = e.target;
    let found = false;

    for (let i = 0; i < 10; i++) {
        if (!el) break;

        const dataId = el.getAttribute('data-id');
        const dataDisplay = el.getAttribute('data-display');

        if (dataId) {
            found = true;

            // Mostrar info
            const html = `
                <div style="text-align:center; margin-bottom:20px;">
                    <h1 style="color:cyan; margin:0;">CASILLA ${dataId}</h1>
                </div>
                <div style="line-height:2;">
                    <div><b>ID:</b> ${dataId}</div>
                    <div><b>Display:</b> ${dataDisplay || dataId}</div>
                    <div><b>Elemento:</b> ${el.tagName}</div>
                </div>
                <div style="text-align:center; margin-top:20px;">
                    <button onclick="document.getElementById('simple-inspector').style.display='none'"
                            style="background:cyan; color:black; border:none; padding:15px 30px; 
                                   font-size:18px; font-weight:bold; cursor:pointer; border-radius:5px;">
                        CERRAR
                    </button>
                </div>
            `;

            tooltip.innerHTML = html;
            tooltip.style.display = 'block';

            console.log('%c━━━━━ CASILLA ━━━━━', 'color:yellow; font-weight:bold');
            console.log('ID:', dataId);
            console.log('Display:', dataDisplay);
            console.log('Elemento completo:', el);

            break;
        }

        el = el.parentElement;
    }

    if (!found) {
        console.log('⚠️ No se encontró casilla en este click');
    }
});

console.log('%c✅ INSPECTOR ACTIVADO - HAZ CLICK EN CUALQUIER CASILLA', 'color:lime; font-size:14px; font-weight:bold');
