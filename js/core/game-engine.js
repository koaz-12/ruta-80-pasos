import { bus } from './event-bus.js';
import { store } from './game-state.js';
import { network } from './network.js';
import { buildGraph } from '../data/map-data.js';
import { CLASSES, LUCK_CARDS, EVENT_CARDS } from '../data/rpg-data.js';

export class GameEngine {
    constructor() {
        this.boardGraph = buildGraph();
        this.initListeners();
    }

    initListeners() {
        bus.on('UI_START_OFFLINE', (count) => this.startGame('OFFLINE', null, count));
        bus.on('UI_CREATE_ROOM', () => this.startGame('HOST'));
        bus.on('UI_JOIN_ROOM', (code) => this.startGame('CLIENT', code));
        bus.on('UI_HOST_START_GAME', () => this.startOnlineSession());
        bus.on('UI_LOBBY_UPDATE', (players) => {
            // UI needs to update player list
            // Since Engine handles logic, we verify here or just pass through via new event?
            // Actually, UI Renderer should handle UI_LOBBY_UPDATE if emitted from Logic
            // But UI Renderer listens to bus directly? Yes.
            // We just need to make sure UIRenderer has that listener.
            // Better: Engine emits STATE_LOBBY_UPDATED
        });

        bus.on('UI_CLASS_SELECTED', (cls) => this.handleClassSelection(cls));
        bus.on('UI_ACTION_ROLL', () => this.handleRoll());

        bus.on('UI_DECISION_MADE', (choiceId) => this.resumeTurnAfterDecision(choiceId));
        bus.on('UI_COMBAT_RESULT', (result) => this.handleCombatResult(result)); // result: {damage, win}
        bus.on('UI_CARD_CLOSED', () => this.endTurn());

        bus.on('NETWORK_CONNECTED', (data) => this.handlePlayerJoined(data));
        bus.on('NETWORK_READY', (data) => this.handleNetworkReady(data));
        bus.on('NETWORK_DATA', (data) => this.handleNetworkData(data));
        bus.on('UI_RESET_GAME', () => this.resetGame());
    }

    resetGame() {
        // Reset Logic
        location.reload(); // Hard reset for simplicity in MVP to clear PeerJS connections cleanly
    }

    startGame(role, hostId = null, playerCount = 1) {
        store.init(role, null, playerCount);
        network.init(role, hostId);

        if (role === 'OFFLINE') {
            store.state.totalPlayers = playerCount;
            store.state.playersReady = 0;
            setTimeout(() => this.askNextCharSelection(), 600);
        } else if (role === 'HOST') {
            // Do NOT start char select. Wait in lobby.
            // Setup initial player list (Host)
            store.setPlayers([{ id: store.state.myId, name: 'Anfitrión', pos: '1', stats: null }]);
        }
        // Client waits for connection then sync
    }

    askNextCharSelection() {
        // Only used in offline mode now
        const pNum = store.state.playersReady + 1;
        bus.emit('SHOW_CHAR_SELECT', { classes: CLASSES, msg: `Jugador ${pNum}: Elige tu clase` });
    }

    handleNetworkReady(data) {
        store.state.myId = data.myId;
    }

    handlePlayerJoined(data) {
        if (store.state.role === 'HOST') {
            const newPlayer = { id: data.peerId, name: 'Invitado ' + store.state.players.length, pos: '1', stats: null };
            const players = [...store.state.players, newPlayer];

            store.setPlayers(players);

            // Sync Lobby State (Update Everyone's Waiting Room)
            network.send({ type: 'LOBBY_UPDATE', players: players });

            // Update Host UI locally
            bus.emit('LOBBY_PLAYERS_UPDATED', players);
        }
    }

