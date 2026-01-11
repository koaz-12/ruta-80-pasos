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
            // The following block is from the user's provided "Code Edit"
            // Assuming 'ov' in the user's snippet refers to 'tooltip'
            // And assuming 'disp', 'x', 'y' are meant to be derived from 'dataDisplay' and element position
            // For simplicity and to match the original structure, I'll use dataDisplay directly.
            // The user's snippet also implies a different styling and structure for the tooltip content.
            // I will integrate the user's provided HTML structure for the tooltip content.
            const disp = dataDisplay || dataId; // Assuming 'disp' is dataDisplay
            const rect = el.getBoundingClientRect();
            const x = rect.left + window.scrollX;
            const y = rect.top + window.scrollY;

            tooltip.innerHTML = `
                    <div style="position:fixed; top:10px; left:10px;
                               background:black; color:white; padding:20px; border:3px solid cyan;
                               border-radius:10px; font-family:monospace; font-size:14px; z-index:999999;
                               min-width:250px; box-shadow:0 0 30px rgba(0,255,255,0.5);">
                        <h2 style="text-align:center; color:cyan; margin:0 0 15px 0; font-size:20px;">CASILLA ${dataId}</h2>
                        <div style="line-height:1.8;">
                            <div><b style="color:yellow;">ID:</b> ${dataId}</div>
                            <div><b style="color:yellow;">Display:</b> ${disp}</div>
                            <div><b style="color:yellow;">X:</b> ${x}</div>
                            <div><b style="color:yellow;">Y:</b> ${y}</div>
                        </div>
                        <div style="text-align:center; margin-top:15px;">
                            <button onclick="document.getElementById('simple-inspector').style.display='none'"
                                    style="background:cyan; color:black; border:none; padding:10px 25px;
                                           font-size:14px; font-weight:bold; cursor:pointer; border-radius:5px;">
                                CERRAR
                            </button>
                        </div>
                    </div>
                `;
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
