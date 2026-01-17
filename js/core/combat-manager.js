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
    startCombat(player, enemyCount = 1, enemyType = 'zombie') {
        if (this.inCombat) {
            console.warn('⚠️ [COMBAT] Already in combat!');
            return;
        }

        this.inCombat = true;
        this.currentCombat = {
            player,
            enemyCount,
            enemyType,
            round: 0,
            playerRoll: null,
            enemyRoll: null
        };

        console.log(`⚔️ [COMBAT] Starting combat: ${player.name} vs ${enemyCount}x ${enemyType}`);

        bus.emit('COMBAT_START', {
            player,
            enemyCount,
            enemyType
        });
    }

    // Ejecutar ronda de combate
    rollCombat() {
        if (!this.inCombat || !this.currentCombat) {
            console.error('❌ [COMBAT] No active combat!');
            return;
        }

        this.currentCombat.round++;

        // Tirar dados
        const playerRoll = Math.floor(Math.random() * 6) + 1;

        // Enemigo tira por cada uno (suma o max?)
        // Por simplicidad: cada enemigo tira, se usa el mejor
        let enemyRoll = 0;
        for (let i = 0; i < this.currentCombat.enemyCount; i++) {
            const roll = Math.floor(Math.random() * 6) + 1;
            enemyRoll = Math.max(enemyRoll, roll);
        }

        this.currentCombat.playerRoll = playerRoll;
        this.currentCombat.enemyRoll = enemyRoll;

        console.log(`🎲 [COMBAT] Round ${this.currentCombat.round}: Player ${playerRoll} vs Enemy ${enemyRoll}`);

        bus.emit('COMBAT_ROLL', {
            playerRoll,
            enemyRoll,
            round: this.currentCombat.round
        });

        // Resolver resultado
        setTimeout(() => this.resolveCombat(playerRoll, enemyRoll), 1500);
    }

    // Resolver combate
    resolveCombat(playerRoll, enemyRoll) {
        const combat = this.currentCombat;
        const player = combat.player;
        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);

        if (playerRoll === enemyRoll) {
            // EMPATE - Re-roll
            console.log('🔄 [COMBAT] Tie! Re-rolling...');
            bus.emit('COMBAT_TIE', {});
            setTimeout(() => this.rollCombat(), 1000);
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
        // Dar carta de suerte como loot
        const lootCard = LUCK_CARDS[Math.floor(Math.random() * LUCK_CARDS.length)];

        // Aplicar efecto
        if (lootCard.effect && player.stats) {
            lootCard.effect(player.stats);
            store.setPlayers(players);
        }

        bus.emit('COMBAT_VICTORY', {
            player,
            loot: lootCard
        });

        console.log(`🎁 [COMBAT] Loot: ${lootCard.title}`);
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
