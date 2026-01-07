import { bus } from '../core/event-bus.js';

export function initDOMHandlers() {
    // Referencias
    const btnOffline = document.getElementById('btn-offline');
    const btnCreate = document.getElementById('btn-create-room');
    const btnJoin = document.getElementById('btn-join-room');
    const roomInput = document.getElementById('room-input');
    const btnRoll = document.querySelector('.btn-primary');

    // Handlers
    if (btnOffline) {
        btnOffline.addEventListener('click', () => {
            // Mostrar modal de jugadores
            const modal = document.getElementById('players-modal');
            if (modal) modal.classList.remove('hidden');
        });
    }

    // Player Count Selection
    document.querySelectorAll('.btn-player-count').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const count = parseInt(e.target.dataset.count);
            document.getElementById('players-modal').classList.add('hidden');
            document.getElementById('btn-offline').textContent = "⏳ Cargando...";
            bus.emit('UI_START_OFFLINE', count);
        });
    });

    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            bus.emit('UI_CREATE_ROOM');
        });
    }

    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const code = roomInput.value.trim().toUpperCase();
            if (!code) {
                alert("¡Introduce un código válido!");
                return;
            }
            bus.emit('UI_JOIN_ROOM', code);
        });
    }

    if (btnRoll) {
        btnRoll.addEventListener('click', () => {
            bus.emit('UI_ACTION_ROLL');
        });
    }
}
