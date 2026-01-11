import { bus } from './core/event-bus.js';
import { store } from './core/game-state.js';

export class DebugManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.forceDice = false;
        this.diceValue = 6;
        this.initUI();
        console.log('🔧 [DEBUG MANAGER] Initialized');
    }

    initUI() {
        // Buttons to open debug panel
        const btnDebugLobby = document.getElementById('btn-debug-mode'); // From lobby
        const btnDebugSettings = document.getElementById('btn-open-debug-panel'); // From settings
        const panel = document.getElementById('debug-panel');
        const btnClose = document.getElementById('btn-close-debug');

        // Settings modal
        const btnMenu = document.getElementById('btn-menu');
        const settingsModal = document.getElementById('settings-modal');
        const btnCloseSettings = document.getElementById('btn-close-settings');
        const btnReturnLobby = document.getElementById('btn-return-lobby');

        if (!panel) {
            console.warn('[DEBUG MANAGER] Debug panel element not found');
            return;
        }

        // Open settings modal from header menu button
        btnMenu?.addEventListener('click', () => {
            settingsModal?.classList.remove('hidden');
            console.log('⚙️ [SETTINGS] Modal opened');
        });

        // Close settings modal
        btnCloseSettings?.addEventListener('click', () => {
            settingsModal?.classList.add('hidden');
        });

        // Return to lobby
        btnReturnLobby?.addEventListener('click', () => {
            if (confirm('¿Volver al lobby? Se perderá el progreso de la partida.')) {
                window.location.reload();
            }
        });

        // Open debug panel from lobby
        btnDebugLobby?.addEventListener('click', () => {
            panel.classList.remove('hidden');
            this.updateGameState();
            console.log('🔧 [DEBUG] Panel opened from lobby');
        });

        // Open debug panel from settings
        btnDebugSettings?.addEventListener('click', () => {
            settingsModal?.classList.add('hidden'); // Close settings first
            panel.classList.remove('hidden');
            this.updateGameState();
            console.log('🔧 [DEBUG] Panel opened from settings');
        });

        // Close debug panel
        btnClose?.addEventListener('click', () => {
            panel.classList.add('hidden');
        });

        // Dice control
        const forceCheckbox = document.getElementById('debug-force-dice');
        forceCheckbox?.addEventListener('change', (e) => {
            this.forceDice = e.target.checked;
            console.log(`🔧 [DEBUG] Force dice: ${this.forceDice}`);
        });

        const diceInput = document.getElementById('debug-dice-value');
        diceInput?.addEventListener('input', (e) => {
            this.diceValue = parseInt(e.target.value) || 6;
            console.log(`🔧 [DEBUG] Dice value set to: ${this.diceValue}`);
        });

        // Teleport
        const btnTeleport = document.getElementById('btn-debug-teleport');
        btnTeleport?.addEventListener('click', () => {
            const pos = document.getElementById('debug-teleport-pos').value;
            this.teleportPlayer(pos);
        });

        // Test scenarios
        document.querySelectorAll('.btn-test').forEach(btn => {
            btn.addEventListener('click', () => {
                const scenario = btn.dataset.scenario;
                this.runScenario(scenario);
            });
        });

        // Update state periodically
        setInterval(() => {
            if (!panel.classList.contains('hidden')) {
                this.updateGameState();
            }
        }, 1000);
    }

    getDiceRoll() {
        if (this.forceDice) {
            console.log(`🔧 [DEBUG] Forcing dice: ${this.diceValue}`);
            return this.diceValue;
        }
        return null; // Let normal roll happen
    }

    teleportPlayer(pos) {
        const players = [...store.state.players];
        const activePlayer = players[store.state.turnIndex];
        if (activePlayer) {
            const oldPos = activePlayer.pos;
            activePlayer.pos = pos;
            store.setPlayers(players);
            console.log(`🔧 [DEBUG] Teleported from ${oldPos} to ${pos}`);
            bus.emit('STATE_UPDATE', store.state);
            this.updateGameState();
        } else {
            console.warn('[DEBUG] No active player to teleport');
        }
    }

    updateGameState() {
        const stateEl = document.getElementById('debug-game-state');
        if (!stateEl) return;

        const player = store.state.players[store.state.turnIndex];
        const state = {
            position: player?.pos || 'N/A',
            name: player?.name || 'N/A',
            pendingMove: this.gameEngine.pendingMove || null,
            pendingDirection: this.gameEngine.pendingDirection || null,
            turnIndex: store.state.turnIndex,
            isExecuting: this.gameEngine.isExecutingTurn || false,
            forceDice: this.forceDice ? this.diceValue : 'disabled'
        };

        stateEl.textContent = JSON.stringify(state, null, 2);
    }

    runScenario(scenario) {
        console.log(`🧪 [TEST SCENARIO] Running: ${scenario}`);

        const forceCheckbox = document.getElementById('debug-force-dice');
        const diceInput = document.getElementById('debug-dice-value');

        switch (scenario) {
            case 'exact-junction':
                // Teleport to 8, force dice 2 → should land exactly on 10
                this.teleportPlayer('8');
                this.forceDice = true;
                this.diceValue = 2;
                forceCheckbox.checked = true;
                diceInput.value = 2;
                console.log('✅ Setup: Position 8, forcing dice = 2');
                console.log('Expected: Land exactly on junction 10, show modal, choose path, stay at chosen tile');
                break;

            case 'mid-move-junction':
                // Teleport to 5, force dice 6 → 5+6=11, passes through 10
                this.teleportPlayer('5');
                this.forceDice = true;
                this.diceValue = 6;
                forceCheckbox.checked = true;
                diceInput.value = 6;
                console.log('✅ Setup: Position 5, forcing dice = 6');
                console.log('Expected: Move 5→6→7→8→9→10 (stop), modal, choose, continue 1 step');
                break;

            case 'start-on-junction':
                // Teleport to 10, no forced dice
                this.teleportPlayer('10');
                this.forceDice = false;
                forceCheckbox.checked = false;
                console.log('✅ Setup: Position 10 (junction)');
                console.log('Expected: Modal before rolling, choose path, roll, move in that direction');
                break;
        }

        document.getElementById('debug-panel').classList.add('hidden');
        console.log('🎮 Scenario ready - press dice button to test');
    }
}
