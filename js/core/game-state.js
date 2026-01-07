// Estado Global del Juego (Singleton)
import { bus } from './event-bus.js';

class GameState {
    constructor() {
        this.state = {
            lobby: 'WAITING', // WAITING, CONNECTING, PLAYING
            role: null,       // 'HOST', 'CLIENT', 'OFFLINE'
            myId: null,
            players: [],      // Array de jugadores
            turnIndex: 0,
            isMyTurn: false
        };
    }

    init(role, myId, playerCount = 1) {
        this.state.role = role;
        this.state.myId = myId;
        // Si es offline, inicializamos dummy names
        if (role === 'OFFLINE') {
            this.state.players = [];
            for (let i = 1; i <= playerCount; i++) {
                this.state.players.push({ id: `OFFLINE_${i}`, name: `Jugador ${i}`, pos: '1', stats: null });
            }
            // Set first player as current "myId" logic for compatibility, although in hotseat we switch perspective
            this.state.myId = 'OFFLINE_1';
        }
        bus.emit('STATE_INIT', this.state);
    }

    setPlayers(players) {
        this.state.players = players;
        bus.emit('STATE_UPDATED', this.state);
    }

    updateTurn(turnIndex) {
        this.state.turnIndex = turnIndex;
        // Check if it's my turn
        const activePlayer = this.state.players[turnIndex];
        if (!activePlayer) return;

        this.state.isMyTurn = (this.state.role === 'OFFLINE' || activePlayer.id === this.state.myId);
        bus.emit('TURN_CHANGED', { turnIndex, isMyTurn: this.state.isMyTurn });
    }

    getPlayer(id) {
        return this.state.players.find(p => p.id === id);
    }

    getActivePlayer() {
        return this.state.players[this.state.turnIndex];
    }
}

export const store = new GameState();