    handleClassSelection(cls) {
        let myId = store.state.myId;
        const role = store.state.role;

        // logic for Offline Hotseat Sequential Pick
        if (role === 'OFFLINE') {
            myId = `OFFLINE_${store.state.playersReady + 1}`;
        }

        const newStats = {
            life: cls.life,
            maxLife: 5,
            food: cls.food,
            weapons: cls.weapons,
            class: cls // Include full class info (icon, name, bonus)
        };

        if (role === 'CLIENT') {
            network.send({
                type: 'CHAR_SELECTED',
                playerId: myId,
                stats: newStats,
                className: cls.name
            });
            document.getElementById('character-modal').classList.add('hidden');
        } else {
            // HOST u OFFLINE
            const players = [...store.state.players];
            const me = players.find(p => p.id === myId);
            if (me) {
                me.stats = newStats;
                me.name = cls.name + (role === 'OFFLINE' ? ` (P${store.state.playersReady + 1})` : '');
                store.setPlayers(players);

                if (role === 'OFFLINE') {
                    store.state.playersReady++;
                    if (store.state.playersReady < store.state.totalPlayers) {
                        // Ask for next player
                        this.askNextCharSelection();
                    } else {
                        // All ready
                        document.getElementById('character-modal').classList.add('hidden');
                        store.updateTurn(0);
                    }
                } else {
                    document.getElementById('character-modal').classList.add('hidden');
                    this.syncState();
                }
            }
        }
    }

    handleRoll() {
        const state = store.state;
        // Si soy cliente y es mi turno, le digo al host que quiero moverme
        if (state.role === 'CLIENT') {
            network.send({ type: 'ACTION_MOVE', playerId: state.myId });
            return;
        }

        // Prevent double execution
        if (this.isExecutingTurn) {
            console.log('[GUARD] Turn already executing, ignoring duplicate roll');
            return;
        }

        // Si soy HOST u OFFLINE, ejecuto la lógica
        this.executeTurn(state.turnIndex);
    }

    async executeTurn(pIndex, remainingFromBranch = 0) {
        // Set guard flag
        this.isExecutingTurn = true;

        const players = [...store.state.players];
        const player = players[pIndex];

        let roll;

        // IMPORTANT: Check if player is STARTING their turn on a branch tile
        // This happens when they landed on a branch in the previous turn
        if (remainingFromBranch === 0) {
            const currentNode = this.boardGraph[player.pos];
            console.log(`[TURN START] Player ${pIndex} at pos ${player.pos}, node:`, currentNode);
            if (currentNode && Array.isArray(currentNode.next)) {
                console.log(`[JUNCTION START] Player ON junction ${player.pos}, options:`, currentNode.next);
                // Player is ON a branch - ask them to choose BEFORE rolling
                this.pendingMove = { playerIndex: pIndex, startingOnBranch: true };
                bus.emit('SHOW_DECISION', {
                    options: currentNode.branchInfo,
                    player: player
                });
                console.log('[JUNCTION START] Emitted SHOW_DECISION, waiting for choice');
                return; // Stop here, wait for resumeTurnAfterDecision
            }
        }

        // If we have remaining steps from a branch decision, use those
        if (remainingFromBranch > 0) {
            roll = remainingFromBranch;
            // No dice animation needed - already rolled
        } else {
            // 1. Roll & Animation Signal
            roll = Math.floor(Math.random() * 6) + 1;

            bus.emit('DICE_ROLLED', roll);
            network.send({ type: 'DICE_ROLLED', value: roll });

            // Wait for animation (3.5s)
            await new Promise(r => setTimeout(r, 3500));
        }

        // 2. Calculate Path step by step
        let remaining = roll;
        let currentPos = player.pos;
        const path = [currentPos];
        let branchHit = false;

        while (remaining > 0) {
            const node = this.boardGraph[currentPos];
            if (!node || !node.next) break; // End of map

            // BRANCH CHECK: If we encounter a branch, stop and ask
            if (Array.isArray(node.next)) {
                console.log(`[JUNCTION MID-MOVE] Hit junction at ${currentPos}, remaining steps: ${remaining}`);
                branchHit = true;
                // Save remaining steps for after decision
                this.pendingMove = {
                    playerIndex: pIndex,
                    remainingSteps: remaining,
                    pathSoFar: path
                };

                // First, animate movement UP TO this branch point
                if (path.length > 1) {
                    console.log("[ANIMATION] Moving to branch point:", path);
                    await this.animateMovement(player, path, players);
                }

                // Show decision UI
                console.log('[JUNCTION MID-MOVE] Showing decision, options:', node.branchInfo);
                bus.emit('SHOW_DECISION', {
                    options: node.branchInfo,
                    player: player
                });
                console.log('[JUNCTION MID-MOVE] Waiting for player choice');
                return; // Stop here, wait for decision
            }

            // Normal move
            const nextPos = node.next;
            currentPos = nextPos;
            path.push(currentPos);
            remaining--;

            if (currentPos === '80') break;
        }

        // 3. Animate full movement (if not interrupted by branch)
        if (!branchHit && path.length > 1) {
            console.log("Moving Player along path:", path);
            await this.animateMovement(player, path, players);
        }

        // 4. End turn
        this.endTurn();
    }

