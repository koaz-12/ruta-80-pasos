// Combat Manager - Sistema de combate PvE
import { bus } from './event-bus.js';
import { store } from './game-state.js';
import { LUCK_CARDS, clampResource } from '../data/rpg-data.js';

export class CombatManager {
    constructor() {
        this.inCombat = false;
        this.currentCombat = null;
    }

    // Iniciar combate contra enemigo(s)
    // enemyLevel determines number of loot items: level 1 = 1 item, level 2 = 2 items, etc.
    startCombat(player, enemyCount = 1, enemyType = 'zombie', enemyLevel = 1) {
        if (this.inCombat) {
            console.warn('⚠️ [COMBAT] Already in combat!');
            return;
        }

        this.inCombat = true;
        this.isRolling = false; // Reset roll guard
        this.currentCombat = {
            player,
            enemyCount,
            enemyType,
            enemyLevel: Math.max(1, Math.min(4, enemyLevel)), // Clamp to 1-4
            round: 0,
            playerRoll: null,
            enemyRoll: null
        };

        console.log(`⚔️ [COMBAT] Starting combat: ${player.name} vs ${enemyCount}x ${enemyType} (Lvl ${enemyLevel})`);

        bus.emit('COMBAT_START', {
            player,
            enemyCount,
            enemyType,
            enemyLevel
        });
    }

    // Ejecutar ronda de combate
    rollCombat() {
        if (!this.inCombat || !this.currentCombat) {
            console.error('❌ [COMBAT] No active combat!');
            return;
        }

        // Guard against double rolls
        if (this.isRolling) {
            console.warn('⚠️ [COMBAT] Already rolling, ignoring duplicate');
            return;
        }
        this.isRolling = true;

        this.currentCombat.round++;

        // === MULTI-DICE SYSTEM ===
        // Player rolls dice = weapons + 1 (0 weapons = 1 die, 1 weapon = 2 dice, etc.)
        const weapons = this.currentCombat.player.stats?.weapons || 0;
        const playerDiceCount = weapons + 1;
        let playerRoll = 0;
        const playerDice = [];
        for (let i = 0; i < playerDiceCount; i++) {
            const die = Math.floor(Math.random() * 6) + 1;
            playerDice.push(die);
            playerRoll += die;
        }

        // Enemies roll dice equal to their count (sum all)
        const enemyCount = this.currentCombat.enemyCount;
        let enemyRoll = 0;
        const enemyDice = [];
        for (let i = 0; i < enemyCount; i++) {
            const die = Math.floor(Math.random() * 6) + 1;
            enemyDice.push(die);
            enemyRoll += die;
        }

        this.currentCombat.playerRoll = playerRoll;
        this.currentCombat.enemyRoll = enemyRoll;
        this.currentCombat.playerDice = playerDice;
        this.currentCombat.enemyDice = enemyDice;

        console.log(`🎲 [COMBAT] Round ${this.currentCombat.round}: Player ${playerDice.join('+')}=${playerRoll} (${playerDiceCount} dice) vs Enemy ${enemyDice.join('+')}=${enemyRoll} (${enemyCount} dice)`);

        bus.emit('COMBAT_ROLL', {
            playerRoll,
            enemyRoll,
            playerDice,
            enemyDice,
            playerDiceCount,
            enemyDiceCount: enemyCount,
            round: this.currentCombat.round
        });

        // Resolver resultado - store values locally to avoid race conditions
        const pRoll = playerRoll;
        const eRoll = enemyRoll;
        setTimeout(() => {
            this.isRolling = false;
            this.resolveCombat(pRoll, eRoll);
        }, 1500);
    }

    // Resolver combate
    resolveCombat(playerRoll, enemyRoll) {
        // Guard: Check if combat is still active
        if (!this.inCombat || !this.currentCombat) {
            console.warn('⚠️ [COMBAT] resolveCombat called but no active combat');
            return;
        }

        const combat = this.currentCombat;
        const player = combat.player;
        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);

        if (playerRoll === enemyRoll) {
            // EMPATE - Request manual re-roll with 20s timer
            console.log('🔄 [COMBAT] Tie! Player must re-roll...');
            bus.emit('COMBAT_TIE', { needsReroll: true });
            // Don't auto-roll - let UI handle the 20s timer
            return;
        }

        if (playerRoll > enemyRoll) {
            // VICTORIA
            console.log(`✅ [COMBAT] Victory! ${player.name} wins!`);
            this.handleVictory(playerData, players);
        } else {
            // DERROTA
            const difference = enemyRoll - playerRoll;
            console.log(`❌ [COMBAT] Defeat! ${player.name} loses (diff: ${difference})`);
            this.handleDefeat(playerData, players, difference);
        }

        this.endCombat();
    }

    // Manejar victoria
    handleVictory(player, players) {
        const enemyLevel = this.currentCombat?.enemyLevel || 1;
        const lootCount = enemyLevel; // Level 1 = 1 item, Level 2 = 2 items, etc.

        const lootCards = [];

        // Give loot based on enemy level
        for (let i = 0; i < lootCount; i++) {
            const lootCard = LUCK_CARDS[Math.floor(Math.random() * LUCK_CARDS.length)];
            lootCards.push(lootCard);

            // Apply effect
            if (lootCard.effect && player.stats) {
                lootCard.effect(player.stats);
            }
        }

        store.setPlayers(players);

        bus.emit('COMBAT_VICTORY', {
            player,
            loot: lootCards[0], // Primary loot for display
            allLoot: lootCards,
            lootCount
        });

        console.log(`🎁 [COMBAT] Loot x${lootCount}: ${lootCards.map(c => c.title).join(', ')}`);
    }

    // Manejar derrota
    handleDefeat(player, players, difference) {
        if (!player.stats) return;

        // Check escudo (protege si diferencia = 1)
        if (difference === 1 && player.stats.shield > 0) {
            player.stats.shield--;
            console.log(`🛡️ [COMBAT] Shield absorbed the hit! Shield remaining: ${player.stats.shield}`);

            bus.emit('COMBAT_SHIELD_BREAK', { player });
            store.setPlayers(players);

            bus.emit('COMBAT_DEFEAT', {
                player,
                shieldUsed: true,
                damage: 0
            });
            return;
        }

        // Sin escudo o diferencia > 1: Recibe daño
        player.stats.life = Math.max(0, player.stats.life - 1);
        console.log(`💔 [COMBAT] ${player.name} lost 1 life! Remaining: ${player.stats.life}`);

        // Perder arma si tiene más de 1
        if (player.stats.weapons > 1) {
            player.stats.weapons--;
            console.log(`🗡️ [COMBAT] ${player.name} lost 1 weapon! Remaining: ${player.stats.weapons}`);
        }

        store.setPlayers(players);

        // Check muerte
        if (player.stats.life <= 0) {
            console.log(`☠️ [COMBAT] ${player.name} has died in combat!`);
            bus.emit('PLAYER_DIED', { player, cause: 'combat' });
        }

        bus.emit('COMBAT_DEFEAT', {
            player,
            shieldUsed: false,
            damage: 1,
            needsRetreat: true
        });
    }

    // Finalizar combate
    endCombat() {
        this.inCombat = false;
        this.currentCombat = null;
        bus.emit('COMBAT_END', {});
    }
}

export const combatManager = new CombatManager();
