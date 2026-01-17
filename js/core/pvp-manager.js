// PvP Manager - Sistema de encuentros jugador vs jugador
import { bus } from './event-bus.js';
import { store } from './game-state.js';
import { combatManager } from './combat-manager.js';

export class PvPManager {
    constructor() {
        this.pendingEncounter = null;
        this.waitingForResponse = false;
    }

    // Check if landing on a tile with another player
    checkPvPEncounter(movingPlayer, tileId) {
        const players = store.state.players;

        // Find all other players on this tile
        const playersOnTile = players.filter(p =>
            String(p.pos) === String(tileId) &&
            p.id !== movingPlayer.id &&
            !p.isDead
        );

        if (playersOnTile.length === 0) {
            console.log(`🔍 [PVP] No other players on tile ${tileId}`);
            return false;
        }

        console.log(`⚔️ [PVP] Encounter! ${movingPlayer.name} meets ${playersOnTile.map(p => p.name).join(', ')} on tile ${tileId}`);

        // For simplicity, handle encounter with first player found
        const defender = playersOnTile[0];

        this.pendingEncounter = {
            attacker: movingPlayer,  // Player who just arrived
            defender: defender,       // Player who was already there
            tileId: tileId,
            phase: 'defender_choice'  // Defender decides first
        };

        // Show decision modal to defender
        this.showDefenderChoice();
        return true;
    }

    // Phase 1: Defender (player who was on tile) chooses
    showDefenderChoice() {
        const { defender, attacker } = this.pendingEncounter;

        console.log(`🎭 [PVP] Phase 1: ${defender.name} must decide`);

        bus.emit('SHOW_PVP_DECISION', {
            phase: 'defender_choice',
            player: defender,
            opponent: attacker,
            options: [
                { id: 'peace', text: '🕊️ Proponer Paz', desc: 'Dejar pasar sin conflicto' },
                { id: 'attack', text: '⚔️ Atacar', desc: 'Iniciar combate inmediato' },
                { id: 'retreat', text: '🏃 Retroceder', desc: 'Huir (-1 comida)' }
            ]
        });

        this.waitingForResponse = true;
    }

    // Phase 2: Attacker responds to peace offer
    showAttackerChoice() {
        const { defender, attacker } = this.pendingEncounter;

        console.log(`🎭 [PVP] Phase 2: ${attacker.name} must decide`);

        bus.emit('SHOW_PVP_DECISION', {
            phase: 'attacker_choice',
            player: attacker,
            opponent: defender,
            options: [
                { id: 'accept_peace', text: '✅ Aceptar Paz', desc: 'Convivir pacíficamente' },
                { id: 'betray', text: '🗡️ Traicionar', desc: '¡Atacar por sorpresa!' }
            ]
        });

        this.waitingForResponse = true;
    }

    // Handle decision from players
    handleDecision(playerId, decision) {
        if (!this.pendingEncounter) {
            console.warn('⚠️ [PVP] No pending encounter');
            return;
        }

        const { defender, attacker, phase } = this.pendingEncounter;

        console.log(`🎯 [PVP] Decision: ${decision} from ${playerId}`);

        if (phase === 'defender_choice') {
            // Defender made a choice
            switch (decision) {
                case 'peace':
                    // Defender offers peace, attacker must decide
                    this.pendingEncounter.phase = 'attacker_choice';
                    bus.emit('SHOW_NOTIFICATION', {
                        message: `🕊️ ${defender.name} propone paz`,
                        type: 'info'
                    });
                    setTimeout(() => this.showAttackerChoice(), 1000);
                    break;

                case 'attack':
                    // Immediate combat
                    bus.emit('SHOW_NOTIFICATION', {
                        message: `⚔️ ${defender.name} ataca a ${attacker.name}!`,
                        type: 'danger'
                    });
                    this.startPvPCombat(defender, attacker);
                    break;

                case 'retreat':
                    // Defender retreats, loses 1 food
                    this.handleRetreat(defender);
                    break;
            }
        } else if (phase === 'attacker_choice') {
            // Attacker responding to peace offer
            switch (decision) {
                case 'accept_peace':
                    // Peace accepted
                    bus.emit('SHOW_NOTIFICATION', {
                        message: `🕊️ ${attacker.name} acepta la paz`,
                        type: 'success'
                    });
                    this.endEncounter('peace');
                    break;

                case 'betray':
                    // BETRAYAL!
                    bus.emit('SHOW_NOTIFICATION', {
                        message: `🗡️ ¡${attacker.name} TRAICIONA a ${defender.name}!`,
                        type: 'danger'
                    });
                    // Betrayer gets first strike advantage (bonus to roll)
                    this.startPvPCombat(attacker, defender, true);
                    break;
            }
        }
    }

    // Handle retreat
    handleRetreat(player) {
        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);

        if (!playerData) return;

        // Lose 1 food
        playerData.stats.food = Math.max(0, playerData.stats.food - 1);

        // Find retreat position (would need board logic)
        // For now, just mark as retreated
        playerData.hasRetreated = true;

        store.setPlayers(players);

        bus.emit('SHOW_NOTIFICATION', {
            message: `🏃 ${player.name} huye (-1 comida)`,
            type: 'warning'
        });