    // Helper for animation
    async animateMovement(player, path, players) {
        await new Promise(resolve => {
            const onComplete = () => {
                bus.off('ANIMATION_COMPLETE', onComplete);
                resolve();
            };
            bus.on('ANIMATION_COMPLETE', onComplete);
            bus.emit('PLAYER_MOVING', { playerId: player.id, path: path });
            setTimeout(onComplete, 5000 + (path.length * 500));
        });

        // Update position
        player.pos = path[path.length - 1];
        store.setPlayers(players);
        this.syncState();
    }

    resumeTurnAfterDecision(choiceId) {
        console.log(`[RESUME] Player chose: ${choiceId}`);
        const pending = this.pendingMove;
        if (!pending) {
            console.error('[RESUME] No pending move!');
            return;
        }

        const pIndex = pending.playerIndex;
        const players = [...store.state.players];
        const player = players[pIndex];
        console.log(`[RESUME] Player ${pIndex} was at ${player.pos}, moving to ${choiceId}`);

        // Move to chosen branch tile
        player.pos = choiceId;
        store.setPlayers(players);
        this.syncState();
        console.log(`[RESUME] Player updated to position: ${player.pos}`);

        // Clear pending move
        this.pendingMove = null;

        // Two scenarios:
        // 1. Player STARTED on branch: now roll dice normally
        // 2. Player HIT branch mid-move: continue with remaining steps
        if (pending.startingOnBranch) {
            console.log('[RESUME] Was starting on branch - execute new turn with dice roll');
            // Player chose path at start of turn - now execute normal turn
            this.executeTurn(pIndex);
        } else {
            // Player hit branch mid-move - continue with remaining steps (minus 1 for entering branch)
            const stepsLeft = (pending.remainingSteps || 0) - 1;
            console.log(`[RESUME] Was mid-move - continuing with ${stepsLeft} steps`);
            if (stepsLeft > 0) {
                this.executeTurn(pIndex, stepsLeft);
            } else {
                console.log('[RESUME] No steps left, ending turn');
                this.endTurn();
            }
        }
    }

