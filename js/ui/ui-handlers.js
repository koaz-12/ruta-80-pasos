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
            // Hide carousel lobby elements
            const titleSection = document.querySelector('.lobby-title-section');
            const carouselContainer = document.querySelector('.mode-carousel-container');
            const carouselDots = document.querySelector('.carousel-dots');
            const playBtn = document.getElementById('btn-play-mode');
            const modeOptions = document.getElementById('mode-options');
            const lobbyFooter = document.querySelector('.lobby-footer');

            if (titleSection) titleSection.style.display = 'none';
            if (carouselContainer) carouselContainer.style.display = 'none';
            if (carouselDots) carouselDots.style.display = 'none';
            if (playBtn) playBtn.style.display = 'none';
            if (modeOptions) modeOptions.style.display = 'none';
            if (lobbyFooter) lobbyFooter.style.display = 'none';

            // Show waiting room panel
            document.getElementById('waiting-room-panel').classList.remove('hidden');
            document.getElementById('btn-start-host').disabled = true;

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
            btnCopy.textContent = "✅ Copiado!";
            setTimeout(() => btnCopy.textContent = "📋 Copiar", 2000);
        });
    }

    const btnWhatsApp = document.getElementById('btn-share-whatsapp');
    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', () => {
            const code = document.getElementById('room-code-display').textContent;
            const message = `🎮 ¡Únete a mi partida de La Ruta de los 80 Pasos!\n\n📍 Código de sala: *${code}*\n\n👉 Abre el juego y entra con este código`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const code = roomInput.value.trim().toUpperCase();
            if (!code) {
                alert("¡Introduce un código válido!");
                return;
            }

            // Hide carousel lobby elements
            const titleSection = document.querySelector('.lobby-title-section');
            const carouselContainer = document.querySelector('.mode-carousel-container');
            const carouselDots = document.querySelector('.carousel-dots');
            const playBtn = document.getElementById('btn-play-mode');
            const modeOptions = document.getElementById('mode-options');
            const lobbyFooter = document.querySelector('.lobby-footer');

            if (titleSection) titleSection.style.display = 'none';
            if (carouselContainer) carouselContainer.style.display = 'none';
            if (carouselDots) carouselDots.style.display = 'none';
            if (playBtn) playBtn.style.display = 'none';
            if (modeOptions) modeOptions.style.display = 'none';
            if (lobbyFooter) lobbyFooter.style.display = 'none';

            // Show status
            document.getElementById('status-msg').innerHTML = "⏳ Buscando sala " + code + "...";

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
