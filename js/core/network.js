import { bus } from './event-bus.js';

export class NetworkManager {
    constructor() {
        this.peer = null;
        this.conn = null;
    }

    init(role, hostId = null) {
        if (role === 'OFFLINE') {
            bus.emit('NETWORK_READY', { myId: 'OFFLINE_1' });
            return;
        }

        const peerId = role === 'HOST' ? this.generateShortId() : null;
        this.peer = new Peer(peerId, { debug: 2 });

        this.peer.on('open', (id) => {
            bus.emit('NETWORK_READY', { myId: id });

            if (role === 'HOST') {
                this.peer.on('connection', (conn) => this.handleConnection(conn));
            } else if (role === 'CLIENT' && hostId) {
                const conn = this.peer.connect(hostId);
                this.handleConnection(conn);
            }
        });

        this.peer.on('error', (err) => {
            console.error(err);
            bus.emit('NETWORK_ERROR', err);
        });
    }

    handleConnection(conn) {
        this.conn = conn;
        conn.on('open', () => {
            bus.emit('NETWORK_CONNECTED', { peerId: conn.peer });
            // Start connection monitoring
            this.startHeartbeat();
        });

        conn.on('data', (data) => {
            bus.emit('NETWORK_DATA', data);
        });

        conn.on('close', () => {
            this.handleDisconnect();
        });
    }

    send(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }

    // Send chat message
    sendChat(message, playerName) {
        this.send({
            type: 'CHAT_MESSAGE',
            message,
            playerName,
            timestamp: Date.now()
        });
    }

    // Check if connected
    isConnected() {
        return this.conn && this.conn.open;
    }

    // Start connection monitoring (heartbeat)
    startHeartbeat() {
        if (this.heartbeatInterval) return;

        this.lastPong = Date.now();

        this.heartbeatInterval = setInterval(() => {
            if (!this.conn || !this.conn.open) {
                this.handleDisconnect();
                return;
            }

            // Send ping
            this.send({ type: 'PING', timestamp: Date.now() });

            // Check if we haven't heard back in 10 seconds
            if (Date.now() - this.lastPong > 10000) {
                console.warn('⚠️ [NETWORK] Connection seems stale...');
                bus.emit('NETWORK_UNSTABLE');
            }
        }, 3000);
    }

    // Handle pong response
    handlePong() {
        this.lastPong = Date.now();
    }

    // Handle disconnect
    handleDisconnect() {
        console.error('❌ [NETWORK] Disconnected!');
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
        bus.emit('NETWORK_DISCONNECTED');
    }

    // Save game state for reconnection
    saveGameState(state) {
        try {
            const saveData = {
                players: state.players,
                turnIndex: state.turnIndex,
                roomId: this.peer?.id,
                timestamp: Date.now()
            };
            localStorage.setItem('gameState_backup', JSON.stringify(saveData));
            console.log('💾 [NETWORK] Game state saved');
        } catch (e) {
            console.warn('Could not save game state:', e);
        }
    }

    // Load saved game state
    loadGameState() {
        try {
            const data = localStorage.getItem('gameState_backup');
            if (!data) return null;

            const parsed = JSON.parse(data);
            // Only use if less than 1 hour old
            if (Date.now() - parsed.timestamp < 3600000) {
                return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    // Clear saved state
    clearGameState() {
        localStorage.removeItem('gameState_backup');
    }

    generateShortId() {
        return 'R80-' + Math.floor(1000 + Math.random() * 9000);
    }
}

export const network = new NetworkManager();
