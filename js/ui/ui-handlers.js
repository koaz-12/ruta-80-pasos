import { bus } from '../core/event-bus.js';

export function initDOMHandlers() {
    // Referencias
    const btnOffline = document.getElementById('btn-offline');
    const btnCreate = document.getElementById('btn-create-room');
    const btnJoin = document.getElementById('btn-join-room');
    const roomInput = document.getElementById('room-input');
    const btnRoll = document.getElementById('btn-action-roll');
    const btnBack = document.getElementById('btn-back-lobby');

    // Handlers
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (confirm("¿Seguro que quieres salir? Se perderá el progreso.")) {
                bus.emit('UI_RESET_GAME');
            }
        });
    }

    if (btnOffline) {
        btnOffline.addEventListener('click', () => {
            // Mostrar modal de jugadores
            const modal = document.getElementById('players-modal');
            if (modal) modal.classList.remove('hidden');
        });
    }

    const btnCancelOffline = document.getElementById('btn-cancel-offline');
    if (btnCancelOffline) {
        btnCancelOffline.addEventListener('click', () => {
            document.getElementById('players-modal').classList.add('hidden');
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
            // Switch UI to Waiting Room
            document.getElementById('main-menu-actions').classList.add('hidden');
            document.getElementById('waiting-room-panel').classList.remove('hidden');
            document.getElementById('btn-start-host').disabled = true; // Disable until ready? Or allow start solo online?

            bus.emit('UI_CREATE_ROOM');
        });
    }

    const btnStartHost = document.getElementById('btn-start-host');
    if (btnStartHost) {
        btnStartHost.addEventListener('click', () => {
            bus.emit('UI_HOST_START_GAME');
        });
    }

    const btnCancelWait = document.getElementById('btn-cancel-wait');
    if (btnCancelWait) {
        btnCancelWait.addEventListener('click', () => {
            // Reset game to clear connection and return to main menu
            bus.emit('UI_RESET_GAME');
        });
    }

    const btnCopy = document.getElementById('btn-copy-code');
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const code = document.getElementById('room-code-display').textContent;
            navigator.clipboard.writeText(code);
            btnCopy.textContent = "¡Copiado! ✅";
            setTimeout(() => btnCopy.textContent = "Copiar Código 📋", 2000);
        });
    }

    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const code = roomInput.value.trim().toUpperCase();
            if (!code) {
                alert("¡Introduce un código válido!");
                return;
            }
            // Switch UI for client waiting
            document.getElementById('main-menu-actions').classList.add('hidden');
            document.getElementById('status-msg').innerHTML = "Buscando sala " + code + "..."; // Legacy fallback

            bus.emit('UI_JOIN_ROOM', code);
        });
    }

    if (btnRoll) {
        btnRoll.addEventListener('click', () => {
            bus.emit('UI_ACTION_ROLL');
        });
    }

    const btnCloseCard = document.getElementById('btn-close-card');
    if (btnCloseCard) {
        btnCloseCard.addEventListener('click', () => {
            document.getElementById('card-modal').classList.add('hidden');
            bus.emit('UI_CARD_CLOSED');
        });
    }
}