    checkTileEvent(player) {
        // Tile Types from DOM (Refactor hack) or Metadata
        // Ideally we should have a `this.tileMap` with types. 
        // We will infer from DOM/Class for now to match UI state roughly, 
        // OR better: use logic based on ID ranges/map-data if possible.
        // Let's use a helper that checks DOM classes via UI or a fast map based on data.

        // Simple logic map based on ID (robust):
        // We need to know type. UIRenderer knows classes.
        // Let's rely on UIRenderer to tell us tile type? No, Logic should drive UI.
        // Let's assume standard hazard/event density or read from graph if we enriched it.
        // Graph only has structure.

        // Fallback: Check specific known ranges or random for generic tiles
        // Start/Linear is safe.
        // Checkpoints are safe.

        // Specific Logic for Demo:
        const id = player.pos;

        // Win Condition
        if (id === '80') {
            bus.emit('GAME_OVER', { winner: player });
            return;
        }

        // Detect type (Hybrid approach)
        // 4, 12, 21, 28, 38, 47, 55, 66 -> Event
        // 7, 14, 36, 44, 53, 62, 73 -> Loot
        // 13, 16, 11c, 12c, 27, 31b, 41, 51b..60b, 68, 71, 75..79 -> Hazard

        const isEvent = ['4', '12', '12b', '21', '28', '28b', '38', '47', '55', '66'].includes(id);
        const isLoot = ['7', '14', '14c', '36', '44', '53', '62', '73'].includes(id);
        const isHazard = ['13', '16', '16b', '11c', '12c', '27', '31b', '41',
            '51b', '52b', '53b', '54b', '55b', '56b', '57b', '58b', '59b', '60b',
            '68', '71', '75', '76', '77', '78', '79'].includes(id);

        if (isHazard) {
            bus.emit('START_COMBAT', { player, enemyLevel: parseInt(id) > 60 ? 2 : 1 });
            // Combat UI will emit result, which will trigger handleCombatResult via EventBus
        } else if (isEvent) {
            const card = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)]; // Need import
            bus.emit('SHOW_CARD', { type: 'EVENT', card });
            // Card UI close triggers endTurn
        } else if (isLoot) {
            const card = LUCK_CARDS[Math.floor(Math.random() * LUCK_CARDS.length)];
            bus.emit('SHOW_CARD', { type: 'LOOT', card });
            if (card.effect) card.effect(player.stats);
            store.setPlayers([...store.state.players]); // update stats
            // Card UI close triggers endTurn
        } else {
            // Normal tile
            this.endTurn();
        }
    }

    endTurn() {
        // Reset guard flag
        this.isExecutingTurn = false;

        const players = [...store.state.players];
        const nextTurn = (store.state.turnIndex + 1) % players.length;
        store.updateTurn(nextTurn);
        this.syncState();
    }

    // checkTileEvent removed (duplicate)

    handleNetworkData(data) {
        if (data.type === 'LOBBY_UPDATE') {
            store.state.players = data.players; // Sync players list
            bus.emit('LOBBY_PLAYERS_UPDATED', data.players);
            return;
        }
        if (data.type === 'GAME_START') {
            // Host started game!
            bus.emit('SHOW_CHAR_SELECT', CLASSES);
            return;
        }

        if (data.type === 'SYNC_STATE') {
            store.state.players = data.players;
            store.state.turnIndex = data.turnIndex;
            store.setPlayers(data.players);
            store.updateTurn(data.turnIndex);
        } else if (data.type === 'ACTION_MOVE') {
            if (store.state.role === 'HOST') {
                const pIndex = store.state.players.findIndex(p => p.id === data.playerId);
                if (pIndex !== -1) this.executeTurn(pIndex);
            }
        } else if (data.type === 'DICE_ROLLED') {
            bus.emit('DICE_ROLLED', data.value);
        } else if (data.type === 'CHAR_SELECTED') {
            if (store.state.role === 'HOST') {
                const players = [...store.state.players];
                const p = players.find(p => p.id === data.playerId);
                if (p) {
                    p.stats = data.stats;
                    p.name = data.className;
                    // Dont sync yet, just update local until everyone ready?
                    // Actually we need to sync names so everyone sees who picked what?
                    store.setPlayers(players);

                    // Si todos están listos (stats != null)
                    if (players.every(pl => pl.stats)) {
                        this.syncState();
                    }
                }
            }
        }
    }

    startOnlineSession() {
        // Trigger char select for everyone
        network.send({ type: 'GAME_START' });
        bus.emit('SHOW_CHAR_SELECT', CLASSES);
    }

    syncState() {
        if (store.state.role === 'HOST') {
            network.send({
                type: 'SYNC_STATE',
                players: store.state.players,
                turnIndex: store.state.turnIndex
            });
        }
    }
}

export const engine = new GameEngine();