        bus.emit('PVP_RETREAT', { player });
        this.endEncounter('retreat');
    }

    // Start PvP combat
    startPvPCombat(initiator, target, isBetray = false) {
        console.log(`⚔️ [PVP COMBAT] ${initiator.name} vs ${target.name}${isBetray ? ' (BETRAYAL!)' : ''}`);

        this.pendingEncounter.inCombat = true;

        // Use existing combat manager but mark as PvP
        bus.emit('PVP_COMBAT_START', {
            player1: initiator,
            player2: target,
            isBetray: isBetray
        });

        // Roll dice for both players
        setTimeout(() => this.rollPvPCombat(initiator, target, isBetray), 1000);
    }

    // PvP combat roll - Uses WEAPONS as dice count!
    rollPvPCombat(player1, player2, isBetray) {
        const stats1 = player1.stats || { weapons: 1 };
        const stats2 = player2.stats || { weapons: 1 };

        // Roll dice equal to weapons (minimum 1)
        const diceCount1 = Math.max(1, stats1.weapons || 1);
        const diceCount2 = Math.max(1, stats2.weapons || 1);

        // Roll all dice and take the best
        let roll1 = 0;
        for (let i = 0; i < diceCount1; i++) {
            roll1 = Math.max(roll1, Math.floor(Math.random() * 6) + 1);
        }

        let roll2 = 0;
        for (let i = 0; i < diceCount2; i++) {
            roll2 = Math.max(roll2, Math.floor(Math.random() * 6) + 1);
        }

        // Betrayal bonus: +1 to roll
        if (isBetray) {
            roll1 += 1;
            console.log(`🗡️ [BETRAY BONUS] ${player1.name} gets +1`);
        }

        console.log(`🎲 [PVP ROLL] ${player1.name}: ${roll1} (${diceCount1} dados) vs ${player2.name}: ${roll2} (${diceCount2} dados)`);

        bus.emit('PVP_COMBAT_ROLL', {
            player1, roll1, diceCount1,
            player2, roll2, diceCount2,
            isBetray
        });

        // Resolve after animation
        setTimeout(() => this.resolvePvPCombat(player1, roll1, player2, roll2), 1500);
    }

    // Resolve PvP combat
    resolvePvPCombat(player1, roll1, player2, roll2) {
        if (roll1 === roll2) {
            // Tie - re-roll
            console.log('🔄 [PVP] Tie! Re-rolling...');
            bus.emit('SHOW_NOTIFICATION', { message: '🔄 ¡Empate! Tirando de nuevo...', type: 'info' });
            setTimeout(() => this.rollPvPCombat(player1, player2, false), 1000);
            return;
        }

        const winner = roll1 > roll2 ? player1 : player2;
        const loser = roll1 > roll2 ? player2 : player1;
        const difference = Math.abs(roll1 - roll2);

        console.log(`🏆 [PVP] Winner: ${winner.name}, Loser: ${loser.name}, Diff: ${difference}`);

        // Apply damage and loot
        const players = [...store.state.players];
        const loserData = players.find(p => p.id === loser.id);
        const winnerData = players.find(p => p.id === winner.id);

        if (loserData && loserData.stats && winnerData && winnerData.stats) {
            // Check shield first
            if (difference === 1 && loserData.stats.shield > 0) {
                loserData.stats.shield--;
                bus.emit('SHOW_NOTIFICATION', {
                    message: `🛡️ ${loser.name} bloquea con escudo!`,
                    type: 'info'
                });
            } else {
                // Take damage
                loserData.stats.life = Math.max(0, loserData.stats.life - 1);

                // LOOT: Winner takes ALL of loser's weapons
                const stolenWeapons = loserData.stats.weapons;
                if (stolenWeapons > 0) {
                    winnerData.stats.weapons = Math.min(5, winnerData.stats.weapons + stolenWeapons);
                    loserData.stats.weapons = 0;
                    bus.emit('SHOW_NOTIFICATION', {
                        message: `⚔️ ${winner.name} roba ${stolenWeapons} arma(s)!`,
                        type: 'warning'
                    });
                }

                // Also steal food if any
                if (loserData.stats.food > 0) {
                    const stolenFood = Math.min(2, loserData.stats.food);
                    winnerData.stats.food = Math.min(5, winnerData.stats.food + stolenFood);
                    loserData.stats.food = Math.max(0, loserData.stats.food - stolenFood);
                    bus.emit('SHOW_NOTIFICATION', {
                        message: `🍖 ${winner.name} roba ${stolenFood} comida!`,
                        type: 'warning'
                    });
                }

                // Check death
                if (loserData.stats.life <= 0) {
                    loserData.isDead = true;
                    bus.emit('PLAYER_DIED', { player: loserData, cause: 'pvp' });
                }
            }

            store.setPlayers(players);
        }

        bus.emit('PVP_COMBAT_END', { winner, loser });
        this.endEncounter('combat', winner);
    }

    // End the encounter
    endEncounter(result, winner = null) {
        console.log(`✅ [PVP] Encounter ended: ${result}`);

        this.waitingForResponse = false;
        const encounter = this.pendingEncounter;
        this.pendingEncounter = null;

        bus.emit('PVP_ENCOUNTER_END', {
            result,
            winner,
            attacker: encounter?.attacker,
            defender: encounter?.defender
        });
    }

    // Check if waiting for player input
    isActive() {
        return this.pendingEncounter !== null;
    }
}

export const pvpManager = new PvPManager();
