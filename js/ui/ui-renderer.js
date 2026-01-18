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
        bus.on('SHOW_NOTIFICATION', (data) => this.showNotification(data));

        // Combat events
        bus.on('COMBAT_START', (data) => this.showCombatStart(data));
        bus.on('COMBAT_ROLL', (data) => this.showCombatRoll(data));
        bus.on('COMBAT_TIE', () => this.showCombatTie());
        bus.on('COMBAT_VICTORY', (data) => this.showCombatVictory(data));
        bus.on('COMBAT_DEFEAT', (data) => this.showCombatDefeat(data));

        // Resource change floating indicator
        bus.on('RESOURCE_CHANGE', (data) => this.showFloatingIndicator(data.icon, data.amount, data.color));

        // Chat system (online only)
        bus.on('CHAT_RECEIVED', (data) => this.addChatMessage(data));
        bus.on('COMBAT_END', () => this.hideCombatModal());

        // Game over
        bus.on('GAME_OVER', (data) => this.showGameOver(data));

        // Zombie fight/retreat decision
        bus.on('SHOW_ZOMBIE_DECISION', (data) => this.showZombieDecision(data));

        // PvP events
        bus.on('SHOW_PVP_DECISION', (data) => this.showPvPDecision(data));
        bus.on('PVP_COMBAT_START', (data) => this.showPvPCombat(data));
        bus.on('PVP_COMBAT_ROLL', (data) => this.showPvPRoll(data));
        bus.on('PVP_COMBAT_END', (data) => this.hidePvPCombat(data));
        bus.on('PVP_ENCOUNTER_END', () => this.hidePvPModal());

        // Approach phase
        bus.on('SHOW_APPROACH_DECISION', (data) => this.showApproachDecision(data));

        // Market
        bus.on('SHOW_MARKET', (data) => this.showMarket(data));

        // Move choice (advance or stay)
        bus.on('SHOW_MOVE_CHOICE', (data) => this.showMoveChoice(data));

        // Hotseat turn transition
        bus.on('TURN_CHANGED', (data) => this.showTurnTransition(data));

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

            // Update bottom bar stats with animation
            const statLife = document.getElementById('stat-life');
            const statFood = document.getElementById('stat-food');
            const statWeapons = document.getElementById('stat-weapons');
            const statShield = document.getElementById('stat-shield');

            this.updateStatWithAnimation(statLife, targetForStats.stats.life);
            this.updateStatWithAnimation(statFood, targetForStats.stats.food);
            this.updateStatWithAnimation(statWeapons, targetForStats.stats.weapons || 0);
            this.updateStatWithAnimation(statShield, targetForStats.stats.shield || 0);
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
        if (!modal) {
            console.error('❌ [UI] Card modal not found!');
            return;
        }

        const cardDisplay = modal.querySelector('.card-display');
        const title = document.getElementById('card-title');
        const desc = document.getElementById('card-desc');
        const typeTitle = document.getElementById('card-type');
        const icon = document.querySelector('.card-icon');
        const btn = document.getElementById('btn-close-card');

        // Reset flip state first
        if (cardDisplay) cardDisplay.classList.remove('flipped');

        // Set content
        if (typeTitle) typeTitle.textContent = type === 'LOOT' ? "🎁 HALLAZGO" : "📜 EVENTO";
        if (icon) icon.textContent = type === 'LOOT' ? "💎" : "⚡";
        if (title) title.textContent = card.title || "Carta Desconocida";
        if (desc) desc.textContent = card.desc || "Efecto misterioso...";

        // Ensure high z-index and visibility
        modal.style.zIndex = '10001';
        modal.classList.remove('hidden');
        modal.style.display = 'flex';

        console.log(`🃏 [UI] Showing card: ${card.title} (${type})`);

        // Show floating resource change indicator
        if (card.desc) {
            this.showResourceChange(card.desc);
        }

        // Auto-flip after brief delay to show card content
        setTimeout(() => {
            if (cardDisplay) cardDisplay.classList.add('flipped');
        }, 600);

        // Close handler
        if (btn) {
            btn.onclick = () => {
                if (cardDisplay) cardDisplay.classList.remove('flipped');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                    bus.emit('UI_CARD_CLOSED');
                }, 300);
            };
        }
    }

    // Show floating resource change indicator
    showResourceChange(description) {
        // Parse description for resource changes
        const changes = [];
        if (description.includes('+1 Vida') || description.includes('+1 ❤️')) changes.push({ icon: '❤️', amount: '+1', color: '#22c55e' });
        if (description.includes('+2 Vida')) changes.push({ icon: '❤️', amount: '+2', color: '#22c55e' });
        if (description.includes('-1 Vida')) changes.push({ icon: '❤️', amount: '-1', color: '#ef4444' });
        if (description.includes('+1 Comida') || description.includes('+1 🍗')) changes.push({ icon: '🍗', amount: '+1', color: '#22c55e' });
        if (description.includes('+2 Comida')) changes.push({ icon: '🍗', amount: '+2', color: '#22c55e' });
        if (description.includes('+3 Comida')) changes.push({ icon: '🍗', amount: '+3', color: '#22c55e' });
        if (description.includes('-1 Comida')) changes.push({ icon: '🍗', amount: '-1', color: '#ef4444' });
        if (description.includes('-2 Comida')) changes.push({ icon: '🍗', amount: '-2', color: '#ef4444' });
        if (description.includes('+1 Arma')) changes.push({ icon: '⚔️', amount: '+1', color: '#22c55e' });
        if (description.includes('+2 Arma')) changes.push({ icon: '⚔️', amount: '+2', color: '#22c55e' });
        if (description.includes('-1 Arma')) changes.push({ icon: '⚔️', amount: '-1', color: '#ef4444' });
        if (description.includes('+1 Escudo')) changes.push({ icon: '🛡️', amount: '+1', color: '#22c55e' });
        if (description.includes('+2 Escudo')) changes.push({ icon: '🛡️', amount: '+2', color: '#22c55e' });
        if (description.includes('de todo')) {
            changes.push({ icon: '❤️', amount: '+1', color: '#22c55e' });
            changes.push({ icon: '🍗', amount: '+1', color: '#22c55e' });
            changes.push({ icon: '⚔️', amount: '+1', color: '#22c55e' });
        }

        // Show each change as floating indicator
        changes.forEach((change, index) => {
            setTimeout(() => {
                this.showFloatingIndicator(change.icon, change.amount, change.color);
            }, index * 300);
        });
    }

    // Show floating indicator animation
    showFloatingIndicator(icon, amount, color) {
        const indicator = document.createElement('div');
        indicator.className = 'floating-resource-indicator';
        indicator.innerHTML = `<span style="font-size: 24px;">${icon}</span> <span style="font-weight: bold;">${amount}</span>`;
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 28px;
            color: ${color};
            text-shadow: 0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.5);
            z-index: 10002;
            pointer-events: none;
            animation: floatUp 1.5s ease-out forwards;
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('float-animation-style')) {
            const style = document.createElement('style');
            style.id = 'float-animation-style';
            style.textContent = `
                @keyframes floatUp {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -70%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -150%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 1500);
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

    // ===== NOTIFICATION SYSTEM =====
    showNotification({ message, type = 'info' }) {
        // Simple toast notification
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Animate stat changes with color flash
    updateStatWithAnimation(element, newValue) {
        if (!element) return;

        const oldValue = parseInt(element.textContent) || 0;
        const numValue = parseInt(newValue) || 0;

        if (oldValue !== numValue) {
            // Flash color based on change
            const color = numValue > oldValue ? '#4ade80' : '#f87171'; // green for gain, red for loss
            element.style.transition = 'color 0.2s, transform 0.2s';
            element.style.color = color;
            element.style.transform = 'scale(1.3)';

            setTimeout(() => {
                element.style.color = '';
                element.style.transform = '';
            }, 400);
        }

        element.textContent = numValue;
    }

    // ===== COMBAT UI METHODS =====
    showCombatStart({ player, enemyCount, enemyType }) {
        const modal = document.getElementById('combat-modal');
        if (!modal) return;

        const enemyIcon = enemyType === 'zombie' ? '🧟' : '🗡️';
        const playerIcon = player.stats?.class?.icon || '👤';

        // Update combat display
        const playerDice = modal.querySelector('.player-dice');
        const enemyDice = modal.querySelector('.enemy-dice');
        const combatMsg = modal.querySelector('.combat-msg');
        const rollBtn = document.getElementById('btn-combat-roll');
        const timerDiv = document.getElementById('combat-timer');
        const countdownEl = document.getElementById('combat-countdown');

        if (playerDice) playerDice.textContent = '?';
        if (enemyDice) enemyDice.textContent = '?';
        if (combatMsg) combatMsg.textContent = `${player.name} vs ${enemyCount}x ${enemyType}`;

        // Update header
        const header = modal.querySelector('h2');
        if (header) header.innerHTML = `⚔️ COMBATE ⚔️`;

        // Disable main dice button
        const diceBtn = document.getElementById('btn-action-roll');
        if (diceBtn) diceBtn.disabled = true;

        // Show roll button and timer
        if (rollBtn) {
            rollBtn.classList.remove('hidden');
            rollBtn.disabled = false;
        }
        if (timerDiv) timerDiv.classList.remove('hidden');

        modal.classList.remove('hidden');

        // Timer countdown (20 seconds)
        let countdown = 20;
        if (countdownEl) countdownEl.textContent = countdown;

        // Store timer references to clear later
        this.combatTimerInterval = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;

            if (countdown <= 0) {
                this.clearCombatTimer();
                this.executeCombatRoll();
            }
        }, 1000);

        // Roll button click handler
        const handleRollClick = () => {
            this.clearCombatTimer();
            rollBtn?.removeEventListener('click', handleRollClick);
            this.executeCombatRoll();
        };

        rollBtn?.addEventListener('click', handleRollClick);
        this.combatRollHandler = handleRollClick; // Store for cleanup
    }

    clearCombatTimer() {
        if (this.combatTimerInterval) {
            clearInterval(this.combatTimerInterval);
            this.combatTimerInterval = null;
        }
        const timerDiv = document.getElementById('combat-timer');
        if (timerDiv) timerDiv.classList.add('hidden');

        const rollBtn = document.getElementById('btn-combat-roll');
        if (rollBtn) {
            rollBtn.classList.add('hidden');
            rollBtn.disabled = true;
        }
    }

    executeCombatRoll() {
        import('../core/combat-manager.js').then(({ combatManager }) => {
            combatManager.rollCombat();
        });
    }

    showCombatRoll({ playerRoll, enemyRoll, round }) {
        const modal = document.getElementById('combat-modal');
        if (!modal) return;

        const playerDice = modal.querySelector('.player-dice') || modal.querySelector('#player-dice');
        const enemyDice = modal.querySelector('.enemy-dice') || modal.querySelector('#enemy-dice');
        const combatMsg = modal.querySelector('.combat-msg') || modal.querySelector('#combat-msg');

        // Animate dice
        if (playerDice) {
            playerDice.textContent = playerRoll;
            playerDice.classList.add('roll-animation');
        }
        if (enemyDice) {
            enemyDice.textContent = enemyRoll;
            enemyDice.classList.add('roll-animation');
        }
        if (combatMsg) {
            combatMsg.textContent = `Ronda ${round}: ${playerRoll} vs ${enemyRoll}`;
        }

        setTimeout(() => {
            playerDice?.classList.remove('roll-animation');
            enemyDice?.classList.remove('roll-animation');
        }, 500);
    }

    showCombatTie() {
        const modal = document.getElementById('combat-modal');
        const combatMsg = modal?.querySelector('.combat-msg') || modal?.querySelector('#combat-msg');
        if (combatMsg) {
            combatMsg.textContent = '🔄 ¡Empate! Tirando de nuevo...';
        }
    }

    showCombatVictory({ player, loot }) {
        const modal = document.getElementById('combat-modal');
        const combatMsg = modal?.querySelector('.combat-msg') || modal?.querySelector('#combat-msg');

        if (combatMsg) {
            combatMsg.innerHTML = `
                <span style="color: #4ade80; font-size: 1.5rem;">✅ ¡VICTORIA!</span><br>
                <span style="font-size: 0.9rem;">🎁 Loot: ${loot.title}</span><br>
                <span style="font-size: 0.85rem; color: #888;">${loot.desc}</span>
            `;
        }

        // Show loot card with floating indicator
        setTimeout(() => {
            this.showResourceChange(loot.desc);
        }, 500);

        // Close after 3 seconds
        setTimeout(() => this.hideCombatModal(), 3000);
    }

    showCombatDefeat({ player, shieldUsed, damage }) {
        const modal = document.getElementById('combat-modal');
        const combatMsg = modal?.querySelector('.combat-msg') || modal?.querySelector('#combat-msg');

        if (combatMsg) {
            if (shieldUsed) {
                combatMsg.innerHTML = `
                    <span style="color: #60a5fa; font-size: 1.3rem;">🛡️ ¡Escudo Roto!</span><br>
                    <span style="font-size: 0.9rem;">Tu escudo absorbió el golpe</span>
                `;
                // Show shield break indicator
                this.showFloatingIndicator('🛡️', '-1', '#60a5fa');
            } else {
                combatMsg.innerHTML = `
                    <span style="color: #f87171; font-size: 1.5rem;">❌ DERROTA</span><br>
                    <span style="font-size: 0.9rem;">-1 Vida, ¡Debes retroceder!</span>
                `;
                // Show life loss indicator
                this.showFloatingIndicator('❤️', '-1', '#ef4444');
            }
        }

        // Close after 2.5 seconds
        setTimeout(() => this.hideCombatModal(), 2500);
    }

    hideCombatModal() {
        const modal = document.getElementById('combat-modal');
        if (modal) modal.classList.add('hidden');

        // Re-enable dice button
        const diceBtn = document.getElementById('btn-action-roll');
        if (diceBtn) diceBtn.disabled = false;
    }

    // Show Game Over screen
    showGameOver({ winner, reason }) {
        const modal = document.getElementById('gameover-modal');
        const title = document.getElementById('gameover-title');
        const message = document.getElementById('gameover-message');
        const statsDiv = document.getElementById('gameover-stats');
        const playAgainBtn = document.getElementById('btn-play-again');

        if (!modal) return;

        // Set content based on outcome
        if (winner) {
            // Victory!
            title.textContent = '🏆 ¡VICTORIA! 🏆';
            title.style.color = '#4ade80';
            message.textContent = `${winner.name} es el último superviviente!`;

            if (statsDiv && winner.stats) {
                statsDiv.innerHTML = `
                    <p>❤️ Vida: ${winner.stats.life}</p>
                    <p>🍗 Comida: ${winner.stats.food}</p>
                    <p>⚔️ Armas: ${winner.stats.weapons}</p>
                    <p>🛡️ Escudos: ${winner.stats.shield}</p>
                `;
            }
        } else {
            // Game Over
            title.textContent = '☠️ GAME OVER ☠️';
            title.style.color = '#f87171';

            const messages = {
                'all_dead': 'Todos los jugadores han sido eliminados',
                'player_died': 'Has sido eliminado',
                'starvation': 'Moriste de hambre',
                'combat': 'Has caído en combate'
            };
            message.textContent = messages[reason] || 'Fin del juego';

            if (statsDiv) {
                statsDiv.innerHTML = '<p style="color: #888;">Mejor suerte la próxima vez...</p>';
            }
        }

        // Play again button
        playAgainBtn?.addEventListener('click', () => {
            location.reload();
        }, { once: true });

        modal.classList.remove('hidden');
    }

    // ===== PVP UI METHODS =====
    showPvPDecision({ phase, player, opponent, options }) {
        const modal = document.getElementById('pvp-modal');
        if (!modal) return;

        const title = document.getElementById('pvp-title');
        const yourIcon = document.getElementById('pvp-your-icon');
        const yourName = document.getElementById('pvp-your-name');
        const yourStats = document.getElementById('pvp-your-stats');
        const oppIcon = document.getElementById('pvp-opp-icon');
        const oppName = document.getElementById('pvp-opp-name');
        const oppStats = document.getElementById('pvp-opp-stats');
        const message = document.getElementById('pvp-message');
        const optionsDiv = document.getElementById('pvp-options');

        // Set player info
        yourIcon.textContent = player.stats?.class?.icon || '👤';
        yourName.textContent = player.name;
        yourStats.textContent = `⚔️${player.stats?.weapons || 0} 🛡️${player.stats?.shield || 0}`;

        oppIcon.textContent = opponent.stats?.class?.icon || '👤';
        oppName.textContent = opponent.name;
        oppStats.textContent = `⚔️${opponent.stats?.weapons || 0} 🛡️${opponent.stats?.shield || 0}`;

        // Set title based on phase
        if (phase === 'defender_choice') {
            title.textContent = '⚔️ INVASORES ⚔️';
            message.textContent = `${opponent.name} ha llegado a tu casilla. ¿Qué haces?`;
        } else {
            title.textContent = '🕊️ OFERTA DE PAZ 🕊️';
            message.textContent = `${opponent.name} te ofrece paz. ¿Aceptas?`;
        }

        // Build options
        optionsDiv.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-pvp-option';
            btn.innerHTML = `<span class="pvp-opt-text">${opt.text}</span><span class="pvp-opt-desc">${opt.desc}</span>`;
            btn.onclick = () => {
                bus.emit('UI_PVP_DECISION', { playerId: player.id, decision: opt.id });
                modal.classList.add('hidden');
            };
            optionsDiv.appendChild(btn);
        });

        modal.classList.remove('hidden');
    }

    showPvPCombat({ player1, player2, isBetray }) {
        const modal = document.getElementById('pvp-combat-modal');
        if (!modal) return;

        document.getElementById('pvp-c1-name').textContent = player1.name;
        document.getElementById('pvp-c2-name').textContent = player2.name;
        document.getElementById('pvp-c1-dice').textContent = '?';
        document.getElementById('pvp-c2-dice').textContent = '?';
        document.getElementById('pvp-c1-weapons').textContent = `⚔️ ${player1.stats?.weapons || 1} dado(s)`;
        document.getElementById('pvp-c2-weapons').textContent = `⚔️ ${player2.stats?.weapons || 1} dado(s)`;
        document.getElementById('pvp-combat-msg').textContent = isBetray ? '🗡️ ¡TRAICIÓN!' : '⚔️ ¡COMBATE!';

        document.getElementById('pvp-modal')?.classList.add('hidden');
        modal.classList.remove('hidden');
    }

    showPvPRoll({ player1, roll1, diceCount1, player2, roll2, diceCount2 }) {
        const dice1 = document.getElementById('pvp-c1-dice');
        const dice2 = document.getElementById('pvp-c2-dice');
        const msg = document.getElementById('pvp-combat-msg');

        dice1.textContent = roll1;
        dice2.textContent = roll2;
        dice1.classList.add('roll-animation');
        dice2.classList.add('roll-animation');

        msg.textContent = `${roll1} (${diceCount1} 🎲) vs ${roll2} (${diceCount2} 🎲)`;

        setTimeout(() => {
            dice1.classList.remove('roll-animation');
            dice2.classList.remove('roll-animation');
        }, 500);
    }

    hidePvPCombat({ winner, loser }) {
        const msg = document.getElementById('pvp-combat-msg');
        if (msg) {
            msg.innerHTML = `<span style="color: #4ade80;">🏆 ${winner.name} GANA!</span>`;
        }

        setTimeout(() => {
            document.getElementById('pvp-combat-modal')?.classList.add('hidden');
        }, 2000);
    }

    hidePvPModal() {
        document.getElementById('pvp-modal')?.classList.add('hidden');
        document.getElementById('pvp-combat-modal')?.classList.add('hidden');
    }

    // Show approach decision - Stay or Advance
    showApproachDecision({ player, destination, rival, hasFood }) {
        const modal = document.getElementById('pvp-modal'); // Reuse PvP modal
        if (!modal) return;

        const title = document.getElementById('pvp-title');
        const yourIcon = document.getElementById('pvp-your-icon');
        const yourName = document.getElementById('pvp-your-name');
        const yourStats = document.getElementById('pvp-your-stats');
        const oppIcon = document.getElementById('pvp-opp-icon');
        const oppName = document.getElementById('pvp-opp-name');
        const oppStats = document.getElementById('pvp-opp-stats');
        const message = document.getElementById('pvp-message');
        const optionsDiv = document.getElementById('pvp-options');

        title.textContent = '⚠️ PELIGRO ADELANTE ⚠️';

        // Set player info
        yourIcon.textContent = player.stats?.class?.icon || '👤';
        yourName.textContent = player.name;
        yourStats.textContent = `🍗${player.stats?.food || 0}`;

        oppIcon.textContent = rival.stats?.class?.icon || '👤';
        oppName.textContent = rival.name;
        oppStats.textContent = `⚔️${rival.stats?.weapons || 0}`;

        message.textContent = `¡${rival.name} está en la casilla ${destination}! ¿Qué haces?`;

        // Build options
        optionsDiv.innerHTML = '';

        // Stay option (only if has food)
        const stayBtn = document.createElement('button');
        stayBtn.className = 'btn-pvp-option';
        stayBtn.innerHTML = `<span class="pvp-opt-text">🏠 Quedarse</span><span class="pvp-opt-desc">Pagar 1 comida para no moverse</span>`;
        stayBtn.onclick = () => {
            modal.classList.add('hidden');
            bus.emit('UI_APPROACH_DECISION', 'stay');
        };
        optionsDiv.appendChild(stayBtn);

        // Advance option
        const advanceBtn = document.createElement('button');
        advanceBtn.className = 'btn-pvp-option';
        advanceBtn.innerHTML = `<span class="pvp-opt-text">⚔️ Avanzar</span><span class="pvp-opt-desc">Entrar y enfrentar al rival</span>`;
        advanceBtn.onclick = () => {
            modal.classList.add('hidden');
            bus.emit('UI_APPROACH_DECISION', 'advance');
        };
        optionsDiv.appendChild(advanceBtn);

        modal.classList.remove('hidden');
    }

    // Show Market UI
    showMarket({ player }) {
        const modal = document.getElementById('market-modal');
        if (!modal) return;

        const statsDiv = document.getElementById('market-player-stats');
        const stats = player.stats;

        // Update stats display
        const updateStats = () => {
            statsDiv.innerHTML = `
                <span>❤️ ${stats.life}</span>
                <span>🍗 ${stats.food}</span>
                <span>⚔️ ${stats.weapons}</span>
                <span>🛡️ ${stats.shield}</span>
            `;
            // Update button states
            document.getElementById('market-buy-weapon').disabled = stats.food < 2 || stats.weapons >= 5;
            document.getElementById('market-sell-weapon').disabled = stats.weapons < 1 || stats.food >= 5;
            document.getElementById('market-heal').disabled = stats.food < 1 || stats.life >= 3;
            document.getElementById('market-buy-shield').disabled = stats.food < 3 || stats.shield >= 3;
        };
        updateStats();

        // Buy weapon: 2 food -> 1 weapon
        document.getElementById('market-buy-weapon').onclick = () => {
            if (stats.food >= 2 && stats.weapons < 5) {
                stats.food -= 2;
                stats.weapons++;
                updateStats();
                bus.emit('SHOW_NOTIFICATION', { message: '⚔️ Arma comprada!', type: 'success' });
            }
        };

        // Sell weapon: 1 weapon -> 2 food
        document.getElementById('market-sell-weapon').onclick = () => {
            if (stats.weapons >= 1 && stats.food < 5) {
                stats.weapons--;
                stats.food = Math.min(5, stats.food + 2);
                updateStats();
                bus.emit('SHOW_NOTIFICATION', { message: '🍗 Arma vendida!', type: 'success' });
            }
        };

        // Heal: 1 food -> 1 life
        document.getElementById('market-heal').onclick = () => {
            if (stats.food >= 1 && stats.life < 3) {
                stats.food--;
                stats.life++;
                updateStats();
                bus.emit('SHOW_NOTIFICATION', { message: '❤️ Te has curado!', type: 'success' });
            }
        };

        // Buy shield: 3 food -> 1 shield
        document.getElementById('market-buy-shield').onclick = () => {
            if (stats.food >= 3 && stats.shield < 3) {
                stats.food -= 3;
                stats.shield++;
                updateStats();
                bus.emit('SHOW_NOTIFICATION', { message: '🛡️ Escudo comprado!', type: 'success' });
            }
        };

        // Close market
        document.getElementById('btn-close-market').onclick = () => {
            // Save changes
            const players = [...window.gameStore?.state?.players || []];
            const playerData = players.find(p => p.id === player.id);
            if (playerData) {
                playerData.stats = stats;
                window.gameStore?.setPlayers?.(players);
            }
            modal.classList.add('hidden');
            bus.emit('UI_MARKET_CLOSED');
        };

        modal.classList.remove('hidden');
    }

    // Show choice to advance or stay after rolling dice
    showMoveChoice({ player, roll, hasFood }) {
        const modal = document.getElementById('pvp-modal'); // Reuse PvP modal
        if (!modal) {
            // If no modal, auto-advance
            bus.emit('UI_MOVE_CHOICE', 'advance');
            return;
        }

        const title = document.getElementById('pvp-title');
        const yourIcon = document.getElementById('pvp-your-icon');
        const yourName = document.getElementById('pvp-your-name');
        const yourStats = document.getElementById('pvp-your-stats');
        const oppIcon = document.getElementById('pvp-opp-icon');
        const oppName = document.getElementById('pvp-opp-name');
        const oppStats = document.getElementById('pvp-opp-stats');
        const message = document.getElementById('pvp-message');
        const optionsDiv = document.getElementById('pvp-options');

        title.textContent = `🎲 RESULTADO: ${roll}`;

        // Set player info
        yourIcon.textContent = player.stats?.class?.icon || '👤';
        yourName.textContent = player.name;
        yourStats.textContent = `🍗${player.stats?.food || 0}`;

        // Hide opponent side
        oppIcon.textContent = '🎯';
        oppName.textContent = `${roll} casillas`;
        oppStats.textContent = '';

        message.textContent = `¿Qué quieres hacer?`;

        // Build options
        optionsDiv.innerHTML = '';

        // Advance option
        const advanceBtn = document.createElement('button');
        advanceBtn.className = 'btn-pvp-option';
        advanceBtn.innerHTML = `<span class="pvp-opt-text">🚶 Avanzar</span><span class="pvp-opt-desc">Moverse ${roll} casillas</span>`;
        advanceBtn.onclick = () => {
            modal.classList.add('hidden');
            bus.emit('UI_MOVE_CHOICE', 'advance');
        };
        optionsDiv.appendChild(advanceBtn);

        // Stay option (only if has food)
        if (hasFood) {
            const stayBtn = document.createElement('button');
            stayBtn.className = 'btn-pvp-option';
            stayBtn.innerHTML = `<span class="pvp-opt-text">🏠 Quedarse</span><span class="pvp-opt-desc">Pagar 1 comida para no moverse</span>`;
            stayBtn.onclick = () => {
                modal.classList.add('hidden');
                bus.emit('UI_MOVE_CHOICE', 'stay');
            };
            optionsDiv.appendChild(stayBtn);
        }

        modal.classList.remove('hidden');
    }

    // Show turn transition overlay for hotseat mode
    showTurnTransition({ player, playerIndex, totalPlayers }) {
        // Create or get overlay
        let overlay = document.getElementById('turn-transition-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'turn-transition-overlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.9); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
        }

        const playerIcon = player.stats?.class?.icon || '👤';
        const playerColor = ['#4ade80', '#60a5fa', '#f472b6', '#facc15'][playerIndex % 4];

        overlay.innerHTML = `
            <div style="text-align: center; transform: scale(0.8); transition: transform 0.4s;">
                <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 0.5s ease;">${playerIcon}</div>
                <div style="font-size: 18px; color: #888; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">
                    Turno de
                </div>
                <div style="font-size: 36px; font-weight: bold; color: ${playerColor}; margin-bottom: 15px;">
                    ${player.name}
                </div>
                <div style="font-size: 14px; color: #666;">
                    Jugador ${playerIndex + 1} de ${totalPlayers}
                </div>
                <div style="margin-top: 30px; font-size: 14px; color: #888;">
                    🎲 Toca para continuar
                </div>
            </div>
        `;

        // Show with animation
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';

        // Animate content
        requestAnimationFrame(() => {
            const content = overlay.querySelector('div');
            if (content) content.style.transform = 'scale(1)';
        });

        // Click to dismiss
        const dismiss = () => {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            overlay.removeEventListener('click', dismiss);
        };

        overlay.addEventListener('click', dismiss);

        // Auto dismiss after 3 seconds
        setTimeout(dismiss, 3000);
    }

    // ===== ZOMBIE DECISION =====

    showZombieDecision({ player, enemyCount, onFight, onRetreat }) {
        // Create modal overlay
        let modal = document.getElementById('zombie-decision-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'zombie-decision-modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); z-index: 10000;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
            `;
            document.body.appendChild(modal);
        }

        const zombieEmoji = enemyCount > 1 ? '🧟🧟' : '🧟';

        modal.innerHTML = `
            <div style="text-align: center; max-width: 350px; padding: 30px;">
                <div style="font-size: 64px; margin-bottom: 20px;">${zombieEmoji}</div>
                <div style="font-size: 24px; color: #ef4444; font-weight: bold; margin-bottom: 10px;">
                    ¡ENCUENTRO ZOMBIE!
                </div>
                <div style="font-size: 16px; color: #999; margin-bottom: 30px;">
                    ${enemyCount} zombie${enemyCount > 1 ? 's' : ''} te bloquean el paso
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="zombie-fight-btn" style="
                        padding: 15px 30px; font-size: 16px; cursor: pointer;
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        border: none; border-radius: 10px; color: white;
                        font-weight: bold;
                    ">⚔️ PELEAR</button>
                    <button id="zombie-retreat-btn" style="
                        padding: 15px 30px; font-size: 16px; cursor: pointer;
                        background: linear-gradient(135deg, #6b7280, #4b5563);
                        border: none; border-radius: 10px; color: white;
                        font-weight: bold;
                    ">🏃 HUIR</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        document.getElementById('zombie-fight-btn').onclick = () => {
            modal.style.display = 'none';
            onFight();
        };

        document.getElementById('zombie-retreat-btn').onclick = () => {
            modal.style.display = 'none';
            onRetreat();
        };
    }

    // ===== CHAT SYSTEM =====

    // Initialize chat UI (called when showing game interface for online)
    initChatUI() {
        // Check if already exists
        if (document.getElementById('chat-container')) return;

        // Create chat button
        const chatBtn = document.createElement('button');
        chatBtn.id = 'chat-toggle-btn';
        chatBtn.innerHTML = '💬';
        chatBtn.style.cssText = `
            position: fixed; bottom: 20px; left: 20px;
            width: 50px; height: 50px; border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none; font-size: 24px; cursor: pointer;
            z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        `;
        chatBtn.onmouseover = () => chatBtn.style.transform = 'scale(1.1)';
        chatBtn.onmouseout = () => chatBtn.style.transform = 'scale(1)';
        chatBtn.onclick = () => this.toggleChat();
        document.body.appendChild(chatBtn);

        // Create chat panel
        const chatPanel = document.createElement('div');
        chatPanel.id = 'chat-container';
        chatPanel.style.cssText = `
            position: fixed; bottom: 80px; left: 20px;
            width: 280px; height: 350px;
            background: rgba(30,30,30,0.95); border-radius: 12px;
            z-index: 999; display: none; flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            overflow: hidden;
        `;
        chatPanel.innerHTML = `
            <div style="padding: 12px; background: #2d2d2d; border-bottom: 1px solid #444;">
                <span style="color: #fff; font-weight: bold;">💬 Chat</span>
            </div>
            <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 10px;"></div>
            <div style="padding: 10px; border-top: 1px solid #444; display: flex; gap: 8px;">
                <input id="chat-input" type="text" placeholder="Escribe un mensaje..." 
                       style="flex: 1; background: #3c3c3c; border: none; color: #fff; padding: 8px; border-radius: 6px;" />
                <button id="chat-send" style="background: #667eea; border: none; color: #fff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">➤</button>
            </div>
        `;
        document.body.appendChild(chatPanel);

        // Send message handlers
        const sendMessage = () => {
            const input = document.getElementById('chat-input');
            const msg = input.value.trim();
            if (!msg) return;

            // Get current player name
            const me = store.getPlayer(store.state.myId);
            const playerName = me?.name || 'Jugador';

            // Send via network
            import('../core/network.js').then(({ network }) => {
                network.sendChat(msg, playerName);
            });

            // Add locally
            this.addChatMessage({ message: msg, playerName, isRemote: false });
            input.value = '';
        };

        document.getElementById('chat-send').onclick = sendMessage;
        document.getElementById('chat-input').onkeypress = (e) => {
            if (e.key === 'Enter') sendMessage();
        };

        this.chatMessages = [];
    }

    toggleChat() {
        const panel = document.getElementById('chat-container');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
    }

    addChatMessage({ message, playerName, isRemote }) {
        const container = document.getElementById('chat-messages');
        if (!container) {
            // Chat not initialized, init it
            this.initChatUI();
            return this.addChatMessage({ message, playerName, isRemote });
        }

        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            margin-bottom: 8px; padding: 8px; border-radius: 8px;
            background: ${isRemote ? '#3c3c3c' : '#667eea'};
            text-align: ${isRemote ? 'left' : 'right'};
        `;
        msgDiv.innerHTML = `
            <div style="font-size: 10px; color: #888; margin-bottom: 2px;">${playerName}</div>
            <div style="color: #fff; font-size: 13px;">${message}</div>
        `;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;

        // Flash chat button if panel is closed
        const panel = document.getElementById('chat-container');
        const btn = document.getElementById('chat-toggle-btn');
        if (panel && panel.style.display === 'none' && isRemote && btn) {
            btn.style.animation = 'pulse 0.5s ease 3';
            setTimeout(() => btn.style.animation = '', 1500);
        }
    }
}

export const ui = new UIRenderer();
