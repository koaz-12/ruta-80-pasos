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
        bus.on('NETWORK_ERROR', (err) => this.showNetworkError(err));
        bus.on('LOBBY_PLAYERS_UPDATED', (players) => this.updatePlayerList(players)); // New Event
        bus.on('SHOW_CHAR_SELECT', (classes) => this.showCharSelection(classes));
        bus.on('DICE_ROLLED', (val) => this.showDiceAnimation(val));
        bus.on('STATE_RESET', () => this.resetInterface());

        bus.on('SHOW_DECISION', (data) => this.showDecisionModal(data));
        bus.on('SHOW_CARD', (data) => this.showCardModal(data));
        bus.on('START_COMBAT', (data) => this.showCombatModal(data));

        bus.on('PLAYER_MOVING', (data) => this.handlePlayerMovement(data));
    }

    resetInterface() {
        this.elements.lobby.classList.remove('hidden');
        this.elements.gameHeader.classList.add('hidden');
        this.elements.board.classList.add('hidden');
        this.elements.controls.classList.add('hidden');
        this.elements.charModal.classList.add('hidden');

        // Reset lobby visual state if needed
        this.elements.statusMsg.textContent = "Conectando...";
        this.elements.statusMsg.classList.add('hidden');
        this.elements.copyBtn.classList.add('hidden');
        document.getElementById('btn-offline').textContent = "💀 Jugar Solo (Offline)";
    }

    showDiceAnimation(val) {
        const overlay = document.getElementById('dice-overlay');
        const visual = document.getElementById('dice-visual');

        overlay.classList.remove('hidden');

        // 1. Construct 3D Cube Faces dynamically
        visual.innerHTML = '';
        visual.className = 'dice-cube rolling';
        visual.style.transform = ''; // Clear previous rotation

        // Using standard dice layout for "face-N" classes
        // 1=front, 2=right, 3=back, 4=left, 5=top, 6=bottom (My CSS logic: 1, 2, 3, 4, 5, 6 mapped differently)
        // Adjusting JS face creation to match CSS transforms:
        // .face-1 (Y=0), .face-2 (Y=90), .face-3 (Y=180), .face-4 (Y=-90), .face-5 (X=90), .face-6 (X=-90)
        // Let's map strict dice numbers to these faces randomly or sequentially?
        // Let's just put numbers 1-6 on faces 1-6 for simplicity of mapping.

        for (let i = 1; i <= 6; i++) {
            const face = document.createElement('div');
            face.className = `dice-face face-${i}`;
            face.dataset.val = i;

            // Create pips based on value
            // 1: center
            // 2: top-left, bottom-right
            // 3: top-left, center, bottom-right
            // 4: corners
            // 5: corners + center
            // 6: two columns of 3

            const pipCount = i;
            for (let p = 0; p < pipCount; p++) {
                const pip = document.createElement('span');
                pip.className = 'pip';
                face.appendChild(pip);
            }

            // Highlight the winner face if already known? No, wait for stop.
            visual.appendChild(face);
        }

        // 2. Stop and Land on Result after 1s
        setTimeout(() => {
            visual.classList.remove('rolling');

            // Calculate rotation to show face 'val' to camera (front)
            // Target: We want face 'val' to end up at rotate(0).
            // So we apply the INVERSE rotation of the face.

            let x = 0, y = 0;
            switch (val) {
                case 1: x = 0; y = 0; break;      // face-1 is at 0,0. 
                case 2: x = 0; y = -90; break;    // face-2 is at Y=90. rotateY(-90) brings it front.
                case 3: x = 0; y = -180; break;   // face-3 is at Y=180.
                case 4: x = 0; y = 90; break;     // face-4 is at Y=-90.
                case 5: x = -90; y = 0; break;    // face-5 is at X=90.
                case 6: x = 90; y = 0; break;     // face-6 is at X=-90.
            }

            // Add some noise/full spins for realism (+360 or +720) so it spins TO the result
            const extraX = 720; // 2 full spins
            const extraY = 720;

            visual.style.transform = `rotateX(${x + extraX}deg) rotateY(${y + extraY}deg)`;

        }, 800);

        // Hide overlay after 3s
        setTimeout(() => {
            overlay.classList.add('hidden');
            visual.innerHTML = ''; // Clean up

            // Update bottom bar dice display with the result
            const diceLastRoll = document.getElementById('dice-last-roll');
            if (diceLastRoll) {
                diceLastRoll.textContent = val;
            }
        }, 3000);
    }

    updateLobbyStatus(data) {
        console.log("updateLobbyStatus caled with:", data);
        if (data.myId === 'OFFLINE_1') return; // Offline doesn't use waiting room

        // Show code in new Waiting Room UI
        const codeDisplay = document.getElementById('room-code-display');
        if (codeDisplay) {
            console.log("Updating room code display to:", data.myId);
            codeDisplay.textContent = data.myId;
        }

        // Ensure waiting room is visible (for Client joining late or Host)
        document.getElementById('main-menu-actions').classList.add('hidden');
        document.getElementById('waiting-room-panel').classList.remove('hidden');

        // Call update player list with current single player (me)
        this.updatePlayerList([{ name: 'Yo (Host/Client)', id: data.myId }]);
    }

    updatePlayerList(players) {
        const list = document.getElementById('connected-players-list');
        if (!list) return;

        list.innerHTML = players.map(p => `
            <div class="player-badge" style="background:rgba(255,255,255,0.1); padding:10px; border-radius:8px; display:flex; justify-content:space-between;">
                <span>👤 ${p.name || 'Jugador'}</span>
                <span style="opacity:0.5; font-size:0.8em;">${p.id ? p.id.substr(-4) : '???'}</span>
            </div>
        `).join('');

        const count = players.length;
        document.getElementById('waiting-msg').textContent = `Esperando jugadores... (${count} conectados)`;
    }

    showNetworkError(err) {
        // Show error in the lobby status
        const codeDisplay = document.getElementById('room-code-display');
        if (codeDisplay) {
            codeDisplay.innerHTML = `<span style="color:red; font-size:1rem;">Error de Red: ${err.type || err}</span>`;
        }
        document.getElementById('waiting-msg').textContent = "Error conectando al servidor.";
        console.error("Network Error:", err);
    }

    showGameInterface(state) {
        console.log("showGameInterface called with role:", state.role);
        // If it's Online (Host/Client), we stay in Lobby until character select starts
        if (state.role !== 'OFFLINE') {
            console.log("Online mode detected. Keeping lobby visible.");
            return;
        }

        this.elements.lobby.classList.add('hidden');
        this.elements.gameHeader.classList.remove('hidden');
        this.elements.board.classList.remove('hidden');
        this.elements.controls.classList.remove('hidden');

        if (state.role !== 'OFFLINE') {
            this.elements.onlineInfo.classList.remove('hidden');
            this.elements.onlineInfo.textContent = state.role === 'HOST' ? '👑 Host' : '👤 Client';
        }

        // FORCE RENDER OF PLAYERS AT POS 1
        setTimeout(() => this.updateBoard(state), 100);
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

        // Disable dice button while selecting character
        const diceBtn = document.getElementById('btn-action-roll');
        if (diceBtn) diceBtn.disabled = true;
    }

    updateBoard(state) {
        // Draw Players on SVG Board
        if (this.boardRenderer) {
            this.boardRenderer.drawPlayers(state.players);
        } else {
            console.warn("BoardRenderer not linked to UIRenderer yet.");
        }

        // Stats Update Logic (Keep existing)
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
            // Get current position
            const position = this.boardRenderer ? this.boardRenderer.getSequentialPosition(targetForStats.pos) : targetForStats.pos;

            // Update new header elements
            const headerPlayerName = document.getElementById('header-player-name');
            const headerPosition = document.getElementById('header-position');
            const headerAvatar = document.getElementById('header-avatar');

            if (headerPlayerName) headerPlayerName.textContent = targetForStats.name || 'Jugador';
            if (headerPosition) headerPosition.textContent = position;
            if (headerAvatar && targetForStats.stats.class) {
                headerAvatar.textContent = targetForStats.stats.class.icon || '👤';
            }

            // Update bottom bar stats
            const statLife = document.getElementById('stat-life');
            const statFood = document.getElementById('stat-food');
            const statShield = document.getElementById('stat-shield');

            if (statLife) statLife.textContent = targetForStats.stats.life;
            if (statFood) statFood.textContent = targetForStats.stats.food;
            if (statShield) statShield.textContent = targetForStats.stats.weapons || 0;
        }

        // Update Tile Counter (v6.0)
        if (targetForStats && this.boardRenderer) {
            const tileDisplay = document.getElementById('current-tile');
            const statusDisplay = document.getElementById('tile-status');

            if (tileDisplay) {
                // Use sequential position instead of raw ID
                const position = this.boardRenderer.getSequentialPosition(targetForStats.pos);
                tileDisplay.textContent = position;
            }

            // Show junction status dynamically (v6.0)
            if (statusDisplay) {
                const isJunction = this.boardRenderer.isJunction(targetForStats.pos);
                if (isJunction) {
                    const junctionType = this.boardRenderer.getJunctionType(targetForStats.pos);
                    const labels = {
                        'fork3': '3 caminos',
                        'fork2': '2 caminos',
                        'loop': 'Loop / Final',
                        'multi': 'Múltiples caminos'
                    };
                    statusDisplay.textContent = `🔀 ${labels[junctionType] || 'Bifurcación'}`;
                    statusDisplay.style.display = 'block';
                } else {
                    statusDisplay.style.display = 'none';
                }
            }
        }
    }

    updateControls({ turnIndex, isMyTurn }) {
        const activePlayer = store.getActivePlayer();
        if (!activePlayer) return;

        // Update header title if element exists
        if (this.elements.headerTitle) {
            this.elements.headerTitle.textContent = `Turno de: ${activePlayer.name}`;
        }

        // Update stats highlight if in hotseat (re-trigger render or handle here? updateBoard handles it)

        if (isMyTurn) {
            this.elements.btnRoll.disabled = false;
            this.elements.btnRoll.textContent = `🎲 TIRAR (${activePlayer.name})`;
        } else {
            this.elements.btnRoll.disabled = true;
            this.elements.btnRoll.textContent = `Esperando a ${activePlayer.name}...`;
        }
    }

    showDecisionModal({ options, player }) {
        const modal = document.getElementById('decision-modal');
        const container = document.getElementById('decision-options');
        const currentTileEl = document.getElementById('decision-current-tile');
        const stepsLeftEl = document.getElementById('decision-steps-left');

        container.innerHTML = '';

        // Update contextual information
        if (currentTileEl && player) {
            currentTileEl.textContent = player.pos || '?';
        }

        // Calculate remaining steps - will be set by game engine if mid-move
        // For now, show "?" if not available
        if (stepsLeftEl) {
            const remainingSteps = player.remainingSteps !== undefined ? player.remainingSteps : '?';
            stepsLeftEl.textContent = remainingSteps;
        }

        const iconMap = {
            'Combate': '⚔️',
            'Mortal': '💀',
            'Peligroso': '⚠️',
            'Seguro': '🛡️',
            'Largo': '📏',
            'Corto': '⏱️',
            'Fácil': '✨',
            'Medio': '🎯',
            'Difícil': '🔥'
        };

        const getIcon = (hazard) => {
            for (const [key, icon] of Object.entries(iconMap)) {
                if (hazard.includes(key)) return icon;
            }
            return '🎲';
        };

        options.forEach((opt, index) => {
            const card = document.createElement('div');
            card.className = 'decision-option-card';
            card.innerHTML = `
                <div class="decision-option-icon">${getIcon(opt.hazard)}</div>
                <div class="decision-option-content">
                    <div class="decision-option-label">${opt.label}</div>
                    <div class="decision-option-desc">${opt.hazard}</div>
                </div>
                <div class="decision-option-kbd">${index + 1}</div>
            `;

            card.onclick = () => {
                modal.classList.add('hidden');
                bus.emit('UI_DECISION_MADE', opt.id);
            };

            container.appendChild(card);
        });

        // Keyboard support
        const handleKeypress = (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= options.length) {
                modal.classList.add('hidden');
                // Re-enable dice button
                const diceBtn = document.getElementById('btn-action-roll');
                if (diceBtn) diceBtn.disabled = false;

                bus.emit('UI_DECISION_MADE', options[key - 1].id);
                document.removeEventListener('keypress', handleKeypress);
            }
        };

        // Update card onclick to re-enable button too
        container.querySelectorAll('.decision-option-card').forEach(card => {
            const originalOnclick = card.onclick;
            card.onclick = () => {
                // Re-enable dice button
                const diceBtn = document.getElementById('btn-action-roll');
                if (diceBtn) diceBtn.disabled = false;

                originalOnclick();
            };
        });

        document.addEventListener('keypress', handleKeypress);

        // 🔒 DISABLE DICE BUTTON during decision
        const diceBtn = document.getElementById('btn-action-roll');
        if (diceBtn) {
            diceBtn.disabled = true;
            console.log('🔒 [DECISION] Dice button disabled');
        }

        modal.classList.remove('hidden');
    }

    showCardModal({ type, card }) {
        const modal = document.getElementById('card-modal');
        const title = document.getElementById('card-title');
        const desc = document.getElementById('card-desc');
        const typeTitle = document.getElementById('card-type');
        const icon = document.querySelector('.card-icon');
        const btn = document.getElementById('btn-close-card');

        typeTitle.textContent = type === 'LOOT' ? "HALLAZGO" : "EVENTO";
        icon.textContent = type === 'LOOT' ? "💎" : "📜";
        title.textContent = card.title || "Carta Desconocida";
        desc.textContent = card.desc || "Efecto misterioso...";

        modal.classList.remove('hidden');

        // Simple close handler
        btn.onclick = () => {
            modal.classList.add('hidden');
            bus.emit('UI_CARD_CLOSED');
        };
    }

    showCombatModal({ player, enemyLevel }) {
        const modal = document.getElementById('combat-modal');
        const pRollVal = document.getElementById('player-roll-val');
        const eRollVal = document.getElementById('enemy-roll-val');
        const msg = document.getElementById('combat-result');
        const btnRoll = document.getElementById('btn-combat-roll');
        const btnCont = document.getElementById('btn-combat-continue');

        modal.classList.remove('hidden');
        btnRoll.classList.remove('hidden');
        btnCont.classList.add('hidden');
        pRollVal.textContent = "0";
        eRollVal.textContent = "0";
        msg.textContent = `¡Enemigo Nvl ${enemyLevel}! Tira para defenderte.`;

        btnRoll.onclick = () => {
            const pRoll = Math.floor(Math.random() * 6) + 1 + (player.stats.weapons || 0); // Bonus?
            const eRoll = Math.floor(Math.random() * 6) + 1 + enemyLevel;

            pRollVal.textContent = pRoll;
            eRollVal.textContent = eRoll;

            const win = pRoll >= eRoll;
            msg.textContent = win ? "¡VICTORIA! 🎉" : "¡HERIDO! 💔 -1 Vida";
            msg.style.color = win ? '#238636' : '#da3633';

            btnRoll.classList.add('hidden');
            btnCont.classList.remove('hidden');

            btnCont.onclick = () => {
                modal.classList.add('hidden');
                bus.emit('UI_COMBAT_RESULT', { win, damage: 1 });
            };
        };
    }
    handlePlayerMovement(data) {
        if (this.boardRenderer) {
            this.boardRenderer.animateMove(data.playerId, data.path, () => {
                bus.emit('ANIMATION_COMPLETE');
            });
        } else {
            // Fallback if no renderer
            setTimeout(() => bus.emit('ANIMATION_COMPLETE'), 1000);
        }
    }
}

export const ui = new UIRenderer();
