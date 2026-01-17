// Tile Event Manager - Maneja eventos al caer en casillas
import { bus } from './event-bus.js';
import { store } from './game-state.js';
import { getTileType, hasTileEvent } from '../data/tile-types.js';
import { LUCK_CARDS, EVENT_CARDS, clampResource } from '../data/rpg-data.js';
import { combatManager } from './combat-manager.js';

export class TileEventManager {
    constructor() {
        this.processingEvent = false;
    }

    // Verificar y ejecutar evento de casilla
    checkTileEvent(player, tileId) {
        if (this.processingEvent) {
            console.warn('⚠️ [TILE EVENT] Already processing event');
            return;
        }

        const tileType = getTileType(tileId);
        console.log(`📍 [TILE EVENT] Player ${player.name} landed on tile ${tileId} (${tileType.id})`);

        if (!hasTileEvent(tileId)) {
            console.log('  No event on this tile');
            bus.emit('TILE_EVENT_COMPLETE', { hasEvent: false });
            return;
        }

        this.processingEvent = true;

        switch (tileType.id) {
            case 'zombie':
                this.handleZombieTile(player);
                break;
            case 'event':
                this.handleEventTile(player);
                break;
            case 'luck':
                this.handleLuckTile(player);
                break;
            default:
                this.processingEvent = false;
                bus.emit('TILE_EVENT_COMPLETE', { hasEvent: false });
        }
    }

    // Casilla de Zombie - Combate automático
    handleZombieTile(player) {
        console.log('🧟 [TILE EVENT] Zombie encounter!');

        // 50% chance 1 zombie, 50% chance 2 zombies
        const enemyCount = Math.random() < 0.5 ? 1 : 2;

        bus.emit('SHOW_NOTIFICATION', {
            message: `¡${enemyCount} zombie${enemyCount > 1 ? 's' : ''} te atacan!`,
            type: 'danger'
        });

        // Iniciar combate después de breve delay para que se vea notificación
        setTimeout(() => {
            combatManager.startCombat(player, enemyCount, 'zombie');
        }, 500);

        // Escuchar fin de combate
        const onCombatEnd = () => {
            bus.off('COMBAT_END', onCombatEnd);
            this.processingEvent = false;
            bus.emit('TILE_EVENT_COMPLETE', { hasEvent: true, type: 'combat' });
        };
        bus.on('COMBAT_END', onCombatEnd);
    }

    // Casilla de Evento - Carta aleatoria (puede ser combate u otro efecto)
    handleEventTile(player) {
        console.log('❓ [TILE EVENT] Event card!');

        const card = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
        console.log(`  Card: ${card.title}`);

        if (card.type === 'combat') {
            // Carta de combate
            bus.emit('SHOW_CARD', {
                type: 'EVENT',
                card: { ...card, showCombat: true }
            });

            const onCardClosed = () => {
                bus.off('UI_CARD_CLOSED', onCardClosed);
                combatManager.startCombat(player, card.enemyCount || 1, card.enemyType || 'zombie');

                const onCombatEnd = () => {
                    bus.off('COMBAT_END', onCombatEnd);
                    this.processingEvent = false;
                    bus.emit('TILE_EVENT_COMPLETE', { hasEvent: true, type: 'combat' });
                };
                bus.on('COMBAT_END', onCombatEnd);
            };
            bus.on('UI_CARD_CLOSED', onCardClosed);
        } else {
            // Carta de efecto directo
            const players = [...store.state.players];
            const playerData = players.find(p => p.id === player.id);

            if (card.effect && playerData.stats) {
                card.effect(playerData.stats);
                store.setPlayers(players);
            }

            bus.emit('SHOW_CARD', { type: 'EVENT', card });

            const onCardClosed = () => {
                bus.off('UI_CARD_CLOSED', onCardClosed);
                this.processingEvent = false;
                bus.emit('TILE_EVENT_COMPLETE', { hasEvent: true, type: 'event' });
            };
            bus.on('UI_CARD_CLOSED', onCardClosed);
        }
    }

    // Casilla de Suerte - Carta de loot
    handleLuckTile(player) {
        console.log('🍀 [TILE EVENT] Luck card!');

        const card = LUCK_CARDS[Math.floor(Math.random() * LUCK_CARDS.length)];
        console.log(`  Card: ${card.title}`);

        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);

        if (card.effect && playerData.stats) {
            card.effect(playerData.stats);
            store.setPlayers(players);
        }

        bus.emit('SHOW_CARD', { type: 'LOOT', card });

        const onCardClosed = () => {
            bus.off('UI_CARD_CLOSED', onCardClosed);
            this.processingEvent = false;
            bus.emit('TILE_EVENT_COMPLETE', { hasEvent: true, type: 'loot' });
        };
        bus.on('UI_CARD_CLOSED', onCardClosed);
    }
}

export const tileEventManager = new TileEventManager();
