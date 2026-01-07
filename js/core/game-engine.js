import { bus } from './event-bus.js';
import { store } from './game-state.js';
import { network } from './network.js';
import { buildGraph } from '../data/map-data.js';
import { CLASSES, LUCK_CARDS } from '../data/rpg-data.js';

export class GameEngine {
    constructor() {
        this.boardGraph = buildGraph();
        this.initListeners();
    }

    initListeners() {
        bus.on('UI_START_OFFLINE', (count) => this.startGame('OFFLINE', null, count));
        bus.on('UI_CREATE_ROOM', () => this.startGame('HOST'));
        bus.on('UI_JOIN_ROOM', (code) => this.startGame('CLIENT', code));

        bus.on('UI_CLASS_SELECTED', (cls) => this.handleClassSelection(cls));
        bus.on('UI_ACTION_ROLL', () => this.handleRoll());

        bus.on('NETWORK_CONNECTED', (data) => this.handlePlayerJoined(data));
        bus.on('NETWORK_READY', (data) => this.handleNetworkReady(data));
        bus.on('NETWORK_DATA', (data) => this.handleNetworkData(data));
    }

    startGame(role, hostId = null, playerCount = 1) {
        store.init(role, null, playerCount); // Pass playerCount
        network.init(role, hostId);

        if (role === 'OFFLINE') {
            // Iniciar secuencia de selección para N jugadores
            store.state.totalPlayers = playerCount;
            store.state.playersReady = 0;
            setTimeout(() => this.askNextCharSelection(), 600);
        } else if (role === 'HOST') {
            setTimeout(() => bus.emit('SHOW_CHAR_SELECT', CLASSES), 600);
        }
    }

    askNextCharSelection() {
        const pNum = store.state.playersReady + 1;
        bus.emit('SHOW_CHAR_SELECT', { classes: CLASSES, msg: `Jugador ${pNum}: Elige tu clase` });
    }

    handleNetworkReady(data) {
        store.state.myId = data.myId;
    }

    handlePlayerJoined(data) {
        if (store.state.role === 'HOST') {
            const newPlayers = [
                { id: store.state.myId, name: 'Anfitrión', pos: '1', stats: null },
                { id: data.peerId, name: 'Invitado', pos: '1', stats: null }
            ];
            store.setPlayers(newPlayers);
            this.syncState();
        }
    }

    handleClassSelection(cls) {
        let myId = store.state.myId;
        const role = store.state.role;

        // logic for Offline Hotseat Sequential Pick
        if (role === 'OFFLINE') {
            myId = `OFFLINE_${store.state.playersReady + 1}`;
        }

        const newStats = { life: cls.life, maxLife: 5, food: cls.food, weapons: cls.weapons };

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

        // Si soy HOST u OFFLINE, ejecuto la lógica
        this.executeTurn(state.turnIndex);
    }

    async executeTurn(pIndex) {
        const players = [...store.state.players];
        const player = players[pIndex];

        // 1. Food Check
        if (player.stats.food > 0) player.stats.food--;
        else {
            player.stats.life = Math.max(0, player.stats.life - 1);
            if (player.stats.life === 0) {
                alert('Muerte súbita (Respawn)'); // Simplificado
                player.stats.life = 2;
                player.stats.food = 2;
            }
        }

        // 2. Roll & Animation Signal
        const roll = Math.floor(Math.random() * 6) + 1;

        // Broadcast roll animation
        bus.emit('DICE_ROLLED', roll);
        network.send({ type: 'DICE_ROLLED', value: roll });

        // Wait for animation (e.g., 2 seconds)
        await new Promise(r => setTimeout(r, 2000));

        // 3. Move Animation
        let remaining = roll;
        let currentPos = player.pos;

        while (remaining > 0) {
            await new Promise(r => setTimeout(r, 400));
            const node = this.boardGraph[currentPos];
            if (!node) break;

            if (currentPos === '80') break;

            if (Array.isArray(node.next)) {
                currentPos = node.next[0]; // Auto-branch logic simplified
            } else {
                currentPos = node.next;
            }

            player.pos = currentPos;
            remaining--;

            store.setPlayers(players);
            this.syncState();
        }

        // Eventos de casilla
        this.checkTileEvent(player);

        // Pasamos turno
        const nextTurn = (store.state.turnIndex + 1) % players.length;
        store.setPlayers(players);
        store.updateTurn(nextTurn);
        this.syncState();
    }

    checkTileEvent(player) {
        // En arquitectura pura, no deberíamos leer el DOM aquí.
        // Pero como el mapa se genera en UI, necesitamos saber qué es qué.
        // Solución ideal: El grafo tiene metadatos de tipo de casilla.
        // Solución rápida refactor: Usar los metadatos del grafo si existen, 
        // o leer el DOM (hacky pero funcional para refactor 1:1).

        // Asumimos azar simple por ahora para no complicar el refactor
        // TODO: Mover tipos de casillas a map-data.js
        if (Math.random() < 0.2) {
            // Loot
            const card = LUCK_CARDS[Math.floor(Math.random() * LUCK_CARDS.length)];
            if (card.effect) card.effect(player.stats);
        }
    }

    handleNetworkData(data) {
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
                    store.setPlayers(players);
                    // Si todos están listos
                    if (players.every(pl => pl.stats)) {
                        this.syncState();
                    }
                }
            }
        }
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
