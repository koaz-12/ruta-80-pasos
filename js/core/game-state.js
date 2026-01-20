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
            isMyTurn: false,
            currentDay: 1     // Day counter (1 day = 1 full round)
        };
    }

    init(role, myId, playerCount = 1) {
        this.state.role = role;
        this.state.myId = myId;
        this.state.currentDay = 1; // Reset day counter
        // Si es offline, inicializamos dummy names
        if (role === 'OFFLINE') {
            this.state.players = [];
            for (let i = 1; i <= playerCount; i++) {
                this.state.players.push({ id: `OFFLINE_${i}`, name: `Jugador ${i}`, pos: '0', stats: null });
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
        // Check if a new day starts (when turnIndex wraps back to 0)
        if (turnIndex === 0 && this.state.turnIndex !== 0) {
            this.state.currentDay++;
            console.log(`🌅 [DAY] New day: ${this.state.currentDay}`);
            bus.emit('DAY_CHANGED', { day: this.state.currentDay });
        }

        this.state.turnIndex = turnIndex;
        // Check if it's my turn
        const activePlayer = this.state.players[turnIndex];
        if (!activePlayer) return;

        this.state.isMyTurn = (this.state.role === 'OFFLINE' || activePlayer.id === this.state.myId);
        bus.emit('TURN_CHANGED', { turnIndex, isMyTurn: this.state.isMyTurn, currentDay: this.state.currentDay });
    }

    getPlayer(id) {
        return this.state.players.find(p => p.id === id);
    }

    getActivePlayer() {
        return this.state.players[this.state.turnIndex];
    }
}

export const store = new GameState();
