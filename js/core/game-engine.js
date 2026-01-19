import { bus } from './event-bus.js';
import { store } from './game-state.js';
import { network } from './network.js';
import { buildGraph } from '../data/map-data.js';
import { CLASSES, LUCK_CARDS, EVENT_CARDS } from '../data/rpg-data.js';
import { tileEventManager } from './tile-event-manager.js';
import { pvpManager } from './pvp-manager.js';

export class GameEngine {
    constructor() {
        this.boardGraph = buildGraph();

        // DEBUG: Verify junctions are loaded
        console.log('🗺️ [BOARD GRAPH] Junctions loaded:');
        console.log('  Junction 10:', this.boardGraph['10']);
        console.log('  Junction 26:', this.boardGraph['26']);
        console.log('  Junction 50:', this.boardGraph['50']);
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

        // Combat defeat - handle retreat
        bus.on('COMBAT_DEFEAT', (data) => this.handleCombatDefeat(data));

        // Player death
        bus.on('PLAYER_DIED', (data) => this.handlePlayerDeath(data));

        // PvP events
        bus.on('UI_PVP_DECISION', (data) => pvpManager.handleDecision(data.playerId, data.decision));
        bus.on('PVP_ENCOUNTER_END', () => this.onPvPEncounterEnd());

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
            shield: cls.shield || 0,
            turnCounter: 0, // For hunger system (consume food every 3 turns)
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
            // Enable dice button after all players selected
            const diceBtn = document.getElementById('btn-action-roll');
            if (diceBtn) diceBtn.disabled = false;
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
                        // Enable dice button after all players selected
                        const diceBtn = document.getElementById('btn-action-roll');
                        if (diceBtn) diceBtn.disabled = false;
                        store.updateTurn(0);
                    }
                } else {
                    document.getElementById('character-modal').classList.add('hidden');
                    // Enable dice button
                    const diceBtn = document.getElementById('btn-action-roll');
                    if (diceBtn) diceBtn.disabled = false;
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

        // 🔒 PREVENT ROLL DURING PENDING DECISION
        if (this.pendingMove) {
            console.warn('⚠️ [GUARD] Cannot roll dice - waiting for branch decision');
            return;
        }

        // Prevent double execution
        if (this.isExecutingTurn) {
            console.log('[GUARD] Turn already executing, ignoring duplicate roll');
            return;
        }

        // Reset endTurn guard for this new turn
        this.endingTurn = false;

        // Si soy HOST u OFFLINE, ejecuto la lógica
        this.executeTurn(state.turnIndex);
    }

    async executeTurn(pIndex, remainingFromBranch = 0) {
        console.log(`\n═══ [EXECUTE TURN] Player ${pIndex} ═══`);
        console.log(`  From: ${this.boardGraph[store.state.players[pIndex].pos] ? store.state.players[pIndex].pos : 'unknown'}`);
        console.log(`  Remaining from branch: ${remainingFromBranch}`);
        console.log(`  Pending direction: ${this.pendingDirection || 'none'}`);
        console.log(`  Pending move: ${this.pendingMove ? 'exists' : 'none'}`);

        // GUARD: Prevent re-entry while processing
        if (this.isExecutingTurn && remainingFromBranch === 0) {
            console.warn('⚠️ [GUARD] Already executing turn, ignoring duplicate call');
            return;
        }

        // Set guard flag
        this.isExecutingTurn = true;

        const players = [...store.state.players];
        const player = players[pIndex];

        // Skip dead players
        if (player.isDead) {
            console.log(`☠️ [SKIP] ${player.name} is dead, skipping turn`);
            this.isExecutingTurn = false;
            this.endTurn();
            return;
        }

        // Clear retreat immunity at start of new turn
        if (player.immuneToTileEffect) {
            console.log(`🛡️ [IMMUNITY] Clearing retreat immunity for ${player.name}`);
            player.immuneToTileEffect = false;
            store.setPlayers(players);
        }

        let roll;

        // IMPORTANT: Check if player is STARTING their turn on a branch tile
        // This happens when they landed on a branch in the previous turn
        if (remainingFromBranch === 0 && !this.pendingDirection) {
            const currentNode = this.boardGraph[player.pos];
            console.log(`[BRANCH-CHECK-START] At pos ${player.pos}, is branch: ${Array.isArray(currentNode?.next)}`);

            if (currentNode && Array.isArray(currentNode.next)) {
                console.log(`🔀 [JUNCTION START] Player ON junction ${player.pos}`);
                console.log(`  Options: ${currentNode.next.join(', ')}`);

                // Player is ON a branch - ask them to choose BEFORE rolling
                // But only if we haven't already asked (no pendingMove)
                if (!this.pendingMove) {
                    this.pendingMove = { playerIndex: pIndex, startingOnBranch: true };
                    console.log(`📋 [PENDING MOVE] Set: startingOnBranch=true`);

                    bus.emit('SHOW_DECISION', {
                        options: currentNode.branchInfo,
                        player: player
                    });
                    console.log('✅ [JUNCTION START] Emitted SHOW_DECISION, waiting for choice');
                    return; // Stop here, wait for resumeTurnAfterDecision
                } else {
                    console.warn('⚠️ [GUARD] pendingMove already exists, skipping decision modal');
                }
            }
        }

        // If we have remaining steps from a branch decision, use those
        if (remainingFromBranch > 0) {
            roll = remainingFromBranch;
            console.log(`🎲 [ROLL] Using remaining steps: ${roll}`);
            // No dice animation needed - already rolled
        } else {
            // 1. Roll & Animation Signal
            // Check if debug manager wants to force dice
            if (window.debugManager) {
                const forcedRoll = window.debugManager.getDiceRoll();
                if (forcedRoll !== null) {
                    roll = forcedRoll;
                    console.log(`🔧 [DEBUG] Using forced dice: ${roll}`);
                } else {
                    roll = Math.floor(Math.random() * 6) + 1;
                }
            } else {
                roll = Math.floor(Math.random() * 6) + 1;
            }

            console.log(`🎲 [ROLL] Dice result: ${roll}`);
            console.log(`  Current position BEFORE move: ${player.pos}`);
            console.log(`  Target position: ${player.pos} + ${roll} steps`);

            bus.emit('DICE_ROLLED', roll);
            network.send({ type: 'DICE_ROLLED', value: roll });

            // Wait for dice animation (3.5s)
            await new Promise(r => setTimeout(r, 3500));

            // === NEW: Ask player if they want to advance or stay ===
            if (player.stats.food > 0) {
                const shouldAdvance = await new Promise(resolve => {
                    bus.emit('SHOW_MOVE_CHOICE', {
                        player,
                        roll,
                        hasFood: player.stats.food > 0
                    });

                    const onDecision = (decision) => {
                        bus.off('UI_MOVE_CHOICE', onDecision);
                        resolve(decision === 'advance');
                    };
                    bus.on('UI_MOVE_CHOICE', onDecision);
                });

                if (!shouldAdvance) {
                    // Player chose to stay - consume 1 food
                    console.log(`🏠 [STAY] ${player.name} chose to stay (-1 food)`);
                    player.stats.food--;
                    store.setPlayers(players);

                    bus.emit('SHOW_NOTIFICATION', {
                        message: `${player.name} se queda en su lugar (-1 comida)`,
                        type: 'warning'
                    });

                    this.isExecutingTurn = false;
                    this.endTurn();
                    return;
                }
                console.log(`🚶 [ADVANCE] ${player.name} chose to advance`);
            }
        }

        // 2. Calculate Path step by step
        let remaining = roll;
        let currentPos = player.pos;
        const path = [currentPos];
        let branchHit = false;

        while (remaining > 0) {
            const node = this.boardGraph[currentPos];
            if (!node || !node.next) break; // End of map

            let nextPos;

            // Check if player has a pending direction (from branch choice)
            if (this.pendingDirection && Array.isArray(node.next)) {
                // Validate that pendingDirection is a valid option for THIS junction
                if (node.next.includes(this.pendingDirection)) {
                    console.log(`✅ [BRANCH MOVE] Using chosen direction: ${this.pendingDirection}`);
                    nextPos = this.pendingDirection;
                    this.pendingDirection = null; // Clear after using
                } else {
                    // Invalid direction for this junction - clear it and show decision
                    console.warn(`⚠️ [BRANCH] Invalid pendingDirection ${this.pendingDirection} for junction ${currentPos}. Options: ${node.next.join(', ')}`);
                    this.pendingDirection = null;
                    nextPos = null; // Will trigger branch decision below
                }
            }

            // Show branch decision if we're at a branch and don't have a valid next position
            if (!nextPos && Array.isArray(node.next)) {
                // BRANCH CHECK: If we encounter a NEW branch, ask for choice then continue
                // Calculate actual remaining steps: total roll - steps taken to get here
                const stepsTaken = path.length - 1; // -1 because path includes starting position
                const stepsRemaining = roll - stepsTaken;

                console.log(`\n🔀 [JUNCTION MID-MOVE] Hit junction at ${currentPos}`);
                console.log(`  Roll: ${roll}`);
                console.log(`  Steps taken: ${stepsTaken}`);
                console.log(`  Steps remaining: ${stepsRemaining}`);
                console.log(`  Path so far: ${path.join(' → ')}`);

                branchHit = true;

                // Save remaining steps for after decision
                this.pendingMove = {
                    playerIndex: pIndex,
                    remainingSteps: stepsRemaining,
                    pathSoFar: path
                };
                console.log(`📋 [PENDING MOVE] Set: remainingSteps=${stepsRemaining}`);

                // Animate movement UP TO this branch point
                if (path.length > 1) {
                    console.log("🎬 [ANIMATION] Moving to branch point:", path);
                    await this.animateMovement(player, path, players);
                }

                // Show decision UI
                console.log('[JUNCTION MID-MOVE] Showing decision');
                bus.emit('SHOW_DECISION', {
                    options: this.boardGraph[currentPos].branchInfo,
                    player: player
                });
                return; // Wait for decision
            } else {
                // Normal single path
                nextPos = node.next;
            }

            currentPos = nextPos;
            path.push(currentPos);
            remaining--;

            if (currentPos === '80') break;
        }

        // 3. APPROACH PHASE - Check if destination has rival
        if (!branchHit && path.length > 1) {
            const finalPos = path[path.length - 1];
            const rivalsAtDestination = players.filter(p =>
                String(p.pos) === String(finalPos) &&
                p.id !== player.id &&
                !p.isDead
            );

            if (rivalsAtDestination.length > 0 && player.stats.food > 0) {
                // Offer choice: Stay (pay 1 food) or Advance
                console.log(`🚧 [APPROACH] Rival at destination! Showing choice...`);

                const shouldStay = await new Promise(resolve => {
                    bus.emit('SHOW_APPROACH_DECISION', {
                        player,
                        destination: finalPos,
                        rival: rivalsAtDestination[0],
                        hasFood: player.stats.food > 0
                    });

                    const onDecision = (decision) => {
                        bus.off('UI_APPROACH_DECISION', onDecision);
                        resolve(decision === 'stay');
                    };
                    bus.on('UI_APPROACH_DECISION', onDecision);
                });

                if (shouldStay) {
                    // Player chose to stay - pay 1 food and don't move
                    console.log(`🏠 [APPROACH] Player chose to stay (-1 food)`);
                    player.stats.food--;
                    store.setPlayers(players);

                    bus.emit('SHOW_NOTIFICATION', {
                        message: `${player.name} se queda (-1 comida)`,
                        type: 'warning'
                    });

                    this.isExecutingTurn = false;
                    this.endTurn();
                    return;
                }
                // Otherwise continue with movement
                console.log(`⚔️ [APPROACH] Player chose to advance!`);
            } else if (rivalsAtDestination.length > 0 && player.stats.food === 0) {
                // No food - forced to advance
                console.log(`⚠️ [APPROACH] No food! Forced to advance into rival territory!`);
                bus.emit('SHOW_NOTIFICATION', {
                    message: `¡Sin comida! Debes avanzar...`,
                    type: 'danger'
                });
            }
        }

        // 4. Animate full movement (if not interrupted by branch)
        if (!branchHit && path.length > 1) {
            console.log("Moving Player along path:", path);
            await this.animateMovement(player, path, players);

            // 4. Check for other players on this tile (PvP)
            const finalPos = path[path.length - 1];
            console.log(`📍 [TILE CHECK] Checking at tile ${finalPos}`);

            // Check PvP first - if there's an encounter, wait for it to complete
            const hasPvPEncounter = pvpManager.checkPvPEncounter(player, finalPos);

            if (hasPvPEncounter) {
                console.log('⚔️ [PVP] Waiting for encounter to resolve...');
                // PVP encounter started - onPvPEncounterEnd will handle ending the turn
                // Don't continue with tile events since PVP IS the tile event
                return;
            }

            // Wait a moment after arriving at tile before showing event
            console.log('⏳ [TILE EVENT] Waiting 1.5s before checking tile event...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('✅ [TILE EVENT] Delay complete, proceeding to check tile event');

            // 5. Check tile event (only if no PvP or after PvP resolved)
            try {
                await new Promise(resolve => {
                    let completed = false;
                    const onEventComplete = () => {
                        if (completed) return;
                        completed = true;
                        bus.off('TILE_EVENT_COMPLETE', onEventComplete);
                        resolve();
                    };
                    bus.on('TILE_EVENT_COMPLETE', onEventComplete);

                    // Fallback timeout in case event never completes (30s for combat scenarios)
                    setTimeout(() => {
                        if (!completed) {
                            console.warn('⚠️ [TILE EVENT] Timeout - forcing completion');
                            onEventComplete();
                        }
                    }, 30000);

                    try {
                        console.log(`🎯 [TILE EVENT] Calling checkTileEvent for tile ${finalPos}`);
                        tileEventManager.checkTileEvent(player, finalPos);
                    } catch (err) {
                        console.error('❌ [TILE EVENT] Error:', err);
                        onEventComplete();
                    }
                });
            } catch (err) {
                console.error('❌ [TILE EVENT] Promise error:', err);
            }

            // 5. Check for victory (reached tile 80)
            if (finalPos === '80') {
                console.log(`🏆 [VICTORY] ${player.name} reached the finish line!`);
                bus.emit('SHOW_NOTIFICATION', {
                    message: `🏆 ${player.name} ha llegado a la META!`,
                    type: 'success'
                });
                bus.emit('GAME_OVER', { winner: player, reason: 'reached_goal' });
                return; // Don't end turn normally
            }
        }

        // 6. End turn
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

        // Update position (save previous for zombie retreat)
        const oldPos = player.pos;
        player.previousPosition = oldPos; // Save for potential retreat
        player.pos = path[path.length - 1];
        console.log(`📍 [POSITION UPDATE] ${oldPos} → ${player.pos}`);
        console.log(`  Path taken: ${path.join(' → ')}`);

        store.setPlayers(players);
        this.syncState();
    }

    resumeTurnAfterDecision(choiceId) {
        console.log(`\n🎯 [RESUME TURN] Player chose: ${choiceId}`);

        const pending = this.pendingMove;
        if (!pending) {
            console.error('❌ [ERROR] resumeTurnAfterDecision called without pendingMove!');
            console.error('  This should never happen. Check for duplicate calls.');
            return;
        }

        console.log(`📋 [PENDING MOVE] Data:`, pending);

        const pIndex = pending.playerIndex;
        const players = [...store.state.players];
        const player = players[pIndex];

        // Clear pending move
        this.pendingMove = null;

        // Reset execution guard
        this.isExecutingTurn = false;

        // Two scenarios:
        // 1. Player STARTED on branch: store direction and roll dice
        // 2. Player HIT branch mid-move: continue with remaining steps in chosen direction

        if (pending.startingOnBranch) {
            console.log('[RESUME] Started on branch - will roll and move in chosen direction');
            this.pendingDirection = choiceId;
            this.executeTurn(pIndex);
        } else {
            // Mid-move branch - continue with remaining steps
            console.log(`✅ [SCENARIO 2] Mid-move branch - continuing with remaining steps`);
            const stepsLeft = pending.remainingSteps || 0;
            console.log(`[RESUME] Mid-move branch - continuing with ${stepsLeft} steps towards ${choiceId}`);

            if (stepsLeft > 0) {
                console.log(`  Steps left: ${stepsLeft}`);
                console.log(`  Building path from ${player.pos} via ${choiceId}`);

                // Build path starting from chosen branch
                const path = [player.pos, choiceId];
                let currentPos = choiceId;
                let remaining = stepsLeft - 1; // -1 because first step goes to choiceId

                while (remaining > 0) {
                    const node = this.boardGraph[currentPos];
                    if (!node || !node.next) break;

                    // If we hit another branch, stop here
                    if (Array.isArray(node.next)) {
                        console.log(`[RESUME] Hit another junction at ${currentPos}`);
                        break;
                    }

                    currentPos = node.next;
                    path.push(currentPos);
                    remaining--;

                    if (currentPos === '80') break;
                }

                console.log('[RESUME] Continuing path:', path);

                // Animate and then check tile events (was missing!)
                this.animateMovement(player, path, players).then(async () => {
                    const finalPos = path[path.length - 1];

                    // Check for victory
                    if (finalPos === '80') {
                        console.log(`🏆 [VICTORY] ${player.name} reached the finish line!`);
                        bus.emit('SHOW_NOTIFICATION', {
                            message: `🏆 ${player.name} ha llegado a la META!`,
                            type: 'success'
                        });
                        bus.emit('GAME_OVER', { winner: player, reason: 'reached_goal' });
                        return;
                    }

                    // Check PVP
                    const hasPvPEncounter = pvpManager.checkPvPEncounter(player, finalPos);
                    if (hasPvPEncounter) {
                        return; // PVP will handle ending the turn
                    }

                    // Wait a moment after arriving at tile before showing event
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Check tile event (market, zombie, luck, event)
                    await new Promise(resolve => {
                        const onEventComplete = () => {
                            bus.off('TILE_EVENT_COMPLETE', onEventComplete);
                            resolve();
                        };
                        bus.on('TILE_EVENT_COMPLETE', onEventComplete);
                        tileEventManager.checkTileEvent(player, finalPos);
                    });

                    this.endTurn();
                });
            } else {
                // No steps left after choosing
                console.log('⏹️ [RESUME] No steps left - ending turn at branch');
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
        // Guard against multiple calls in the same turn
        if (this.endingTurn) {
            console.warn('⚠️ [END TURN] Already ending turn, ignoring duplicate call');
            return;
        }
        this.endingTurn = true;

        // Reset execution guard
        this.isExecutingTurn = false;

        const players = [...store.state.players];
        const currentPlayer = players[store.state.turnIndex];

        // 🍖 HUNGER SYSTEM: Check every 3 turns
        if (currentPlayer && currentPlayer.stats) {
            console.log(`🍖 [HUNGER DEBUG] ${currentPlayer.name} turnCounter before: ${currentPlayer.stats.turnCounter}`);
            currentPlayer.stats.turnCounter++;
            console.log(`🍖 [HUNGER DEBUG] ${currentPlayer.name} turnCounter after: ${currentPlayer.stats.turnCounter}`);

            if (currentPlayer.stats.turnCounter >= 3) {
                currentPlayer.stats.turnCounter = 0; // Reset counter

                if (currentPlayer.stats.food > 0) {
                    currentPlayer.stats.food--;
                    console.log(`🍖 [HUNGER] ${currentPlayer.name} consumed 1 food. Remaining: ${currentPlayer.stats.food}`);
                    bus.emit('SHOW_NOTIFICATION', { message: `🍖 ${currentPlayer.name} consumió 1 comida`, type: 'info' });
                    bus.emit('RESOURCE_CHANGE', { icon: '🍗', amount: '-1', color: '#f59e0b' });
                } else {
                    currentPlayer.stats.life--;
                    console.log(`💀 [STARVATION] ${currentPlayer.name} lost 1 life! Remaining: ${currentPlayer.stats.life}`);
                    bus.emit('SHOW_NOTIFICATION', { message: `💀 ${currentPlayer.name} perdió 1 vida por hambre!`, type: 'danger' });
                    bus.emit('RESOURCE_CHANGE', { icon: '❤️', amount: '-1', color: '#ef4444' });

                    // Check for death
                    if (currentPlayer.stats.life <= 0) {
                        console.log(`☠️ [DEATH] ${currentPlayer.name} has died from starvation!`);
                        bus.emit('PLAYER_DIED', { player: currentPlayer, cause: 'starvation' });
                    }
                }
            }
        }

        const nextTurn = (store.state.turnIndex + 1) % players.length;
        const nextPlayer = players[nextTurn];

        store.setPlayers(players);
        store.updateTurn(nextTurn);

        // Emit turn change event for UI to show transition
        if (store.state.role === 'OFFLINE' && nextPlayer) {
            bus.emit('TURN_CHANGED', {
                player: nextPlayer,
                playerIndex: nextTurn,
                totalPlayers: players.length
            });
        }

        this.syncState();
    }

    // Handle combat defeat - retreat player
    handleCombatDefeat({ player, needsRetreat, shieldUsed }) {
        if (!needsRetreat || shieldUsed) {
            console.log('🛡️ [RETREAT] No retreat needed (shield used or no damage)');
            return;
        }

        console.log(`🏃 [RETREAT] ${player.name} must retreat!`);

        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);
        if (!playerData) return;

        const currentPos = playerData.pos;

        // Find previous tile (retreat 1 step)
        let retreatPos = this.findRetreatTile(currentPos, players);

        if (retreatPos) {
            console.log(`🏃 [RETREAT] Retreating from ${currentPos} to ${retreatPos}`);

            // Mark as immune to tile effects after retreat
            playerData.immuneToTileEffect = true;
            playerData.pos = retreatPos;
            store.setPlayers(players);

            // Animate retreat
            bus.emit('PLAYER_MOVING', {
                playerId: playerData.id,
                path: [currentPos, retreatPos]
            });

            bus.emit('SHOW_NOTIFICATION', {
                message: `${player.name} retrocede a casilla ${retreatPos}`,
                type: 'warning'
            });
        } else {
            console.log('🏃 [RETREAT] No retreat position available');
        }
    }

    // Find empty tile to retreat to
    findRetreatTile(currentPos, players) {
        const currentNode = this.boardGraph[currentPos];
        if (!currentNode) return null;

        // Get all occupied positions
        const occupiedPositions = new Set(players.map(p => String(p.pos)));

        // Try to find previous tile by looking at what connects TO current position
        for (const [tileId, node] of Object.entries(this.boardGraph)) {
            const nextTiles = Array.isArray(node.next) ? node.next : [node.next];

            if (nextTiles.includes(currentPos) || nextTiles.includes(String(currentPos))) {
                // This tile leads to current position - potential retreat spot
                if (!occupiedPositions.has(tileId) || tileId === currentPos) {
                    console.log(`🔍 [RETREAT] Found retreat tile: ${tileId}`);
                    return tileId;
                }
            }
        }

        // Fallback: go back to position 0 if no other option
        if (!occupiedPositions.has('0')) {
            return '0';
        }

        return null;
    }

    // Handle player death
    handlePlayerDeath({ player, cause }) {
        console.log(`☠️ [DEATH] ${player.name} has died! Cause: ${cause}`);

        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);

        if (playerData) {
            playerData.isDead = true;
            playerData.deathCause = cause;
            store.setPlayers(players);
        }

        // Count alive players
        const alivePlayers = players.filter(p => !p.isDead);
        console.log(`  Alive players: ${alivePlayers.length}`);

        // Show death notification
        bus.emit('SHOW_NOTIFICATION', {
            message: `☠️ ${player.name} ha muerto (${cause === 'starvation' ? 'hambre' : 'combate'})`,
            type: 'danger'
        });

        // Check game over conditions
        if (alivePlayers.length === 0) {
            // All players dead - Game Over
            console.log('🎮 [GAME OVER] All players eliminated!');
            setTimeout(() => bus.emit('GAME_OVER', { winner: null, reason: 'all_dead' }), 2000);
        } else if (alivePlayers.length === 1 && players.length > 1) {
            // Only one player left in multiplayer - They win!
            console.log(`🏆 [VICTORY] ${alivePlayers[0].name} is the last survivor!`);
            setTimeout(() => bus.emit('GAME_OVER', { winner: alivePlayers[0], reason: 'last_survivor' }), 2000);
        } else if (players.length === 1 && playerData.isDead) {
            // Single player died - Game Over
            console.log('🎮 [GAME OVER] Single player eliminated!');
            setTimeout(() => bus.emit('GAME_OVER', { winner: null, reason: 'player_died' }), 2000);
        }
    }

    // checkTileEvent removed (duplicate)

    handleNetworkData(data) {
        // Heartbeat handlers
        if (data.type === 'PING') {
            network.send({ type: 'PONG', timestamp: data.timestamp });
            return;
        }
        if (data.type === 'PONG') {
            network.handlePong();
            return;
        }

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
        } else if (data.type === 'CHAT_MESSAGE') {
            // Emit chat message to UI
            bus.emit('CHAT_RECEIVED', {
                message: data.message,
                playerName: data.playerName,
                timestamp: data.timestamp,
                isRemote: true
            });
        }
    }

    startOnlineSession() {
        // Trigger char select for everyone
        network.send({ type: 'GAME_START' });
        bus.emit('SHOW_CHAR_SELECT', CLASSES);
    }

    // Called when PvP encounter ends (peace, combat, or retreat)
    onPvPEncounterEnd() {
        console.log('🏁 [PVP] Encounter ended, resetting turn state');
        // Reset the guard flag so next player can roll
        this.isExecutingTurn = false;
        // End current player's turn
        this.endTurn();
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
