import { bus } from '../core/event-bus.js';
import { store } from '../core/game-state.js';

export class UIRenderer {
    constructor() {
        this.elements = {
            lobby: document.getElementById('lobby-screen'),
            gameHeader: document.getElementById('game-header'),
            board: document.querySelector('.board-container'),
            controls: document.querySelector('.game-controls'),
            statusMsg: document.getElementById('connection-status'),
            onlineInfo: document.getElementById('online-info'),
            headerTitle: document.querySelector('.header-stats'), // Reusing propert name but targeting stats area for turn info? No, separate
            btnRoll: document.querySelector('.btn-primary'),
            stats: document.getElementById('header-stats'),
            charModal: document.getElementById('character-modal'),
            charGrid: document.querySelector('.character-grid'),
            copyBtn: document.getElementById('btn-copy-code')
        };

        this.initListeners();
    }

    initListeners() {
        bus.on('STATE_INIT', (state) => this.showGameInterface(state));
        bus.on('STATE_UPDATED', (state) => this.updateBoard(state));
        bus.on('TURN_CHANGED', (data) => this.updateControls(data));
        bus.on('NETWORK_READY', (data) => this.updateLobbyStatus(data));
        bus.on('SHOW_CHAR_SELECT', (classes) => this.showCharSelection(classes));
        bus.on('DICE_ROLLED', (val) => this.showDiceAnimation(val));
    }

    showDiceAnimation(val) {
        const overlay = document.getElementById('dice-overlay');
        const visual = document.getElementById('dice-visual');
        const result = document.getElementById('dice-result');

        overlay.classList.remove('hidden');
        visual.style.animation = 'shake 0.5s infinite';
        result.classList.add('hidden');
        visual.textContent = '🎲';

        // Stop shaking and show result after 1s
        setTimeout(() => {
            visual.style.animation = 'none';
            visual.textContent = ''; // Hide emoji
            result.textContent = val;
            result.classList.remove('hidden');
        }, 1000);

        // Hide overlay after 2s (sync with engine delay)
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 2000);
    }

    updateLobbyStatus(data) {
        if (data.myId === 'OFFLINE_1') {
            this.elements.statusMsg.textContent = "Modo Offline Iniciado";
            return;
        }
        this.elements.statusMsg.innerHTML = `CÓDIGO DE SALA: <br><strong style="font-size:2em; color:#fff">${data.myId}</strong>`;
        this.elements.copyBtn.classList.remove('hidden');
        this.elements.copyBtn.onclick = () => {
            navigator.clipboard.writeText(data.myId);
            this.elements.copyBtn.textContent = "✅ ¡Copiado!";
            setTimeout(() => this.elements.copyBtn.textContent = "📋 Copiar Código", 2000);
        };
    }

    showGameInterface(state) {
        this.elements.lobby.classList.add('hidden');
        this.elements.gameHeader.classList.remove('hidden');
        this.elements.board.classList.remove('hidden');
        this.elements.controls.classList.remove('hidden');

        if (state.role !== 'OFFLINE') {
            this.elements.onlineInfo.classList.remove('hidden');
            this.elements.onlineInfo.textContent = state.role === 'HOST' ? '👑 Host' : '👤 Client';
        }
    }

    showCharSelection(data) {
        // Data can be array (host/legacy) or object {classes, msg} (offline hotseat)
        let classes = data;
        let msg = "Elige tu clase";

        if (!Array.isArray(data) && data.classes) {
            classes = data.classes;
            msg = data.msg;
        }

        const msgEl = document.getElementById('char-select-msg');
        if (msgEl) msgEl.textContent = msg;

        this.elements.charGrid.innerHTML = '';
        classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.innerHTML = `<h3>${cls.name}</h3><div class="char-stats">❤️ ${cls.life} | 🍗 ${cls.food}</div>`;
            card.onclick = () => bus.emit('UI_CLASS_SELECTED', cls);
            this.elements.charGrid.appendChild(card);
        });
        this.elements.charModal.classList.remove('hidden');
    }

    updateBoard(state) {
        // Limpiar tokens anteriores
        document.querySelectorAll('.player-token').forEach(el => el.remove());

        state.players.forEach((p, index) => {
            if (!p.stats) return; // Jugador no listo aún

            const targetTile = document.querySelector(`.tile[data-index="${p.pos}"]`);
            if (targetTile) {
                const token = document.createElement('div');
                token.className = 'player-token';
                token.innerHTML = index === 0 ? '👑' : '👤';
                token.style.backgroundColor = index === 0 ? '#58a6ff' : '#da3633';
                token.style.zIndex = p.id === state.myId ? 10 : 5;
                targetTile.appendChild(token);

                // Auto-scroll si es el turno actual
                if (index === state.turnIndex) {
                    token.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
        });

        // Actualizar Stats del jugador local
        // Actualizar Stats del jugador ACTIVO (Hotseat friendly)
        const activePlayer = store.getActivePlayer();
        const me = store.getPlayer(state.myId);
        // O si queremos mostrar siempre los stats de "quien soy yo" en online, o el turno en hotseat
        // En hotseat: store.myId es 'OFFLINE_1' (estático) pero queremos ver al que le toca.

        let targetForStats = me; // Default to me (online)
        if (state.role === 'OFFLINE') {
            targetForStats = activePlayer;
        }

        if (targetForStats && targetForStats.stats) {
            const isMe = (targetForStats.id === state.myId) || state.role === 'OFFLINE';
            this.elements.stats.innerHTML = `
                <span style="color:${isMe ? '#fff' : '#888'}">${targetForStats.name}</span>
                <span>❤️ ${targetForStats.stats.life}</span>
                <span>🍗 ${targetForStats.stats.food}</span>
                <span>⚔️ ${1 + targetForStats.stats.weapons}d6</span>
            `;
        }
    }

    updateControls({ turnIndex, isMyTurn }) {
        const activePlayer = store.getActivePlayer();
        if (!activePlayer) return;

        this.elements.headerTitle.textContent = `Turno de: ${activePlayer.name}`;

        // Update stats highlight if in hotseat (re-trigger render or handle here? updateBoard handles it)

        if (isMyTurn) {
            this.elements.btnRoll.disabled = false;
            this.elements.btnRoll.textContent = `🎲 TIRAR (${activePlayer.name})`;
        } else {
            this.elements.btnRoll.disabled = true;
            this.elements.btnRoll.textContent = `Esperando a ${activePlayer.name}...`;
        }
    }
}

export const ui = new UIRenderer();
