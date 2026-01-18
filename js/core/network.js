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
        });

        conn.on('data', (data) => {
            bus.emit('NETWORK_DATA', data);
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

    generateShortId() {
        return 'R80-' + Math.floor(1000 + Math.random() * 9000);
    }
}

export const network = new NetworkManager();
