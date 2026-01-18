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

        // Check for retreat immunity
        if (player.immuneToTileEffect) {
            console.log(`🛡️ [TILE EVENT] Player ${player.name} is immune (retreat protection)`);
            bus.emit('TILE_EVENT_COMPLETE', { hasEvent: false, immune: true });
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
            case 'market':
                this.handleMarketTile(player);
                break;
            case 'safe':
                this.handleSafeTile(player);
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

    // Casilla de Mercado - Intercambiar recursos
    handleMarketTile(player) {
        console.log('🏪 [TILE EVENT] Market!');

        bus.emit('SHOW_NOTIFICATION', {
            message: `🏪 ¡Bienvenido al Mercado!`,
            type: 'info'
        });

        // Show market UI
        bus.emit('SHOW_MARKET', { player });

        // Wait for market to close
        const onMarketClosed = () => {
            bus.off('UI_MARKET_CLOSED', onMarketClosed);
            this.processingEvent = false;
            bus.emit('TILE_EVENT_COMPLETE', { hasEvent: true, type: 'market' });
        };
        bus.on('UI_MARKET_CLOSED', onMarketClosed);
    }

    // Casilla Segura - Descanso y recuperación
    handleSafeTile(player) {
        console.log('🏠 [TILE EVENT] Safe zone!');

        const players = [...store.state.players];
        const playerData = players.find(p => p.id === player.id);

        if (playerData && playerData.stats) {
            // Recover 1 life (up to max)
            const oldLife = playerData.stats.life;
            playerData.stats.life = Math.min(playerData.stats.life + 1, 6); // MAX_LIFE = 6

            const lifeGained = playerData.stats.life - oldLife;

            if (lifeGained > 0) {
                store.setPlayers(players);
                bus.emit('SHOW_NOTIFICATION', {
                    message: `🏠 ¡Zona Segura! ${player.name} recupera +1 ❤️`,
                    type: 'success'
                });
                console.log(`  ${player.name} recovered 1 life. Now: ${playerData.stats.life}`);
            } else {
                bus.emit('SHOW_NOTIFICATION', {
                    message: `🏠 Zona Segura - ${player.name} ya tiene vida máxima`,
                    type: 'info'
                });
            }
        }

        this.processingEvent = false;
        bus.emit('TILE_EVENT_COMPLETE', { hasEvent: true, type: 'safe' });
    }
}

export const tileEventManager = new TileEventManager();
